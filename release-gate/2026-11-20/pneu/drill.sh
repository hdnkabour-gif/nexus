#!/usr/bin/env bash
# PNEU backup → restore drill on the release candidate (fail-closed). Usage:
#   IMG=local/pneu-rc:162fe24 ./drill.sh [result.json]
# Writes synthetic books (incl. transfers and an expense photo), runs the app's real backup:run
# (encrypted, local backup disk), restores with app:backup-restore --into a NEW database and
# --files-to a private folder, then asserts table-by-table and figure-by-figure equality.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
IMG="${IMG:?set IMG to the candidate image, e.g. local/pneu-rc:162fe24}"
OUT="${1:-$WORK/drill-result.json}"
trap cleanup EXIT
make_env
fresh_db
start_app "$IMG"

run_php "$WEB" books.php "$WORK/books.out"
run_php "$WEB" figures.php "$WORK/source.json"
docker exec "$WEB" php artisan stock:verify > "$WORK/verify-source.out" || die "stock:verify failed on the source"

docker exec "$WEB" php artisan backup:run > "$WORK/backup.out" 2>&1 || die "backup:run failed (see $WORK/backup.out)"
ARCHIVE="$(docker exec "$WEB" sh -c 'ls storage/app/backups/*/*.zip' | head -1)"
[ -n "$ARCHIVE" ] || die "no backup archive produced"
ENC="$(docker exec "$WEB" php -r '$z=new ZipArchive; if($z->open($argv[1])!==true) exit(3); $f=0;$e=0; for($i=0;$i<$z->numFiles;$i++){ $s=$z->statIndex($i); if(substr($s["name"],-1)==="/") continue; $f++; if(($s["encryption_method"]??0)>0) $e++; } echo "$f/$e";' "$ARCHIVE")" || die "cannot read the archive"
assert_eq "every file entry of the archive is encrypted (files/encrypted)" "$ENC" "${ENC%%/*}/${ENC%%/*}"

docker exec "$WEB" php artisan app:backup-restore --disk=backups_local --into=mouhim_restored --files-to=/restore/files --documents-to=/restore/documents --force > "$WORK/restore.out" 2>&1 || die "app:backup-restore failed (see $WORK/restore.out)"

columns mouhim_rc "$WORK/cols.txt"
fingerprint mouhim_rc "$WORK/cols.txt" "$WORK/fp-source.txt"
fingerprint mouhim_restored "$WORK/cols.txt" "$WORK/fp-restored.txt"
TABLES="$(wc -l < "$WORK/cols.txt")"
DIFF="$({ diff "$WORK/fp-source.txt" "$WORK/fp-restored.txt" || true; } | grep -c '^>' || true)"
assert_eq "tables compared is non-zero" "$([ "$TABLES" -gt 0 ] && echo yes || echo no)" "yes"
assert_eq "tables different between source and restored copy" "$DIFF" "0"

docker run -d --name "$RDR" --network "$NET" --env-file "$WORK/app.env" -e DB_DATABASE=mouhim_restored -e PHOTO_ROOT="${PHOTO_ROOT:-/restore/documents}" \
  -v "$HERE:/acceptance:ro" -v pneu-gate-restore:/restore --entrypoint sleep "$IMG" 900 >/dev/null
run_php "$RDR" figures.php "$WORK/restored.json"
docker exec "$RDR" php artisan stock:verify > "$WORK/verify-restored.out" || die "stock:verify failed on the restored copy"

J() { python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); v=d
for k in sys.argv[2].split("."): v=v[k]
print(json.dumps(v, sort_keys=True))' "$1" "$2"; }
for k in stock transfers m01_cash debt; do assert_eq "restored $k equals source" "$(J "$WORK/restored.json" $k)" "$(J "$WORK/source.json" $k)"; done
assert_eq "source stock DEP/M01/M02" "$(J "$WORK/source.json" stock)" '{"DEP": 15, "M01": 9, "M02": 4}'
SRC_PHOTO="$(J "$WORK/source.json" photo_sha256)"; RST_PHOTO="$(J "$WORK/restored.json" photo_sha256)"
assert_eq "source photo hash present" "$([ "$SRC_PHOTO" != null ] && echo yes || echo no)" "yes"
assert_eq "source receipt is on the private documents disk (not /storage)" "$(J "$WORK/source.json" photo_source)" '"live documents disk"'
assert_eq "restored photo (restore folder) SHA-256 equals source" "$RST_PHOTO" "$SRC_PHOTO"

# The strict go-live audit is EXPECTED to refuse here (synthetic operational rows remain).
AUDIT=0; docker exec "$RDR" php artisan app:go-live-audit --strict > "$WORK/audit.out" 2>&1 || AUDIT=$?
assert_eq "go-live audit --strict on the restored copy refuses (non-zero exit)" "$([ "$AUDIT" -ne 0 ] && echo refused || echo passed)" "refused"
assert_eq "audit names the reason" "$(grep -c GO_LIVE_NOT_READY "$WORK/audit.out" || true)" "1"

write_result "$OUT" "pneu-backup-restore-drill" "$(python3 -c 'import json,sys; print(json.dumps({"image_revision":sys.argv[1],"archive":sys.argv[2].split("/")[-1],"files_encrypted":sys.argv[3],"tables_compared":int(sys.argv[4]),"source_figures":json.load(open(sys.argv[5])),"restored_figures":json.load(open(sys.argv[6])),"restore_files_to":"/restore/files","go_live_audit_exit":int(sys.argv[7])}))' "$(docker exec "$WEB" cat /app/REVISION)" "$ARCHIVE" "$ENC" "$TABLES" "$WORK/source.json" "$WORK/restored.json" "$AUDIT")"
[ "$FAILED" = 0 ] || die "drill assertions failed (see $OUT)"
