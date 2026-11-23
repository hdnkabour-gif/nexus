#!/usr/bin/env bash
# PNEU upgrade + code-rollback rehearsal (fail-closed). Usage:
#   IMG_OLD=local/pneu-rc:ea55329 IMG_NEW=local/pneu-rc:162fe24 ./rehearse.sh [result.json]
# 1) the deployed version writes synthetic books; 2) the candidate starts on the same database
# (its entrypoint migrates); 3) the deployed version starts again on the migrated schema.
# Asserts: identical business figures at each step; only the expected migration ran; every
# table identical across the upgrade except the boot-reseeded reference catalogues, which may
# differ ONLY in their timestamp columns.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
IMG_OLD="${IMG_OLD:?set IMG_OLD (deployed version image)}"; IMG_NEW="${IMG_NEW:?set IMG_NEW (candidate image)}"
OUT="${1:-$WORK/rehearse-result.json}"
EXPECTED_MIGRATION="${EXPECTED_MIGRATION:-2026_11_20_100000_add_idempotency_to_payments,2026_11_23_090000_move_expense_receipts_to_private_disk}"
RESEEDED="oil_catalogue_references tyre_catalogue_references"   # reference data re-seeded at every boot
trap cleanup EXIT
make_env
fresh_db

start_app "$IMG_OLD"
run_php "$WEB" populate.php "$WORK/populate.out"
run_php "$WEB" snapshot.php "$WORK/A.json"
columns mouhim_rc "$WORK/cols.txt"                    # frozen BEFORE the upgrade
fingerprint mouhim_rc "$WORK/cols.txt" "$WORK/FA.txt"
docker exec "$DBC" psql -U mouhim_rc -d mouhim_rc -tAc 'select migration from migrations order by migration' > "$WORK/mig-before.txt" || die "cannot list migrations"
nots_hash() { # table -> md5 over every column except timestamps
  local c; c="$(docker exec "$DBC" psql -U mouhim_rc -d mouhim_rc -tAc "select string_agg(quote_ident(column_name),',' order by ordinal_position) from information_schema.columns where table_schema='public' and table_name='$1' and column_name not in ('created_at','updated_at')")"
  docker exec "$DBC" psql -U mouhim_rc -d mouhim_rc -tAc "select count(*)||':'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from (select $c from public.\"$1\") x" || die "hash failed on $1"
}
for t in $RESEEDED; do echo "$t $(nots_hash "$t")"; done > "$WORK/nots-before.txt"

start_app "$IMG_NEW"
run_php "$WEB" snapshot.php "$WORK/B.json"
fingerprint mouhim_rc "$WORK/cols.txt" "$WORK/FB.txt"
docker exec "$DBC" psql -U mouhim_rc -d mouhim_rc -tAc 'select migration from migrations order by migration' > "$WORK/mig-after.txt" || die "cannot list migrations"
NEW_MIG="$(comm -13 "$WORK/mig-before.txt" "$WORK/mig-after.txt" | tr '\n' ',' | sed 's/,$//')"
for t in $RESEEDED; do echo "$t $(nots_hash "$t")"; done > "$WORK/nots-after.txt"
assert_eq "migrations applied by the upgrade" "$NEW_MIG" "$EXPECTED_MIGRATION"

TABLES="$(wc -l < "$WORK/cols.txt")"
assert_eq "tables compared is non-zero" "$([ "$TABLES" -gt 0 ] && echo yes || echo no)" "yes"
CHANGED="$({ diff "$WORK/FA.txt" "$WORK/FB.txt" || true; } | sed -n 's/^> \([^ ]*\) .*/\1/p' | sort | tr '\n' ' ' | sed 's/ $//')"
UNEXPECTED=""; for t in $CHANGED; do case " $RESEEDED " in *" $t "*) ;; *) UNEXPECTED="$UNEXPECTED $t";; esac; done
assert_eq "tables changed outside the reseeded reference catalogues" "${UNEXPECTED# }" ""
for t in $RESEEDED; do   # allowed tables: identical once timestamps are left out
  assert_eq "$t identical apart from timestamps" "$(grep "^$t " "$WORK/nots-after.txt")" "$(grep "^$t " "$WORK/nots-before.txt")"
done
for k in summary debt stock; do
  assert_eq "after upgrade: $k unchanged" "$(python3 -c 'import json,sys; print(json.dumps(json.load(open(sys.argv[1]))[sys.argv[2]],sort_keys=True))' "$WORK/B.json" $k)" "$(python3 -c 'import json,sys; print(json.dumps(json.load(open(sys.argv[1]))[sys.argv[2]],sort_keys=True))' "$WORK/A.json" $k)"
done

# Receipt privacy (P1): before, the deployed version keeps it on the PUBLIC disk; after the upgrade it is
# ONLY on the private documents disk, byte-identical (SHA-256), and the database row did not change.
JR() { python3 -c 'import json,sys; print(json.dumps(json.load(open(sys.argv[1]))["receipt"]["on"],sort_keys=True))' "$1"; }
RHASH="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["receipt"]["on"].get("public",""))' "$WORK/A.json")"
assert_eq "before upgrade: receipt only on the public disk" "$(JR "$WORK/A.json")" "{\"public\": \"$RHASH\"}"
assert_eq "after upgrade: receipt only on the private disk, same SHA-256" "$(JR "$WORK/B.json")" "{\"documents\": \"$RHASH\"}"

start_app "$IMG_OLD"                                   # code-only rollback on the migrated schema
run_php "$WEB" snapshot.php "$WORK/C.json"
assert_eq "after code rollback: receipt kept on the private disk, not lost (the old link cannot serve it)" "$(JR "$WORK/C.json")" "{\"documents\": \"$RHASH\"}"
for k in summary debt stock; do
  assert_eq "after code rollback: $k unchanged" "$(python3 -c 'import json,sys; print(json.dumps(json.load(open(sys.argv[1]))[sys.argv[2]],sort_keys=True))' "$WORK/C.json" $k)" "$(python3 -c 'import json,sys; print(json.dumps(json.load(open(sys.argv[1]))[sys.argv[2]],sort_keys=True))' "$WORK/A.json" $k)"
done

write_result "$OUT" "pneu-upgrade-and-code-rollback" "$(python3 -c 'import json,sys; print(json.dumps({"old":sys.argv[1],"new":sys.argv[2],"tables_compared":int(sys.argv[3]),"tables_changed":sys.argv[4].split(),"snapshots":{k:json.load(open(f)) for k,f in zip("ABC",sys.argv[5:8])},"note":"A code-only rollback proves schema compatibility, NOT financial safety: the old version lacks the cash-close, credit-ceiling and receipt-idempotency fixes."}))' "$IMG_OLD" "$IMG_NEW" "$TABLES" "$CHANGED" "$WORK/A.json" "$WORK/B.json" "$WORK/C.json")"
[ "$FAILED" = 0 ] || die "rehearsal assertions failed (see $OUT)"
