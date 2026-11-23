#!/usr/bin/env bash
# #29 proof: receipts on the two real Railway volume layouts (fail-closed). Usage:
#   IMG_OLD=local/pneu-rc:ea55329 IMG_NEW=local/pneu-rc:<candidate> ./topology.sh [result.json]
# A = today: one volume at /app/storage/app/public only.  B = target: one volume at /app/storage/app.
# Each: the deployed version stores a receipt publicly, the candidate boots (migrate + app:secure-receipts),
# then the web container is DESTROYED and recreated. No Railway call; RAILWAY_* variables are simulated.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
IMG_OLD="${IMG_OLD:?}"; IMG_NEW="${IMG_NEW:?}"; OUT="${1:-$WORK/topology-result.json}"
export RAILWAY_SIM=1
trap cleanup EXIT
make_env
where() { docker exec "$WEB" sh -c "for d in public documents; do f=/app/storage/app/\$d/$1; [ -f \$f ] && echo \$d:\$(sha256sum \$f | cut -c1-64); done; true" | tr '\n' ' ' | sed 's/ $//'; }
for TOPO in A B; do
  [ $TOPO = A ] && export MOUNT=/app/storage/app/public || export MOUNT=/app/storage/app
  fresh_db
  start_app "$IMG_OLD"; run_php "$WEB" populate.php "$WORK/pop-$TOPO.out"
  P=expenses/test-old-receipt.jpg; BEFORE="$(where $P)"
  assert_eq "[$TOPO] deployed version stores the receipt publicly" "${BEFORE%%:*}" "public"
  start_app "$IMG_NEW"
  AUD="$({ docker exec "$WEB" php artisan app:go-live-audit | grep 'Private documents storage' || true; } | cut -d' ' -f4)"   # absent line => "" => assertion fails
  docker rm -f "$WEB" "$WRK" >/dev/null; start_app "$IMG_NEW"          # destroy + recreate (redeploy)
  AFTER="$(where $P)"; SHA="${BEFORE#*:}"
  if [ $TOPO = A ]; then
    assert_eq "[A] durability check FAILS (volume only on public)" "$AUD" "FAIL"
    assert_eq "[A] receipt NOT moved, kept on the public volume, intact after recreate" "$AFTER" "public:$SHA"
  else
    assert_eq "[B] durability check PASSES" "$AUD" "PASS"
    assert_eq "[B] receipt only on the private disk, intact after recreate" "$AFTER" "documents:$SHA"
    assert_eq "[B] direct /storage URL no longer serves it" "$(docker exec "$WEB" sh -c "curl -s -o /dev/null -w %{http_code} http://127.0.0.1:8080/storage/$P")" "404"
    run_php "$WEB" http.php "$WORK/http.json"
    H() { python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(d[sys.argv[2]][sys.argv[3]])' "$WORK/http.json" "$1" "$2"; }
    assert_eq "[B] guest is redirected to login" "$(H guest status)" "302"
    assert_eq "[B] seller of another site: 403" "$(H other_site status)" "403"
    assert_eq "[B] seller of the site: 200" "$(H same_site status)" "200"
    assert_eq "[B] bytes served = original SHA-256" "$(H same_site sha256)" "$SHA"
  fi
done
write_result "$OUT" "pneu-29-volume-topology" "$(python3 -c 'import json,sys; print(json.dumps({"old":sys.argv[1],"new":sys.argv[2]}))' "$IMG_OLD" "$IMG_NEW")"
[ "$FAILED" = 0 ] || die "topology assertions failed (see $OUT)"
