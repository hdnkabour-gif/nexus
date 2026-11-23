#!/usr/bin/env bash
# Shared helpers for the PNEU release-gate rehearsals (NEXUS #24 / PR #25). FAIL-CLOSED:
# every mandatory step must succeed, readiness waits are bounded, and success is decided by
# explicit assertions written to a machine-readable result file, never by grepping a log.
#
# Isolation: an --internal Docker network (no route outside), a fresh postgres:18 container and
# generated synthetic configuration. Nothing here can reach Railway, R2 or any company database.
set -Eeuo pipefail
trap 'echo "FATAL: command failed (exit $?) at ${BASH_SOURCE[0]##*/}:${LINENO}: ${BASH_COMMAND}" >&2' ERR

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # scripts are mounted from here
WORK="${WORK:-$(mktemp -d "${TMPDIR:-/tmp}/pneu-gate.XXXXXX")}"
mkdir -p "$WORK" && chmod 700 "$WORK"
NET="${NET:-pneu-gate-net}"; DBC="${DBC:-pneu-rc-db}"; WEB="${WEB:-pneu-gate-web}"; WRK="${WRK:-pneu-gate-worker}"; RDR="${RDR:-pneu-gate-read}"
ASSERTS=()   # JSON objects, one per assertion
FAILED=0

die() { echo "FATAL: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null || die "missing tool: $1"; }
need docker; need python3; need openssl

# Synthetic configuration, generated per run (never committed, never printed).
make_env() {
  local dbpw; dbpw="$(openssl rand -hex 16)"
  umask 077
  cat > "$WORK/db.env" <<EOF
POSTGRES_DB=mouhim_rc
POSTGRES_USER=mouhim_rc
POSTGRES_PASSWORD=$dbpw
EOF
  cat > "$WORK/app.env" <<EOF
APP_NAME=PNEU-RC-ACCEPTANCE
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:$(openssl rand -base64 32)
APP_URL=http://127.0.0.1:8080
SERVER_NAME=:8080
LOG_CHANNEL=stderr
LOG_LEVEL=warning
DB_CONNECTION=pgsql
DB_HOST=$DBC
DB_PORT=5432
DB_DATABASE=mouhim_rc
DB_USERNAME=mouhim_rc
DB_PASSWORD=$dbpw
SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
FILESYSTEM_DISK=local
MAIL_MAILER=log
RUN_SCHEDULER=false
BACKUP_DISK=backups_local
BACKUP_ARCHIVE_PASSWORD=$(openssl rand -hex 20)
OWNER_NAME=TEST Owner
OWNER_EMAIL=owner.rc@example.test
OWNER_PASSWORD=Rc-$(openssl rand -hex 12)-Aa9!
EOF
}

cleanup() { docker rm -f "$WEB" "$WRK" "$DBC" "$RDR" >/dev/null 2>&1 || true; docker network rm "$NET" >/dev/null 2>&1 || true; docker volume rm pneu-gate-restore pneu-gate-storage >/dev/null 2>&1 || true; }

fresh_db() {
  cleanup
  docker network create --internal "$NET" >/dev/null
  docker run -d --name "$DBC" --network "$NET" --env-file "$WORK/db.env" postgres:18 >/dev/null
  local i; for i in $(seq 1 60); do docker exec "$DBC" pg_isready -U mouhim_rc -d mouhim_rc >/dev/null 2>&1 && { sleep 1; return 0; }; sleep 1; done
  die "database not ready after 60 s"
}

# start_app <image> : web (entrypoint: migrate, seed, owner) + worker, from the same image.
start_app() {
  local img="$1" i code=""
  docker image inspect "$img" >/dev/null 2>&1 || die "image not found: $img"
  docker rm -f "$WEB" "$WRK" >/dev/null 2>&1 || true
  # storage/app is a persistent volume on Railway: the same named volume survives a version switch here.
  docker run -d --name "$WEB" --network "$NET" --env-file "$WORK/app.env" -v "$HERE:/acceptance:ro" -v pneu-gate-restore:/restore -v pneu-gate-storage:/app/storage/app "$img" web >/dev/null
  for i in $(seq 1 150); do
    code="$(docker exec "$WEB" sh -c 'curl -s -o /dev/null -w %{http_code} http://127.0.0.1:8080/admin/login' 2>/dev/null || true)"
    [ "$code" = 200 ] && break
    docker inspect -f '{{.State.Running}}' "$WEB" 2>/dev/null | grep -q true || die "web container exited during start ($img)"
    sleep 2
  done
  [ "$code" = 200 ] || die "web not ready after 300 s ($img), last HTTP code '$code'"
  docker run -d --name "$WRK" --network "$NET" --env-file "$WORK/app.env" -v pneu-gate-storage:/app/storage/app "$img" worker >/dev/null
  sleep 3
  docker inspect -f '{{.State.Running}}' "$WRK" | grep -q true || die "worker container not running ($img)"
  local want; want="$(docker image inspect -f '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$img")"
  [ -n "$want" ] || die "image $img has no revision label"
  assert_eq "web runs $img revision" "$(docker exec "$WEB" cat /app/REVISION)" "$want"
  assert_eq "worker runs the same revision as web" "$(docker exec "$WRK" cat /app/REVISION)" "$want"
}

