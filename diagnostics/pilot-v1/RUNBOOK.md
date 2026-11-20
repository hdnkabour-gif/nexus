# Runbook — reproducing the pilot diagnostics (synthetic data only)

These files are **stored in NEXUS as evidence**. Except for the AMANZINE runner, they are **not** self-contained: each is copied into its source repo's test tree at the analysed SHA, because it uses that repo's helpers and relative imports. Never point them at Railway, a company database, or real data. Never pass provider keys.

| File | Copy to (source repo @ SHA) | Command (from the source repo root unless stated) | Database |
|---|---|---|---|
| `amanzine-am-s04-s05.mjs` | no copy (self-contained HTTP runner) | `env -i PATH=<node bin>:/usr/bin:/bin HOME=<tmp> NODE_BIN_DIR=<node bin> AMZ_DATABASE_URL=postgresql://amz:amz@127.0.0.1:5432/amz LOG_OUT=<tmp>/server.log node <nexus>/diagnostics/pilot-v1/amanzine-am-s04-s05.mjs <amanzine2 checkout @4ff08a99> 3998`. Prerequisites: `cd server && npm install`, then `node server/migrate.js` with the same `DATABASE_URL` | local PostgreSQL 16, disposable DB `amz` |
| `tijara-aq-tj-01.test.ts` | `tijara-os/test/zz-nexus-aq-tj-01.test.ts` (@`e5e2b26d`) | `scripts/setup-db.sh` (once), `npm ci --include=dev`, `npx vitest run test/zz-nexus-aq-tj-01.test.ts` | local PostgreSQL 16, `tijara_test` |
| `rentcar-aq-rc-01.test.ts` | `rent-car-app/server/test/zz-nexus-rc03.test.ts` (@`781ab813`) | from `server/`: `TEST_DATABASE_URL=postgres://…/fleetora_ci_test npx vitest run test/zz-nexus-rc03.test.ts` (after `npm ci --include=dev`) | local PostgreSQL 16, disposable `fleetora_ci_test` |
| `pneu-diag.test.php` | `Pneumatiques-MOUHIM/tests/Feature/ZzNexusDiagTest.php` (@`ea55329f`) | in the PHP 8.4 test image: `vendor/bin/pest tests/Feature/ZzNexusDiagTest.php` with `DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD` of a disposable PG18 | PostgreSQL 18 container, `mouhim_test` |
| `pneu-race-setup.php`, `pneu-race-confirm.php` | `Pneumatiques-MOUHIM/zz_race/` | `DB_DATABASE=mouhim_race php artisan migrate:fresh --seed --force`; `php zz_race/setup.php`; then two `php zz_race/confirm.php <saleId> <sellerId> <startEpoch>` in parallel. Sequential control: run them one after the other | PostgreSQL 18, **disposable** `mouhim_race` only |
| `pneu-test.Dockerfile` | build context of your choice | `docker build -t local/pneu-test:php84-pg18 -f pneu-test.Dockerfile .` (the sandbox used an extra proxy-CA step, omitted here) | — |

## Expected outcomes at the analysed SHAs (before any fix)
- AMANZINE: A1, A2, A3, A4b, A5 = **FAIL**; A4 = PASS (informational); size-level case = BLOCKED. A refusal must be **4xx**; a 5xx counts as FAIL.
- TIJARA AQ-TJ-01: **PASS**.
- RENT CAR AQ-RC-01: **FAIL** (RC-03) until a partial refund exists. After the fix it must assert refund 2000c, rest 0, deposit held 50000c.
- PNEU: AQ-PM-01, PM-S09 4a, PM-S10 4/5 = PASS. PM-S10 6 records 2 postings, an observation for #21 and not an assertion that equal payments are illegal. Race: 2 confirmations against the ceiling (FAIL for #18); sequential control = PASS.

## Isolation used on 2026-11-20 (re-run of the committed AMANZINE runner)
The AMANZINE runner was executed as a dedicated OS user `egresstest`, with iptables rules rejecting all non-loopback output **and** the loopback port of the session proxy for that user. Probes as that user: direct `curl http://1.1.1.1` → exit 7 (blocked); the proxy port → exit 7 (blocked); loopback PostgreSQL → reachable. Control as root: the proxy answered. The other diagnostics ran with `env -i` (no proxy variables, no provider keys) but **without** iptables, so for them no-send is based on configuration and logs, not network-proven.
