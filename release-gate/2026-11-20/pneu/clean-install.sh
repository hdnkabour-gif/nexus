#!/usr/bin/env bash
# PNEU clean-install proof (fail-closed). Usage: IMG=local/pneu-rc:162fe24 ./clean-install.sh [result.json]
# A brand-new customer installation must start with NO business data: no customer, product,
# stock, sale, invoice, payment, cash day, transfer or demo user. Reference data (roles,
# permissions, sites, categories, catalogues) must be present, demo seeding must be refused in
# production, and a redeploy (restart) must not add anything.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
IMG="${IMG:?set IMG}"; OUT="${1:-$WORK/clean-install-result.json}"
trap cleanup EXIT
make_env
fresh_db
start_app "$IMG"
SQL() { docker exec "$DBC" psql -U mouhim_rc -d mouhim_rc -tAc "$1"; }

BUSINESS="customers customer_vehicles products stock_levels stock_movements tyre_lots sales sale_lines payments payment_allocations issued_invoice_documents cash_days expenses transfers transfer_lines approval_requests customer_opening_balances"
count_business() { local t n out=""; for t in $BUSINESS; do
  n="$(SQL "select count(*) from information_schema.tables where table_schema='public' and table_name='$t'")"
  [ "$n" = 1 ] || die "expected business table missing: $t"; out="$out $t=$(SQL "select count(*) from \"$t\"")"; done; echo "${out# }"; }
zeroes() { local t out=""; for t in $BUSINESS; do out="$out $t=0"; done; echo "${out# }"; }

assert_eq "business tables empty after install" "$(count_business)" "$(zeroes)"
assert_eq "only the owner account exists" "$(SQL "select string_agg(email, ',') from users")" "owner.rc@example.test"
assert_eq "owner has the owner role" "$(SQL "select count(*) from model_has_roles mr join roles r on r.id=mr.role_id join users u on u.id=mr.model_id where u.email='owner.rc@example.test' and r.name='owner'")" "1"
assert_eq "three sites (DEP, M01, M02)" "$(SQL "select string_agg(code, ',' order by code) from sites")" "DEP,M01,M02"
REF="$(SQL "select (select count(*) from roles)||'/'||(select count(*) from permissions)||'/'||(select count(*) from categories)||'/'||(select count(*) from tyre_catalogue_references)")"
assert_eq "reference data present (roles/permissions/categories/tyre catalogue all > 0)" "$(python3 -c 'import sys; print(all(int(x)>0 for x in sys.argv[1].split("/")))' "$REF")" "True"

AUDIT=0; docker exec "$WEB" php artisan app:go-live-audit --strict > "$WORK/audit.out" 2>&1 || AUDIT=$?
assert_eq "go-live audit --strict passes on a fresh install" "$AUDIT" "0"

DEMO=0; docker exec "$WEB" php artisan db:seed --class=DemoSeeder --force > "$WORK/demo.out" 2>&1 || DEMO=$?
assert_eq "DemoSeeder refused in production (non-zero exit)" "$([ "$DEMO" -ne 0 ] && echo refused || echo ran)" "refused"
STG=0; docker exec "$WEB" php artisan app:staging-demo-data --force > "$WORK/staging.out" 2>&1 || STG=$?
assert_eq "staging demo data refused in production (non-zero exit)" "$([ "$STG" -ne 0 ] && echo refused || echo ran)" "refused"
assert_eq "DemoSeeder refusal is the production guard" "$(grep -c 'DemoSeeder.php' "$WORK/demo.out" | sed 's/[1-9][0-9]*/yes/')" "yes"
assert_eq "staging refusal is the staging-project guard" "$(grep -c '^Refused: This is not the PNEU MOUHIM Staging project' "$WORK/staging.out")" "1"
assert_eq "business tables still empty after the refused demo commands" "$(count_business)" "$(zeroes)"

REF_BEFORE="$REF"
start_app "$IMG"                                    # a redeploy: the entrypoint runs migrate + seed again
assert_eq "business tables still empty after a redeploy" "$(count_business)" "$(zeroes)"
assert_eq "still only the owner after a redeploy" "$(SQL "select string_agg(email, ',') from users")" "owner.rc@example.test"
assert_eq "reference counts unchanged by a redeploy" "$(SQL "select (select count(*) from roles)||'/'||(select count(*) from permissions)||'/'||(select count(*) from categories)||'/'||(select count(*) from tyre_catalogue_references)")" "$REF_BEFORE"

write_result "$OUT" "pneu-clean-install" "$(python3 -c 'import json,sys; print(json.dumps({"image_revision":sys.argv[1],"reference_counts_roles_permissions_categories_tyrecatalogue":sys.argv[2],"go_live_audit_exit":int(sys.argv[3]),"demo_seeder_exit":int(sys.argv[4]),"staging_demo_exit":int(sys.argv[5])}))' "$(docker exec "$WEB" cat /app/REVISION)" "$REF" "$AUDIT" "$DEMO" "$STG")"
[ "$FAILED" = 0 ] || die "clean-install assertions failed (see $OUT)"
