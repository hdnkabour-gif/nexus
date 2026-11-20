#!/bin/bash
set -u
D=/tmp/claude-0/pneu-acceptance; cd $D; IMG=local/pneu-rc:162fe24
PSQL="docker exec pneu-rc-db psql -U mouhim_rc -tA"
docker rm -f pneu-rc-web pneu-rc-worker pneu-rc-db pneu-rc-read >/dev/null 2>&1; docker network create --internal pneu-rc-net >/dev/null 2>&1
docker run -d --name pneu-rc-db --network pneu-rc-net --env-file db.env postgres:18 >/dev/null
for i in $(seq 1 40); do docker exec pneu-rc-db pg_isready -U mouhim_rc -d mouhim_rc >/dev/null 2>&1 && break; sleep 1; done; sleep 2
docker run -d --name pneu-rc-web --network pneu-rc-net --env-file drill.env -v $D:/acceptance:ro $IMG web >/dev/null
for i in $(seq 1 120); do [ "$(docker exec pneu-rc-web sh -c 'curl -s -o /dev/null -w %{http_code} http://127.0.0.1:8080/admin/login' 2>/dev/null)" = 200 ] && break; sleep 2; done
docker run -d --name pneu-rc-worker --network pneu-rc-net --env-file drill.env $IMG worker >/dev/null
echo "revision web=$(docker exec pneu-rc-web cat /app/REVISION | cut -c1-7) worker=$(docker exec pneu-rc-worker cat /app/REVISION | cut -c1-7)"
docker exec pneu-rc-web php /acceptance/books.php
docker exec pneu-rc-web php /acceptance/figures.php > S.json; echo "SOURCE   $(cat S.json)"
echo "stock:verify (source): $(docker exec pneu-rc-web php artisan stock:verify 2>&1 | tail -1)"
echo "--- backup:run ---"; docker exec pneu-rc-web php artisan backup:run 2>&1 | grep -iE "success|fail|error|zip|copied" | head -5
docker exec pneu-rc-web sh -c 'ls -la storage/app/backups/*/ 2>/dev/null | tail -2; f=$(ls storage/app/backups/*/*.zip | head -1); echo "archive: $(basename $f) $(stat -c %s $f) bytes"; php -r "\$z=new ZipArchive; \$z->open(\"$f\"); \$e=0; for(\$i=0;\$i<\$z->numFiles;\$i++){ \$s=\$z->statIndex(\$i); if((\$s[\"encryption_method\"]??0)>0) \$e++; } echo \"entries=\".\$z->numFiles.\" encrypted=\".\$e.PHP_EOL;"'
echo "--- restore into a NEW database ---"; docker exec pneu-rc-web php artisan app:backup-restore --disk=backups_local --into=mouhim_restored --files-to=/tmp/restored-files --force 2>&1 | grep -v "^\s*$" | tail -6
echo "--- compare every table ---"
$PSQL -d mouhim_rc -c "select table_name||'|'||string_agg(quote_ident(column_name),',' order by ordinal_position) from information_schema.columns where table_schema='public' group by table_name order by 1" > drill-cols.txt
same=0; diff=0; > drill-diff.txt
while IFS='|' read -r t cols; do
  a=$($PSQL -d mouhim_rc -c "select count(*)||':'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from (select $cols from public.\"$t\") x")
  b=$($PSQL -d mouhim_restored -c "select count(*)||':'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from (select $cols from public.\"$t\") x" 2>&1)
  if [ "$a" = "$b" ]; then same=$((same+1)); else diff=$((diff+1)); echo "$t source=$a restored=$b" >> drill-diff.txt; fi
done < drill-cols.txt
echo "tables identical: $same, different: $diff"; cat drill-diff.txt
echo "restored photo sha256: $(docker exec pneu-rc-web sh -c 'find /tmp/restored-files -name test-rc-ticket.jpg -exec sha256sum {} \;' | cut -c1-64)"
docker run -d --name pneu-rc-read --network pneu-rc-net --env-file drill.env -e DB_DATABASE=mouhim_restored -v $D:/acceptance:ro --entrypoint sleep $IMG 600 >/dev/null
docker exec pneu-rc-read php /acceptance/figures.php > R.json; echo "RESTORED $(cat R.json)"
echo "stock:verify (restored): $(docker exec pneu-rc-read php artisan stock:verify 2>&1 | tail -1)"
echo "--- go-live audit --strict on the restored copy ---"; docker exec pneu-rc-read php artisan app:go-live-audit --strict 2>&1 | grep -v "^\s*$" | tail -14; echo "audit exit=$?"
