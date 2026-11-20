#!/bin/bash
set -u
D=/tmp/claude-0/pneu-acceptance; cd $D
PSQL="docker exec pneu-rc-db psql -U mouhim_rc -d mouhim_rc -tA"
start() { # $1 image tag
  docker rm -f pneu-rc-web pneu-rc-worker >/dev/null 2>&1
  docker run -d --name pneu-rc-web --network pneu-rc-net --env-file rc.env -v $D:/acceptance:ro local/pneu-rc:$1 web >/dev/null
  for i in $(seq 1 120); do [ "$(docker exec pneu-rc-web sh -c 'curl -s -o /dev/null -w %{http_code} http://127.0.0.1:8080/admin/login' 2>/dev/null)" = 200 ] && break; sleep 2; done
  docker run -d --name pneu-rc-worker --network pneu-rc-net --env-file rc.env local/pneu-rc:$1 worker >/dev/null
  echo "web[$1] login=$(docker exec pneu-rc-web sh -c 'curl -s -o /dev/null -w %{http_code} http://127.0.0.1:8080/admin/login') revision=$(docker exec pneu-rc-web cat /app/REVISION | cut -c1-7) worker_revision=$(docker exec pneu-rc-worker cat /app/REVISION | cut -c1-7)"
}
fingerprint() { # uses column lists frozen before the upgrade
  while IFS='|' read -r t cols; do
    echo "$t $($PSQL -c "select count(*)||':'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from (select $cols from public.\"$t\") x")"
  done < cols.txt
}
# 0. fresh isolated database
docker rm -f pneu-rc-web pneu-rc-worker pneu-rc-db >/dev/null 2>&1
docker run -d --name pneu-rc-db --network pneu-rc-net --env-file db.env postgres:18 >/dev/null
for i in $(seq 1 40); do docker exec pneu-rc-db pg_isready -U mouhim_rc -d mouhim_rc >/dev/null 2>&1 && break; sleep 1; done; sleep 2
# 1. currently deployed version + synthetic books
start ea55329
docker exec pneu-rc-web php /acceptance/populate.php
docker exec pneu-rc-web php /acceptance/snapshot.php > A.json; echo "A (ea55329): $(cat A.json)"
$PSQL -c "select table_name||'|'||string_agg(quote_ident(column_name),',' order by ordinal_position) from information_schema.columns where table_schema='public' and table_name not in ('migrations','cache','cache_locks','sessions','jobs','job_batches','failed_jobs') group by table_name order by 1" > cols.txt
fingerprint > FA.txt
# 2. upgrade: the candidate image migrates the same database
start 162fe24
docker exec pneu-rc-web php /acceptance/snapshot.php > B.json; echo "B (162fe24): $(cat B.json)"
fingerprint > FB.txt
echo "rows changed by the upgrade: $(diff FA.txt FB.txt | grep -c '^>')  (tables compared: $(wc -l < FA.txt))"
echo "new migrations: $($PSQL -c "select string_agg(migration, ', ') from migrations where batch = (select max(batch) from migrations)")"
# 3. code rollback: the deployed version again, on the migrated schema
start ea55329
docker exec pneu-rc-web php /acceptance/snapshot.php > C.json; echo "C (ea55329 on migrated schema): $(cat C.json)"
