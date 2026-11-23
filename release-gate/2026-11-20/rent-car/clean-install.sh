#!/usr/bin/env bash
# RENT CAR clean-install proof (fail-closed). Usage:
#   REPO=/path/to/rent-car-app ADMIN_URL=postgres://user:pw@localhost:5432/postgres ./clean-install.sh [result.json]
# REPO must be checked out at the candidate and built (npm run build -w server). ADMIN_URL is a LOCAL
# maintenance connection allowed to CREATE DATABASE; a fresh database with a non-dev name is created
# for the run and dropped afterwards. Nothing here can reach Railway or a company database.
# Proves: production start (migrate, then server) on an empty database + first manager gives NO
# business data, only reference/setup rows; seed:dev and seed:demo are refused; a restart (redeploy)
# applies no migration and adds nothing.
set -Eeuo pipefail
trap 'echo "FATAL: command failed (exit $?) at line ${LINENO}: ${BASH_COMMAND}" >&2' ERR
die() { echo "FATAL: $*" >&2; exit 1; }
REPO="${REPO:?set REPO to the rent-car-app checkout}"; ADMIN_URL="${ADMIN_URL:?set ADMIN_URL}"
OUT="${1:-$(mktemp -d)/rent-car-clean-install-result.json}"
SERVER="$REPO/server"; [ -f "$SERVER/dist/src/index.js" ] || die "build the server first (npm run build -w server)"
case "$ADMIN_URL" in *@localhost:*|*@127.0.0.1:*) ;; *) die "ADMIN_URL must be a local database";; esac
command -v psql >/dev/null || die "psql missing"
DBN="fleetora_clean_$(openssl rand -hex 4)"; DB="${ADMIN_URL%/*}/$DBN"
WORK="$(mktemp -d)"; chmod 700 "$WORK"; PORT="${PORT:-18093}"
NODE="$(command -v node)"
cleanup() { [ -n "${PID:-}" ] && kill "$PID" >/dev/null 2>&1 || true; psql "$ADMIN_URL" -qc "DROP DATABASE IF EXISTS $DBN WITH (FORCE)" >/dev/null 2>&1 || true; }
trap cleanup EXIT
psql "$ADMIN_URL" -qc "CREATE DATABASE $DBN" || die "cannot create $DBN"
APPENV=(env -i PATH="$(dirname "$NODE"):/usr/bin:/bin" HOME="$WORK" NODE_ENV=production DATABASE_URL="$DB" STORAGE_DIR="$WORK/uploads" HOST=127.0.0.1 PORT="$PORT" COOKIE_SECURE=true APP_ORIGINS="https://rc-clean.example.test")
ASSERTS=(); FAILED=0
assert_eq() { local ok=false; [ "$2" = "$3" ] && ok=true || FAILED=1
  ASSERTS+=("$(python3 -c 'import json,sys; print(json.dumps({"check":sys.argv[1],"actual":sys.argv[2],"expected":sys.argv[3],"pass":sys.argv[4]=="true"}))' "$1" "$2" "$3" "$ok")")
  echo "$([ $ok = true ] && echo PASS || echo FAIL)  $1  (actual=$2 expected=$3)"; }
Q() { psql "$DB" -tAc "$1"; }

# Production start = `npm start -w server`: migrate, then the server.
start_server() {
  (cd "$SERVER" && "${APPENV[@]}" "$NODE" dist/src/scripts/migrate.js > "$WORK/migrate-$1.out") || die "migrate failed ($1)"
  (cd "$SERVER" && exec "${APPENV[@]}" "$NODE" dist/src/index.js) > "$WORK/server-$1.out" 2>&1 &
  PID=$!; local i code=""
  for i in $(seq 1 60); do code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/api/health" || true)"; [ "$code" = 200 ] && break
    kill -0 "$PID" 2>/dev/null || die "server exited during start ($1), see $WORK/server-$1.out"; sleep 1; done
  [ "$code" = 200 ] || die "server not healthy after 60 s ($1)"
}
stop_server() { kill "$PID"; wait "$PID" 2>/dev/null || true; PID=""; }

