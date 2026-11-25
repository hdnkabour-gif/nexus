#!/usr/bin/env bash
# NEXUS V3 isolated verification (fail-closed; synthetic data; throwaway PostgreSQL 18 on 127.0.0.1 only).
# Usage: V2=/path/nexus@080be1f V3=/path/nexus@<candidate> ./v3-isolated.sh [result.json]
# Proves: V2 -> V3 migration (twice, idempotent) keeps V2 data; V2 code still works on the V3 schema
# (code rollback); dump/restore reproduces every table and the append-only triggers; a least-privilege
# runtime role passes the privilege attestation and cannot rewrite history, the owner role does not pass.
set -Eeuo pipefail
trap 'echo "FATAL: line ${LINENO}: ${BASH_COMMAND}" >&2' ERR
V2="${V2:?}"; V3="${V3:?}"; OUT="${1:-$(mktemp -d)/v3-isolated-result.json}"
C=nexus-v3-iso; PORT=55432; PW="$(openssl rand -hex 16)"; RPW="$(openssl rand -hex 16)"
ASSERTS=(); FAILED=0
check() { local ok=false; [ "$2" = "$3" ] && ok=true || FAILED=1; ASSERTS+=("$(python3 -c 'import json,sys;print(json.dumps({"check":sys.argv[1],"actual":sys.argv[2],"expected":sys.argv[3],"pass":sys.argv[4]=="true"}))' "$1" "$2" "$3" "$ok")"); echo "$([ $ok = true ] && echo PASS || echo FAIL)  $1  (actual=$2 expected=$3)"; }
cleanup() { docker rm -f $C >/dev/null 2>&1 || true; }; trap cleanup EXIT; cleanup
docker run -d --name $C -p 127.0.0.1:$PORT:5432 -e POSTGRES_USER=nexus -e POSTGRES_PASSWORD="$PW" -e POSTGRES_DB=nexus_test postgres:18 >/dev/null
for i in $(seq 60); do docker exec $C pg_isready -U nexus -d nexus_test >/dev/null 2>&1 && break; sleep 1; done; sleep 2
SQL() { docker exec $C psql -U nexus -d "${2:-nexus_test}" -tAc "$1"; }
export NEXUS_DATABASE_URL="postgresql://nexus:$PW@127.0.0.1:$PORT/nexus_test" CI=true
FP() { SQL "select string_agg(t||':'||n, ' ' order by t) from (select 'audit' t,(select count(*)||'/'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from nexus_audit x) n union all select 'obs',(select count(*)||'/'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from nexus_observations x) union all select 'receipts',(select count(*)||'/'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from nexus_job_receipts x)) s" "${1:-nexus_test}"; }

# 1. V2 schema + synthetic V2 data
(cd "$V2" && node scripts/migrate.mjs) >/dev/null
SQL "insert into nexus_audit(kind,result,app_id) values('TEST_login','success','nexus'); insert into nexus_observations(app_id,environment,provider,resource_ref,probe_kind,state,response_status) values('pneu-mouhim','production','http_public','TEST','http_reachability','reachable',200); insert into nexus_job_receipts(job_kind,state) values('TEST_job','succeeded')" >/dev/null
V2FP="$(FP)"
# 2. V3 migration, twice
M1=0; (cd "$V3" && node scripts/migrate.mjs) >/dev/null || M1=$?; M2=0; (cd "$V3" && node scripts/migrate.mjs) >/dev/null || M2=$?
check "V3 migration on the V2 database succeeds" "$M1" "0"
check "V3 migration re-run is idempotent" "$M2" "0"
check "V2 rows unchanged by the V3 migration" "$(FP)" "$V2FP"
check "V3 tables present" "$(SQL "select count(*) from information_schema.tables where table_name in ('nexus_knowledge_revisions','nexus_task_observation_history','nexus_github_budget')")" "3"
check "append-only triggers installed" "$(SQL "select count(*) from pg_trigger where tgname like 'nexus_%append_only' or tgname like 'nexus_%no_truncate'")" "4"
# 3. Test suites: V3 on its schema; V2 code on the V3 schema (code rollback)
T3="$(cd "$V3" && npm test 2>&1 | grep -E '^# (pass|fail)' | tr '\n' ' ')"; check "V3 suite on the migrated database" "$(echo "$T3" | grep -o 'fail [0-9]*' | head -1)" "fail 0"
T2="$(cd "$V2" && npm test 2>&1 | grep -E '^# (pass|fail)' | tr '\n' ' ')"; check "V2 code still passes on the V3 schema (rollback)" "$(echo "$T2" | grep -o 'fail [0-9]*' | head -1)" "fail 0"
echo "V3 suite: $T3 | V2 suite: $T2"
# 4. Recovery: dump, restore into a new database, compare every table, triggers still enforce
SQL "insert into nexus_task_observation_history(repository,resource_kind,resource_number,state,source_updated_at,observed_at) values('TEST/repo','issues',1,'OPEN',now(),now())" >/dev/null
docker exec $C sh -c 'pg_dump -U nexus -Fc nexus_test > /tmp/v3.dump && createdb -U nexus nexus_restore && pg_restore -U nexus -d nexus_restore /tmp/v3.dump'
TABLES="$(SQL "select string_agg(table_name,' ' order by table_name) from information_schema.tables where table_schema='public'")"
for t in $TABLES; do a="$(SQL "select count(*)||':'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from public.$t x")"; b="$(SQL "select count(*)||':'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from public.$t x" nexus_restore)"; check "restore identical: $t" "$b" "$a"; done
R=0; SQL "delete from nexus_task_observation_history" nexus_restore >/dev/null 2>&1 || R=$?
check "append-only still enforced after restore" "$([ $R -ne 0 ] && echo refused || echo allowed)" "refused"
# 5. Privileges: least-privilege runtime role vs owner role
SQL "create role nexus_runtime login password '$RPW' nosuperuser nobypassrls; grant connect on database nexus_test to nexus_runtime; grant usage on schema public to nexus_runtime;
 grant select,insert on nexus_task_observation_history,nexus_knowledge_revisions,nexus_audit,nexus_observations to nexus_runtime;
 grant select,insert,update on nexus_job_receipts,nexus_github_budget to nexus_runtime;
 grant select,insert,update,delete on nexus_sessions,nexus_owner_credentials,nexus_connections to nexus_runtime" >/dev/null
RT=0; (cd "$V3" && NEXUS_DATABASE_URL="postgresql://nexus_runtime:$RPW@127.0.0.1:$PORT/nexus_test" node scripts/check-db-privileges.mjs) > /dev/null || RT=$?
OW=0; (cd "$V3" && node scripts/check-db-privileges.mjs) > /dev/null || OW=$?
check "least-privilege runtime role passes the attestation" "$RT" "0"
check "owner/migration role is reported unsafe" "$OW" "1"
D=0; docker exec -e PGPASSWORD="$RPW" $C psql -h 127.0.0.1 -U nexus_runtime -d nexus_test -tAc "delete from nexus_task_observation_history" >/dev/null 2>&1 || D=$?
check "runtime role cannot delete history" "$([ $D -ne 0 ] && echo refused || echo allowed)" "refused"
python3 - "$OUT" "$FAILED" "${ASSERTS[@]}" <<'PY'
import json,sys
out,failed,*a=sys.argv[1:]
json.dump({"rehearsal":"nexus-v3-isolated","postgres":"18","ok":failed=="0","assertions":[json.loads(x) for x in a]},open(out,"w"),indent=1)
PY
echo "result: $OUT ok=$([ $FAILED = 0 ] && echo true || echo false)"; [ $FAILED = 0 ]