# run_php <container> <script> <outfile> : exit status checked, stdout captured.
run_php() { docker exec "$1" php "/acceptance/$2" > "$3" || die "$2 failed in $1 (exit $?)"; }

assert_eq() { # name actual expected
  local ok=false; [ "$2" = "$3" ] && ok=true || FAILED=1
  ASSERTS+=("$(python3 -c 'import json,sys; print(json.dumps({"check":sys.argv[1],"actual":sys.argv[2],"expected":sys.argv[3],"pass":sys.argv[4]=="true"}))' "$1" "$2" "$3" "$ok")")
  echo "$([ $ok = true ] && echo PASS || echo FAIL)  $1  (actual=$2 expected=$3)"
}

# Fingerprint every table over the given column list file: "table|col,col,..." per line.
fingerprint() { # dbname colsfile outfile
  : > "$3"
  [ -s "$2" ] || die "empty column list $2"
  local t cols
  while IFS='|' read -r t cols; do
    echo "$t $(docker exec "$DBC" psql -U mouhim_rc -d "$1" -tAc "select count(*)||':'||md5(coalesce(string_agg(x::text,'|' order by x::text),'')) from (select $cols from public.\"$t\") x")" >> "$3" || die "fingerprint failed on $1.$t"
  done < "$2"
  [ "$(wc -l < "$3")" -eq "$(wc -l < "$2")" ] || die "fingerprint incomplete for $1"
}

columns() { # dbname outfile [exclude-regex]
  docker exec "$DBC" psql -U mouhim_rc -d "$1" -tAc "select table_name||'|'||string_agg(quote_ident(column_name),',' order by ordinal_position) from information_schema.columns where table_schema='public' and table_name not in ('migrations','cache','cache_locks','sessions','jobs','job_batches','failed_jobs') group by table_name order by 1" > "$2" || die "column listing failed on $1"
  [ -s "$2" ] || die "no tables found in $1"
}

write_result() { # outfile name extra-json
  python3 - "$1" "$2" "${3:-{\}}" "$FAILED" "${ASSERTS[@]}" <<'PY'
import json, sys
out, name, extra, failed, *asserts = sys.argv[1:]
data = {"rehearsal": name, "ok": failed == "0", "assertions": [json.loads(a) for a in asserts], **json.loads(extra)}
json.dump(data, open(out, "w"), indent=1, ensure_ascii=False)
PY
  echo "result: $1 ok=$([ "$FAILED" = 0 ] && echo true || echo false)"
}