# Tables allowed to hold rows on a fresh install: reference data and the setup of the first manager.
ALLOW="audit_logs company_settings contract_templates permissions role_permissions roles schema_migrations users vehicle_status_transitions"
nonempty() { local t n out=""; while read -r t; do n="$(Q "select count(*) from \"$t\"")"; [ "$n" != 0 ] && out="$out $t=$n"; done < <(Q "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1"); echo "${out# }"; }
unexpected() { local kv out=""; for kv in $(nonempty); do t="${kv%%=*}"; case " $ALLOW " in *" $t "*) ;; *) case "$t" in vehicle_catalog_*) ;; *) out="$out $kv";; esac;; esac; done; echo "${out# }"; }

start_server first
stop_server
(cd "$SERVER" && "${APPENV[@]}" FLEETORA_MANAGER_EMAIL=manager.clean@example.test FLEETORA_MANAGER_NAME="TEST Gerant" FLEETORA_MANAGER_PASSWORD="Clean-$(openssl rand -hex 12)-Aa9!" "$NODE" dist/src/scripts/create-manager.js > "$WORK/manager.out" 2>&1) || die "create-manager failed"
TABLES="$(Q "select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE'")"
assert_eq "tables inspected is non-zero" "$([ "$TABLES" -gt 0 ] && echo yes || echo no)" "yes"
assert_eq "no business table holds rows (only reference/setup tables)" "$(unexpected)" ""
assert_eq "only the first manager exists" "$(Q "select string_agg(email||':'||role_code, ',') from users")" "manager.clean@example.test:manager"
assert_eq "vehicle reference catalogue present" "$(Q "select (select count(*) from vehicle_catalog_brands) > 0 and (select count(*) from vehicle_catalog_models) > 0")" "t"
assert_eq "migrations applied" "$(Q "select count(*) from schema_migrations")" "$(ls "$SERVER/migrations"/*.sql | wc -l | tr -d ' ')"

DEV=0; (cd "$SERVER" && "${APPENV[@]}" "$NODE" dist/src/scripts/seed-dev.js > "$WORK/seed-dev.out" 2>&1) || DEV=$?
assert_eq "seed:dev refused in production" "$([ "$DEV" -ne 0 ] && grep -q 'seed:dev refused' "$WORK/seed-dev.out" && echo refused || echo ran)" "refused"
DEMO=0; (cd "$SERVER" && "${APPENV[@]}" "$NODE" dist/src/scripts/seed-demo.js > "$WORK/seed-demo.out" 2>&1) || DEMO=$?
assert_eq "seed:demo refused without its explicit demo flags" "$([ "$DEMO" -ne 0 ] && grep -q 'seed:demo refused' "$WORK/seed-demo.out" && echo refused || echo ran)" "refused"
assert_eq "still no business rows after the refused seeds" "$(unexpected)" ""

BEFORE="$(nonempty)"
start_server redeploy                                 # redeploy: migrate + start again
assert_eq "a redeploy applies no migration" "$(grep -c 'Applied:' "$WORK/migrate-redeploy.out" || true)" "0"
assert_eq "a redeploy adds no row anywhere" "$(nonempty)" "$BEFORE"
stop_server

python3 - "$OUT" "$FAILED" "$(git -C "$REPO" rev-parse HEAD)" "$TABLES" "${ASSERTS[@]}" <<'PY'
import json, sys
out, failed, rev, tables, *a = sys.argv[1:]
json.dump({"rehearsal": "rent-car-clean-install", "ok": failed == "0", "revision": rev, "tables_inspected": int(tables),
           "assertions": [json.loads(x) for x in a]}, open(out, "w"), indent=1, ensure_ascii=False)
PY
echo "result: $OUT ok=$([ "$FAILED" = 0 ] && echo true || echo false)"
[ "$FAILED" = 0 ] || die "clean-install assertions failed"
