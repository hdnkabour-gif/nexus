# 35 — Pilot Diagnostic Test Results V1 (executed 2026-11-20)

First **executed** results for the scenarios planned in [docs/33 / PR #22](https://github.com/hdnkabour-gif/nexus/pull/22) (Issue #20). This is an independent branch from `main`; PR #18, #19 and #22 are not modified.

> **Scope of these results.** Synthetic data in isolated local databases on a cloud dev container. They prove or disprove **code behaviour at the stated SHA**. They are **app-local synthetic observations**, not evidence about deployed services: even where the deployed SHA equals the tested SHA (docs/27 S1), the **deployments remain unverified** by these tests (configuration, data, workers and providers differ). Nothing here is production readiness. No Railway, production DB, real shipment, payment, WhatsApp, SMS or email was touched.

## 1. Environment and isolation checks (done before any test)
| Check | Result |
|---|---|
| Inherited environment | The shared dev environment exposes secret-like variables (an AI-provider key, a media-storage URL with credentials, a JWT secret, an admin e-mail) and URLs of an unrelated production-like deployment (host redacted here). **Every app test ran under `env -i`** with only `PATH`, `HOME`, a local DB URL and a dummy JWT secret. Values were never printed. See §6 for the owner action |
| Outbound network during tests | **AMANZINE (revision 2 re-run):** executed as a dedicated OS user with iptables rejecting all non-loopback output and the loopback port of the session proxy. Probe as that user: direct HTTP → blocked (curl exit 7); proxy port → blocked (exit 7); loopback PostgreSQL → reachable; root control → proxy reachable. So no-send is **network-proven** for that run. **Other diagnostics and the first AMANZINE run:** `env -i` only (no proxy variables, no provider keys) plus server logs (`Cloudinary not configured`, `Auto-delivery skipped: providers count=0`). For those, no-send rests on **configuration and logs, not on a network proof** |
| Databases | Local **PostgreSQL 16.15** (AMANZINE, RENT CAR and TIJARA; their CI uses PG16, and TIJARA's CI also runs PG18). PNEU used a **PostgreSQL 18.7** container (`postgres:18`) on port 5433, the same major version as its CI. No connection string to any company database was used |
| Runtimes | Node v22.23.5. PNEU ran in a local image built from `dunglas/frankenphp:1-php8.4-bookworm` (PHP **8.4.28**) with `pdo_pgsql pgsql intl zip gd bcmath` and the PG18 client, mirroring the CI step ([pneu-test.Dockerfile](../diagnostics/pilot-v1/pneu-test.Dockerfile)) |
| Source copies | Read-only clones at the analysed SHAs. Temporary test files lived only in local working copies and were deleted or never committed. **No commit or push to any application repository** |

## 2. Baseline: existing suites re-run locally (parity with CI)
| App @ SHA | Command | Local result | CI result (docs/28 TE-*) | Parity |
|---|---|---|---|---|
| AMANZINE `4ff08a99` | `cd server && npm test` (node:test, PG16) | **535 pass, 0 fail, 0 skip** | CI not readable from this session | first evidence of a full green server suite |
| TIJARA OS `e5e2b26d` | `npm run typecheck && npx vitest run` (PG16) | typecheck OK; **78 passed (12 files)** | 78 passed | ✅ (the e2e file needs Playwright; CI installs it separately, here via the pre-installed global module) |
| RENT CAR `781ab813` | `npm test` (server + web, PG16) | **319 + 89 passed** | 319 + 89 passed | ✅ (install needs `npm ci --include=dev`; the container sets `NODE_ENV=production`) |
| PNEU MOUHIM `ea55329f` | `vendor/bin/pest` (PHP 8.4.28, PG18.7) | **406 passed, 1 skipped** (4,453 assertions) | 406 passed, 1 skipped | ✅ |

## 3. Diagnostic results
Result legend: **PASS** = observed equals expected · **FAIL** = defect **proven by execution** · **BLOCKED** = cannot run (feature absent) · **NOT_RUN**.

### AMANZINE `4ff08a99` — AM-S04 / AM-S05 (P0)
Method: the real server (`node server/index.js`) runs locally against PG16, driven over HTTP by [amanzine-am-s04-s05.mjs](../diagnostics/pilot-v1/amanzine-am-s04-s05.mjs). Raw output of the first run: [amanzine-result.json](../diagnostics/pilot-v1/amanzine-result.json). **Revision 2:** the committed runner had a quoting error introduced when its log path was edited before commit, so it was not runnable as stored. It is now fixed and `node --check` passes. **The committed file was re-run** under an explicit egress block, giving **identical results**: [amanzine-result-rerun-committed.json](../diagnostics/pilot-v1/amanzine-result-rerun-committed.json). A refusal now has to be a **4xx**; a 5xx counts as FAIL (Codex P2).
| ID | Input | Expected | Observed | Result |
|---|---|---|---|---|
| AM-S04-A1 oversell | stock 2; order qty 3; approve | approve refused; stock 2 | approve **200**; stock **0** (1 unit sold without stock) | **FAIL (proven)** |
| AM-S04-A2 double approve | stock 5; order qty 2; approve twice | stock 3 after both | approve 200, stock 3; approve again 200, stock **1** | **FAIL (proven)** |
| AM-S05 reject after approve | stock 5; qty 2; approve, then reject | 3, then back to 5 | 3, reject 200, stock stays **3** | **FAIL (proven)** |
| AM-S04-A4b approve on zero stock | stock 0; qty 1 | refused | approve **200**; stock 0 | **FAIL (proven)** |
| AM-S04-A5 concurrent last unit | stock 1; 2 orders; approve both at once | exactly one approved | **both 200**; stock 0 | **FAIL (proven)** |
| AM-S04-A4 create on zero stock | stock 0; create qty 1 | may stay pending | 201 (pending) | PASS (informational) |
| AQ-AM-01 last unit of a size | per-size stock | one order per size | per-size stock does not exist | **BLOCKED** |
Root cause (code at `server/routes/orders.js:200-222`, `:345-353`): the decrement happens on approve, with no status check and no row lock or transaction, clamped by `Math.max(0, …)` instead of refusing. Reject does not reverse the decrement. **Fix belongs in an AMANZINE PR** (this session has no push access to `amanzine2`). The script above is the regression test that should pass after the fix.

### TIJARA OS `e5e2b26d`
| ID | Input | Expected | Observed | Result |
|---|---|---|---|---|
| AQ-TJ-01 | 5 kg beef → 4.6 kg kafta + 0.4 waste; sell 1.47 kg kafta + grilling; pay 220.50 | beef −5 once; kafta 3.130; waste once; due 0; ledger reconciles | beef 0 (−5 once); kafta **3.13**; 1 waste line 0.400; total = paid = **220.50**, due 0; `reconcile()` = [] | **PASS** |
| AQ-TJ-01 isolation | second tenant queries the first tenant's item id | 0 rows | movements 0, items 0 | **PASS** |
Test: [tijara-aq-tj-01.test.ts](../diagnostics/pilot-v1/tijara-aq-tj-01.test.ts), run inside TIJARA's own Vitest setup with its helpers. A first attempt failed because of a **test-authoring error**: it assumed the order of ledger rows, and `command_seq` is per command. The assertion was made order-independent. This was not an app defect.

### PNEU MOUHIM `ea55329f`
Tests: [pneu-diag.test.php](../diagnostics/pilot-v1/pneu-diag.test.php) (Pest, inside the project's test bootstrap) and a two-process race ([pneu-race-setup.php](../diagnostics/pilot-v1/pneu-race-setup.php), [pneu-race-confirm.php](../diagnostics/pilot-v1/pneu-race-confirm.php)) on a separate database `mouhim_race`.
| ID | Input | Expected | Observed | Result |
|---|---|---|---|---|
| AQ-PM-01 | 2 × 120.00 to a pro customer; pay 100.00 cash; return 1 to account (owner) | invoice 240.00 unchanged; credit note 120.00; debt 20.00; cash 100.00; stock net −1 | invoice 24000c; note 12000c; outstanding **2000c**; cash 10000c; stock 10 → **9** | **PASS** |
| PM-S09 4a cumulative over-return | sold 4; return 1, then 2, then 2 | 3rd refused; 3 returned | 3rd **REFUSED**; returned 3; stock 9 | **PASS** (also covered by the existing AT `DocumentsTest` "Cannot return more than what is left") |
| PM-S10 overpayment | debt 100.00; receive 200.00 | refused | REFUSED (`money.errors.more_than_due`) | **PASS** |
| PM-S10 negative / zero | receive −50.00 and 0 | refused | both REFUSED | **PASS** |
| PM-S10 6 retry identity | debt 100.00; `receive(30.00)` called twice | — | **2 postings**, debt 40.00 | **OBSERVATION (not a defect by itself):** two equal 30.00 payments can be legitimate. What is shown is that `receive()` has **no operation/idempotency key**, so a *retry of the same operation* cannot be recognised. Acceptance (same key twice = 1 posting; same key + different body = conflict; different keys + same amount = 2 postings; concurrent same key = 1) belongs to the fix PR for [PNEU #21](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/21), separate from #19. UI double-tap not tested |
| PM-S11 credit ceiling race | ceiling 1,000.00; two processes confirm 700.00 credit sales at the same instant | exactly one accepted | **both CONFIRMED** (credit 1,400.00 > 1,000.00) in **3 of 3 runs** | **FAIL (proven)**: [PNEU #18](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/18) |
| PM-S11 control (sequential) | same two sales, one after the other | 2nd needs approval | 1st CONFIRMED; 2nd **ApprovalRequiredException** | **PASS**: the rule works, only the concurrent path fails |
| PM-S10 3 close vs receipt race | — | — | — | **NOT_RUN**: needs a cash-day race harness ([PNEU #17](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/17)) |
Note: the existing CI suite passes because it has no multi-connection test for #18. This race is a candidate regression test for the #18 fix.

### RENT CAR `781ab813`
| ID | Input | Expected | Observed | Result |
|---|---|---|---|---|
| AQ-RC-01 / RC-03 | daily rate 100.00 (1 day); late fee 20.00 charged; 120.00 paid; manager waives the fee | one refund entry of 20.00; net 100.00; deposit untouched | after the waiver: total 10000c, paid 12000c, **rest −2000c** (20.00 owed back). Every way to record one 20.00 refund is rejected (`refund`, `rental_refund`, `rental_out`, negative `rental`: all **400**). The only tool is reversing the whole 120.00 entry | **FAIL (proven)**: RC-03, [rent-car #26](https://github.com/hdnkabour-gif/rent-car-app/issues/26) |
| AQ-RC-01 deposit integrity | same contract, deposit 500.00 cash | deposit held 500.00, unaffected by the waiver | depositHeld 50000c; returned 0; kept 0 | **PASS** |
| RC-04 receipt ownership | — | — | the existing AT `slice5.test.ts` "RC-04: independent employees may attach an identical receipt only after each uploads it" passed in the local run (319/319) | **PASS (existing AT, re-executed)** |
| Cash closing | — | — | the existing AT `slice5.test.ts` "expected cash = cash in − cash out; cheques and cards apart; closing once…" passed locally | **PASS (existing AT, re-executed)** |
Test: [rentcar-aq-rc-01.test.ts](../diagnostics/pilot-v1/rentcar-aq-rc-01.test.ts). Revision 2 (Codex P2): it now asserts the exact refund amount (2000c), rest 0, net collected and every deposit balance, so a wrong refund cannot pass. The committed copy was re-run: still FAIL (RC-03 unfixed), as expected. A first attempt hit a setup error (wrong field name `cleanliness` instead of `cleaned`) that returned 409 before the case ran. That was an execution error, not an app result.

## 4. Summary
| App | Proven defects (FAIL) | Passed | Blocked / not run |
|---|---|---|---|
| AMANZINE | **5** (oversell, double decrement, no restore on reject, approve at zero stock, concurrent last unit) | 1 informational | size-level stock (absent) |
| PNEU | **1 proven** (credit-ceiling race #18, 3/3) + **1 missing capability** (no retry identity in `receive()`, #21) | AQ-PM-01, over-return, overpayment/negative/zero, sequential control | cash-day race #17 |
| RENT CAR | **1** (RC-03 partial refund) | deposit integrity, RC-04, cash closing | — |
| TIJARA | 0 | AQ-TJ-01 + isolation; 78/78 suite | cash sessions, partial returns, T25 (unimplemented) |

**What this changes:** AM-S04/S05 move from "suspected (code reading)" to **proven**. #18 and RC-03 move from "reported risk" to **reproduced**. None of the apps becomes production-ready because of a PASS here.

## 5. Tests that should prove the fixes (to be added in each app's own PR)
| Defect | Regression test to add in the app repo | Pass condition |
|---|---|---|
| AMANZINE A1/A2/A4b | approve with qty > stock, at 0 stock, and twice | 409/422; stock unchanged; status transition guarded |
| AMANZINE A3 | reject or cancel an approved order | stock restored exactly once |
| AMANZINE A5 | two concurrent approvals for the last unit (two real DB connections) | exactly one 200 |
| PNEU #18 | the two-process race above, as a CI test with barriers | exactly one CONFIRMED without override, in N runs |
| PNEU #19 | `receive()` with an idempotency key; duplicate key = same payment | one payment row |
| RENT CAR RC-03 | partial `rental` refund entry after a waiver | one refund of 2000c; rest 0; deposit unchanged |

## 6. Owner actions (outside this PR)
1. **Cloud dev environment secrets:** the shared dev environment exposes secret-like values as plain environment variables, tied to a production-like deployment that is not in the inventoried Railway account (names and host are kept out of this public-facing doc; tracked in [Issue #21](https://github.com/hdnkabour-gif/nexus/issues/21)). Plain environment variables are visible to every session using that environment. Check them, remove them, and rotate any real credential. They were not used by any test here.
2. Approve opening app-specific fix PRs: AMANZINE (P0), PNEU #18/#19, RENT CAR RC-03. This session cannot push to `amanzine2`.
3. Containment of public repos: [Issue #21](https://github.com/hdnkabour-gif/nexus/issues/21) is still open and independent.

## Revision 2 (2026-11-20, review comment of 08:03Z + Codex P2)
1. AMANZINE runner syntax fixed; committed file re-run (identical results, egress network-blocked).
2. No-send claim qualified per run (network-proven vs configuration/log based).
3. PNEU retry finding reworded: missing retry identity (#21), not "equal payments are illegal".
4. Header comments corrected (files are stored in NEXUS and copied into each source repo to run); [RUNBOOK.md](../diagnostics/pilot-v1/RUNBOOK.md) added; parse-only CI workflow `diagnostics-syntax.yml` (node --check, php -l, TS syntax), which never runs the diagnostics.
5. Unrelated production-like host and variable names removed from this doc.
6. App-local vs deployed evidence stated explicitly.
Committed PNEU, RENT CAR and TIJARA copies were re-run: same outcomes.

## CHECKPOINT
- **Branch:** `test/pilot-diagnostics-run-v1-20261120` from `main` `bc8e6d13`. Independent of PR #18, #19 and #22.
- **Files:** `docs/35_PILOT_DIAGNOSTIC_RESULTS_V1.md`, `diagnostics/pilot-v1/*` (synthetic test scripts, raw AMANZINE result JSON, the local test Dockerfile without the sandbox CA step).
- **Source SHAs tested:** AMANZINE `4ff08a99`, TIJARA `e5e2b26d`, PNEU `ea55329f`, RENT CAR `781ab813`.
- **Commands actually run:**
  - AMANZINE: `npm test` (server).
  - TIJARA: `npm run typecheck`, `npx vitest run`.
  - RENT CAR: `npm test` (server and web).
  - PNEU: `vendor/bin/pest`.
  - The 4 diagnostics listed above, plus 3 race runs and 1 sequential control.
- **Not run:** PNEU cash-day race (#17); any test against Railway or production; UI-level double-tap tests; AMANZINE browser journeys.
- **Unresolved:** the fix PRs need owner approval and, for AMANZINE, push access; the GitHub CI state of AMANZINE is still unreadable from this session.
