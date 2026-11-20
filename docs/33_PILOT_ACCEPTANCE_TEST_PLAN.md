# 33 — Pilot Acceptance & Test Scenarios V1 (synthetic data only)

**Prepared 2026-11-20** for [Issue #20](https://github.com/hdnkabour-gif/nexus/issues/20). Inputs: Portfolio Baseline V1 ([PR #18](https://github.com/hdnkabour-gif/nexus/pull/18), docs/27–31) and Commercial & Infrastructure Readiness ([PR #19](https://github.com/hdnkabour-gif/nexus/pull/19), docs/32). Both PRs are still open; this document is on an **independent branch from `main`** and links to them instead of copying their files.

Companions: [34_PILOT_TRACEABILITY_MATRIX.md](34_PILOT_TRACEABILITY_MATRIX.md) · customer checklists in French: [pilot-checklists/](pilot-checklists/).

> **This is a plan, not a result.** No scenario below has been executed by this task. Every result is `NOT_RUN` until a person or CI records evidence. "Automated test exists" means a test of that name exists in the repo at the analysed SHA and the latest `main` CI was green (docs/31 E3). It does **not** mean the pilot environment behaves that way.

## 0. Rules for every scenario

### 0.1 Hard boundaries (owner-confirmed 2026-11-20)
- **Synthetic data only.** Both pilot owners (PNEU, RENT CAR) use demo/synthetic data, per the owner. This was not independently inspected.
- No real customer, CIN/passport/licence, invoice, payment, phone number or document. No authentic uploads.
- **Do not run any scenario against a production service** (see §1). No production restore, reset or data deletion. Do not remove PNEU demo data (#14).
- No business names, contacts, screenshots containing personal data, credentials, or raw error logs in GitHub. Evidence goes into the private customer record (docs/32 §4). GitHub only gets pass/fail, the SHA and a synthetic reference.

### 0.2 Synthetic data conventions
| Data | Format | Example |
|---|---|---|
| Person | `TEST <Role> <NN>` | `TEST Client 01` |
| Phone | reserved test pattern, never a real number | `+212 600 000 0NN (TEST)` |
| Identity no. | prefix `TEST` | `TEST000001` |
| Plate | `TEST-NN-A` | `TEST-01-A` |
| Business | `Démo <secteur>` | `Démo Pneus` |
| Images / scans | generated test cards with a visible **SPECIMEN / TEST** watermark; never photos of real documents | — |
Amounts are in MAD. Arithmetic in this plan is shown to 2 decimals; apps store **integer cents** (PNEU D-05, TIJARA, RENT CAR ledger). AMANZINE stores `NUMERIC` (see AM-S07).

### 0.3 Scenario fields
`ID · App · Criticality · Objective · Source (file/test/issue @ SHA) · Environment · Role · Setup · Steps · Expected · Invariants · Evidence required · Negative/permission checks · Clean-up · Status`.

The **Status** column of a scenario records its starting implementation state (`READY_TO_TEST`, `PARTIAL`, `BLOCKED`, `UNIMPLEMENTED`). An execution result (`PASS`/`FAIL`) will be added once someone runs it.
- `READY_TO_TEST`: the feature exists and an automated test exists, so a manual pilot run makes sense.
- `PARTIAL`: some steps exist and others are missing.
- `BLOCKED`: depends on an open issue or a decision.
- `UNIMPLEMENTED`: no code found.

A synthetic `PASS` is **never** reported as production `VERIFIED`.

### 0.4 Evidence types
- **AT**: automated test name in the repo + CI run.
- **MP**: manual pilot run, recorded as tester role (not name), date, app SHA shown by the app/Railway, steps passed/failed, and synthetic screenshot references kept in the private record.
- **CR**: code reading only (weakest; must be turned into AT or MP).

## 1. Where scenarios may run
| App | Allowed for these scenarios | NOT allowed | Why |
|---|---|---|---|
| PNEU MOUHIM | local Docker (`docker compose`, `DemoSeeder`) · Railway `PNEU MOUHIM - STAGING` **after** app and worker run the same SHA (R-008) | `lucid-playfulness / mouhim` (`pneumatiques-mouhim-mouhim.up.railway.app`) | Issue #14 calls it the **shop production database** being prepared for real data. Test writes would pollute #14/#20 preservation proofs |
| RENT CAR | local (`seed:dev`), Railway `Fleetora OCR Staging` (`fleetora-ocr-app-staging.up.railway.app`) | `lucid-playfulness / production` (`jmr-luxe-car.up.railway.app`) | named production; the user forbids production changes even though D-030 says demo data only |
| TIJARA OS | local (`scripts/setup-db.sh`) · `tijara-os-staging` (staging, no real data) | — | no production environment exists |
| AMANZINE | local · `spectacular-victory / staging` (`triumphant-courage-staging…`) with **mocked** delivery/payment | `Amanzine` env (`amanzine.up.railway.app`) | public web; external providers unverified |

Which URL the owners actually received is **UNKNOWN** (docs/32 §9). The Railway mapping above was observed on 2026-11-20 (docs/31 E2) and still needs the owner's confirmation. If a pilot owner was given the `mouhim` or `production` URL, that conflict needs an owner decision (Q-01) before any further testing there.

## 2. Correction to PR #18 (now applied in PR #18 revision 2, `2d40a65`)
docs/30 R-003 says "no evidenced restore from a stored offsite copy for any app". That is **too strong for PNEU**: [PNEU #13](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/13) (2026-11-17) reports:
- an encrypted production backup to a *temporary Railway object-storage bucket*;
- `app:backup-restore --into=<new db>` passing without changing the original DB;
- a byte-identical uploaded-file probe and matching sale counts.

That evidence is **reported in an issue, not independently re-verified here**. R2 offsite restore, the first overnight schedule and retention remain open on #13. RENT CAR #14 reports a synthetic drill in isolated staging only (2026-11-13). Railway volume backups remain 0 (docs/31 E2). Suggested rewording for R-003 when PR #18 is revised: *"No restore from an off-Railway (R2) copy is evidenced; PNEU reports one in-Railway object-storage restore (#13)."*

## 2A. Numeric acceptance cases from the Astra review (owner-relayed 2026-11-20)
Source: Astra's review, relayed by the owner through ChatGPT on 2026-11-20. **Its text is not posted on GitHub**: PR #18/#19 only carry Codex bot summaries with no findings. These are *proposed acceptance results*, **not results that have passed**. The arithmetic below was re-checked for this plan.

| ID | App | Case | Expected (re-checked) | Mapped to | Status today |
|---|---|---|---|---|---|
| AQ-PM-01 | PNEU | Sell **2 pieces at 120.00 each** (240.00); pay 100.00 cash; return 1 piece with a credit note deducted from the debt | net sale **120.00**; cash **100.00**; customer debt **20.00** (240 − 100 − 120); stock: net **one** piece out; original invoice unchanged; one credit note of 120.00 | PM-S07 + PM-S09 | READY_TO_TEST (AT `DocumentsTest` "declares a damaged return, deducts from the customer debt" is the closest; no AT with these numbers) |
| AQ-RC-01 | RENT CAR | Rent 100.00 + late fee 20.00, paid 120.00; the manager waives the fee and refunds it | net collected **100.00**; exactly **one** refund entry of **20.00**; deposit untouched and reported apart | RC-S05 step 3 | **BLOCKED**: this is RC-03 ([#26](https://github.com/hdnkabour-gif/rent-car-app/issues/26)); today only the full receipt can be reversed |
| AQ-TJ-01 | TIJARA | Production 5 kg beef → 4.6 kg kafta + 0.4 kg waste; then sell 1.47 kg kafta | raw beef −5.000 kg exactly once; kafta on hand **3.130 kg** (4.6 − 1.47); waste 0.400 kg recorded once and never deducted again from raw or kafta | TJ2-S03 + TJ2-S01 | READY_TO_TEST (AT T2 and T1 exist separately; the chained case has no AT) |
| AQ-AM-01 | AMANZINE | Two concurrent orders for the **last unit of one size** | one order gets it; stock never negative; **no second shipment** | AM-S02 + AM-S04 | **BLOCKED** at size level (AM-S02 unimplemented). Product-level variant ("last unit of a product") is runnable, but code reading of `orders.js:217-222` predicts a **silent oversell** (clamped at 0, no lock) |

### Cross-cutting checks added from the same review
| ID | Check | Where it applies | Existing evidence | Status |
|---|---|---|---|---|
| AQ-X1 | **Permission revoked during an open session**: the next request is denied without logout | PNEU (role/permission edit by owner), RENT CAR, TIJARA, NEXUS | RENT CAR AT `permissions.test.ts` "changing a role revokes sessions…", "deactivating a user revokes their sessions immediately"; TIJARA AT A3; PNEU AT only for a *deactivated* account at login (`LoginTest`) | RENT CAR/TIJARA READY_TO_TEST; **PNEU UNKNOWN** for mid-session permission removal, so run it as MP |
| AQ-X2 | **Receipt/expense photo ownership**: a receipt is served only to authorised users of its own record | RENT CAR, PNEU | RENT CAR AT `slice5.test.ts` (IDOR + RC-04); PNEU receipt photos sit under `storage/app/public` and #13 asks whether they need authenticated URLs | RENT CAR READY_TO_TEST; **PNEU OPEN** ([#13](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/13) "Private document protection") |
| AQ-X3 | **No re-shipment after a carrier timeout**: a lost response leads to reconciliation by lookup, never a second shipment | AMANZINE | AT `shipment-retry`, `tracking-sync`, `retry-queue`, `auto-ship-on-approval` (mocks) | READY_TO_TEST (mock only); production NOT VERIFIED |
| AQ-X4 | **Restore brings back files with their access rules, and the restored environment triggers no external jobs** (no scheduler, worker, push, WhatsApp, email or delivery calls) | PNEU PM-S13, RENT CAR RC-S11, TIJARA, NEXUS | PNEU AT "keeps restored copies private… refused over HTTP"; RENT CAR has no outbound calls by design (D-038, `data-isolation.test.ts`); PNEU restore env must run with `RUN_SCHEDULER` off and **no worker** (CR: scheduler flag in #13) | PLAN: add to the drill checklists below |

---

## 3. PNEU MOUHIM — first full pilot
Analysed SHA `ea55329f` (main = pilot deployment). Tests are in `tests/Feature/**` (Pest). Roles and defaults come from `app/Enums/RoleName.php` and permissions from `app/Enums/Permission.php`.

**Role matrix to verify** (defaults in `RoleName::defaultPermissions()`):
| Capability | owner | site_manager | seller | storekeeper | technician |
|---|---|---|---|---|---|
| sales.create / payments.receive | ✓ | ✓ | ✓ | ✗ | ✗ |
| costs.view (cost, margin, stock value) | ✓ | ✗ | ✗ | ✗ | ✗ |
| cash.close | ✓ | ✓ | ✗ | ✗ | ✗ |
| transfers.send | ✓ | ✗ | ✗ | ✓ | ✗ |
| transfers.receive | ✓ | ✓ | ✗ | ✓ | ✗ |
| approvals.decide | ✓ | ✗ | ✗ | ✗ | ✗ |
| stock.receive / purchases.manage | ✓ | ✗ | ✗ | ✓ | ✗ |
| any admin page | ✓ | partial | partial | partial | ✗ (no permissions; D-53) |

**Common setup (all PM scenarios):** local Docker or aligned staging; `php artisan db:seed --class=DemoSeeder` (local) or `php artisan app:staging-demo-data` (staging), **never in production**. Create one synthetic user per role, assigned to M01 except the depot storekeeper (DEP). Record the app SHA before starting. **Clean-up:** discard the local DB, or let staging demo data be regenerated. Do not delete rows by hand.

### PM-S01 — Login, roles and site isolation (P0) · READY_TO_TEST
- **Objective:** each role sees only its pages and sites; server-side denial even by direct URL.
- **Source/AT:** `Feature/Auth/LoginTest` (all roles log in, wrong password, 5 attempts/min lock, deactivated refused, no default account); `Feature/Auth/TwoFactorTest` (owner TOTP mandatory, D-47); `Feature/Admin/AccessControlTest` (technician denied every page by URL; seller/storekeeper denied management pages); `Feature/Admin/SiteTest` ("refuses a M01 user opening the M02 site by URL").
- **Steps:**
  1. Log in as each role.
  2. Owner: activate TOTP and log out and in again.
  3. Seller M01: open an M02 sale or stock URL by editing the URL.
  4. Seller: open the costs/margin and cash-closing URLs.
  5. Technician: open `/admin`.
  6. Six wrong passwords in one minute.
- **Expected:** steps 3–5 return 403/404 or a redirect with no data; step 6 locks with a clear message; the owner is asked for a code.
- **Evidence:** MP + the AT names above.
- **Negative checks:** a deactivated user's session stops working; an M02 user cannot reach the M01 site by changing site in the URL; **AQ-X1**: the owner removes `sales.create` from the seller role while the seller is logged in, and the next confirm must be refused (no named AT, so run as MP).

### PM-S02 — Opening stock across 3 sites (P0) · READY_TO_TEST
- **Objective:** opening stock via import and receipts; weighted average cost (CUMP).
- **Source/AT:** `Feature/Foundation/StartupImportTest` (customers with old debt, products, opening stock; whole file refused with line errors); `Feature/Stock/StockServiceTest` (CUMP across receipts, nearest-cent rounding, never guesses an unknown cost); D-08, D-09.
- **Setup:** template from the import screen; 3 products × 3 sites.
- **Steps:**
  1. Import a valid file.
  2. Import a file with one bad line (unknown site).
  3. Receive 4 units at 500.00 then 4 units at 600.00 of the same tyre at DEP.
- **Expected:** step 2 rejects the **whole** file and names the line; average cost after step 3 = (4×500 + 4×600)/8 = **550.00**.
- **Invariants:** `stock_levels` = Σ `stock_movements` per product×site; `php artisan stock:verify` reports no differences.
- **Negative check:** a product with no cost shows "missing cost", not a margin (CLAUDE.md §4).

### PM-S03 — Transfer conservation DEP → M01 (P0) · READY_TO_TEST
- **Source/AT:** `Feature/Stock/TransferTest` (yearly numbering, shortfall at reception needs a reason, cannot receive twice, cancel returns goods to the source, keeps DOT lots, refuses a user without permission or site); D-11.
- **Steps:**
  1. Storekeeper DEP sends 8 tyres to M01.
  2. Site manager M01 receives 7 with reason "1 endommagé".
  3. Try to receive the same transfer again.
  4. Seller tries to send a transfer.
- **Expected:** after step 1, DEP −8 and the goods are *in transit*; after step 2, M01 +7 and the shortfall of 1 is recorded with its reason; step 3 is refused; step 4 is denied (no `transfers.send`).
- **Invariant:** DEP_before − 8 = DEP_after; M01_after = M01_before + 7; the difference of 1 is traceable; total stock never increases.

### PM-S04 — New tyres by DOT lot, used tyres, reservation (P0) · READY_TO_TEST
- **Source/AT:** `StockServiceTest` ("issues new tyres from the oldest DOT first"); `Feature/Stock/UsedTyreTest` (bulge blocks the sale, every check required, scrap with ledger exit, sets within 1 mm, stock:verify per used tyre); `Feature/Sales/DocumentsTest` (only the owner reserves stock on a quote, released at conversion; returned new tyre keeps its original DOT); D-10, D-12, D-13, D-42, D-43.
- **Steps:**
  1. Receive lots DOT 2023 and DOT 2025; sell 2 and check which lot leaves.
  2. Register a used tyre and fail the "bulge" check, then try to sell it.
  3. Owner creates a quote reserving 4; a seller tries to sell the last available units.
- **Expected:** DOT 2023 leaves first; the failed used tyre is hidden from sale; reserved stock is not sellable; the reservation is released when the quote converts or expires.

### PM-S05 — Oil: sealed cans vs drum litres (P0) · READY_TO_TEST
- **Source/AT:** `Feature/Oil/OilDrumTest` (13 tests: litre cost = (purchase + fees) ÷ litres received; sell 2.5 L and freeze the cost; refuse more than what is left or another site's drum; sealed cans never touch drums; two sales on one drum are serialised; stock:verify clean); D-06.
- **Steps:**
  1. Receive a 208 L drum costing 9,000.00 + 360.00 fees, with 205 L actually received.
  2. Sell 4.5 L on an oil-change invoice.
  3. Sell one 5 L sealed can.
  4. Correct the dipstick reading by −1 L with a reason, as a seller.
- **Expected:** litre cost = 9,360.00 / 205 = **45.66** (shown rounded; cost frozen on the line); the drum goes from 205 to 200.5 L; the can sale does not touch the drum; step 4 is denied for a seller (owner or inventory approver only).

### PM-S06 — Service consuming parts / work order (P1) · READY_TO_TEST
- **Source/AT:** `SaleEngineTest` ("creates a work order for services, takes their consumables and assigns technicians (D-53)", "prices a service by rim size and expands a bundle"); "counts the cost of service consumables… in the margin".
- **Steps:** sell "vidange" with a filter + 4.5 L of oil and assign 1 technician; check stock and the margin as the owner.
- **Expected:** the filter and the oil leave stock exactly once; the technician is assigned without a login; margin includes consumables.

### PM-S07 — Selling: cash, card, cheque, credit, discount (P0) · READY_TO_TEST
- **Source/AT:** `Feature/Sales/SaleEngineTest` ("sells 4 tyres at M01 with cash: invoice number, VAT from TTC…", discount caps 5%/10%/owner, approval invalidated when the cart changes, below-cost blocked, partial cash+card+cheque with rest on credit, credit refused without a customer, credit above limit blocked, credit without a limit needs approval); D-18, D-19, D-21, D-50, D-54, D-55.
- **Steps (seller M01):**
  1. 4 tyres × 650.00 TTC, cash.
  2. Same cart with a 7% discount.
  3. After the owner approves, add a fifth tyre.
  4. Sale of 2,600.00: pay 1,000.00 cash + 600.00 card + 400.00 cheque (number, bank, due date), leaving 600.00 on credit for a customer with a 500.00 limit.
- **Expected:**
  - Step 1: total TTC 2,600.00, HT 2,166.67, TVA 433.33 (HT + TVA = TTC exactly); stock −4 at M01 only.
  - Step 2: an approval request is created (5% cap) and payment stays blocked.
  - Step 3: the approval becomes invalid.
  - Step 4: refused, because the credit exceeds the limit; it becomes possible only after the owner's approval.
- **Negative checks:** price below cost needs approval; a cheque without details is refused; credit without a customer is refused.

### PM-S08 — Invoice immutability and numbering (P0) · READY_TO_TEST · ⚠ format decision open
- **Source/AT:** `SaleEngineTest` ("freezes a confirmed invoice: no change, no deletion, not even in SQL (D-15)", "continues the numbering of the last real invoice and never goes back (D-49)"); `Feature/Foundation/InvoiceNumberFormatTest`; `Feature/IssuedInvoiceIntegrityTest`; D-14, D-58.
- **Steps:**
  1. Confirm 3 sales and note their numbers.
  2. Try to edit or delete a confirmed invoice from the UI.
  3. Change the future numbering format.
- **Expected:** numbers are consecutive without gaps; the edit is refused; the format change applies to **future** documents only.
- **Blocker for real use:** the D-58 production format and the next paper number need the owner and accountant (#13). Do not change production settings in this task.

### PM-S09 — Returns, credit notes, exchange, trade-in, refund (P0) · PARTIAL
- **Source/AT:** `Feature/Sales/DocumentsTest` (return with a credit note requested by the seller and approved by the owner; damaged return deducted from debt; exchange voucher pays a new sale; trade-in creates a used tyre awaiting inspection with capped value; returned tyre keeps its DOT); `CreateCreditNoteAction.php`, `CreditNoteHandler.php`.
- **Steps:**
  1. Return 1 of 4 tyres from PM-S07 step 1.
  2. Exchange it for a different tyre using the voucher.
  3. Take a trade-in above the cap.
  4a. **Over-return:** on the same 4-tyre line, after step 1 (1 returned), request returns of 2 then 2 more. Cumulative 1 + 2 + 2 = 5 > 4 sold.
  4b. **Replay:** resend the *same* return request (same form submission / double tap) once.
- **Expected:** stock +1 with the original DOT; the credit note equals the line value; the original invoice is unchanged (pneu-mouhim:D-15). Step 4a: the 2nd request of 2 is refused, because only 1 unit remains returnable; at most 4 units in total are ever credited. Step 4b: one credit note only. Partial returns that stay within the sold quantity are **correct behaviour**, not a defect.
- **Invariant:** sold − returned ≥ 0 per line; customer balance = invoices − payments − credit notes.
- **Gap:** steps 4a/4b (over-return, replay) and a **cash refund paid out of the drawer** have no named AT. Run them as MP and record the result; they stay `UNKNOWN` until then.

### PM-S10 — Cash day: closing, lock, overpayment, negative, replay (P0) · PARTIAL · BLOCKED by #17, #19
- **Source/AT:** `Feature/Money/CashRegisterTest` (drawer = float + cash in − expenses; close with gap, lock, only the owner reopens, D-29; storekeeper has no cash page); `CustomerAccountTest` (cheque rejected restores debt); issues [#17](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/17) PM-02 and [#19](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/19) PM-04.
- **Steps:**
  1. Float 500.00 + cash sales 1,200.00 − expense 150.00 with a photo.
  2. Count 1,540.00 and close.
  3. After closing, take a customer payment dated today.
  4. Pay 700.00 on a debt of 600.00 (overpayment).
  5. Pay −50.00.
  6. Double-tap "Encaisser" (same request sent twice).
- **Expected:**
  - Step 1: expected cash = **1,550.00**.
  - Step 2: gap −10.00 recorded and the day locked.
  - Step 3: refused or moved to an open day, never added to the closed day.
  - Steps 4 and 5: refused or explicitly handled (no silent credit). CR: the guards live in `CustomerAccountActions.php` and `ConfirmSaleAction.php`; there is no named AT for overpayment.
  - Step 6: exactly one receipt.
- **Status:** steps 1–2 are READY_TO_TEST. Steps 3 and 6 are **BLOCKED**: #17 (race between close and receipt) and #19 (financial row vs audit atomicity and duplicate retry) are open. A manual double-tap that passes does not prove concurrency safety; only the multi-connection tests required by those issues can.

### PM-S11 — Concurrency: credit ceiling, last unit (P1) · BLOCKED by #18
- **Source:** [#18](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/18) PM-03; `SaleRules.php`. Stock side covered: `StockServiceTest` "refuses to make a site stock negative", DB constraint test; drums serialised (OilDrumTest 10).
- **Scenario:** two sellers, two browsers, the same customer with a 1,000.00 limit; each confirms a 700.00 credit sale at the same moment.
- **Expected after the fix:** exactly one is accepted. **Today: expected to be able to overshoot (reported risk)**, so do not run it as an acceptance test; it is a regression test owed by #18.

### PM-S12 — Reports, Excel import, duplicates, audit log (P1) · READY_TO_TEST
- **Source/AT:** `Feature/Money/ReportsTest`, `AccountingExportTest`, `WhatRemainsTest`, `TodayTest`; `Feature/Foundation/ActivityLogTest` (refuses UPDATE/DELETE at DB level; seller cannot see the journal); `CreateCustomerAction.php` (duplicate detection).
- **Steps:**
  1. Run the evening summary and the accounting export for the synthetic day.
  2. Create the same customer twice (same phone, different spacing).
  3. Owner filters the journal by M01.
- **Expected:** export totals = sum of the day's invoices; the duplicate is warned; the journal shows the actor, site and IP for each sensitive action.
- **Gap:** product-duplication guard during import has no named AT, so record it as MP.

### PM-S13 — Backup + restore drill of DB **and files**, isolated (P0) · PLAN ONLY
- **Source/AT:** `Feature/Foundation/BackupRestoreTest` (24 tests: restores into a new DB and folder without touching current data; refuses the current DB; damaged archive changes nothing; SHA-256 file check; typed confirmation required in production; restored copies never in the public tree); `BackupRestoreBusinessDataTest` ("three-site business day figure for figure"); #13 report (§2).
- **Plan (do not execute in this task; never against `mouhim`):**
  1. Run on staging or local only.
  2. Take the encrypted archive.
  3. Run `app:backup-restore` into a **new** database and folder.
  4. Compare row counts per table and SHA-256 of every uploaded file.
  5. Run `stock:verify` on the restored DB.
  6. Drop the restored copy.
- **Also verify (AQ-X4):** the restored instance runs with the scheduler off and no worker; no push or notification is sent; restored files are not reachable over public HTTP; **amounts match** (sum of invoices, payments, credit notes, cash days), not only row counts.
- **Evidence:** date, archive id (no key), counts, money totals, hash match yes/no, operator role.
- **Real-data gate:** the same drill **from the R2 copy** in production is owed by #13.

### PM-STOP — Stop conditions before any real data (PNEU)
Real data stays forbidden while any of these are open:
1. [#14](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/14): audited demo-data removal not executed (do **not** execute it here).
2. [#20](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/20): protected-table proof, legacy invoices, complete-file restore.
3. [#17](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/17), [#18](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/18), [#19](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/19): money and credit concurrency.
4. [#13](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/13): R2 offsite restore, overnight schedule, D-58 numbering, private receipt-photo URLs.
5. Global gate in §8.

---

## 4. RENT CAR — second full pilot
Analysed SHA `781ab813` (main = Railway production-demo). Tests are in `server/test/*.test.ts` (Vitest) and `web/**/*.test.tsx`. Permissions come from the SQL migrations `0001`–`0019`. The app has two roles, manager and employee. Some permissions are *delegable* to an individual employee (D-027).

**Role matrix to verify:**
| Permission | manager | employee (default) | delegable |
|---|---|---|---|
| reservations.manage, contracts.manage (check-out/in), payments.record | ✓ | ✓ | — |
| pricing.change | ✓ | ✗ | ✓ |
| contracts.extend | ✓ | ✗ | ✓ |
| payments.reverse, deposits.refund, deposits.retain | ✓ | ✗ | ✓ |
| customers.verify, customers.block | ✓ | ✗ | ✓ |
| vehicles.documents, vehicles.manage, vehicles.admin | ✓ | ✗ | ✓ |
| cash.close, reports.read | ✓ | ✗ | ✓ |
| infractions.read/manage | ✓ | ✗ | — |
| branches.all | ✓ | ✗ | ✓ |

**Common setup:** local (`npm run migrate`, `npm run create-manager -w server`, `npm run seed:dev -w server`) or Fleetora OCR Staging. Two branches: `TEST Casablanca` and `TEST Marrakech`. One manager, one employee per branch. Three synthetic vehicles. **Clean-up:** a disposable DB, as tests do (D-029). Business tables refuse DELETE (D-035), so do not try to "clean" rows by hand.

### RC-S01 — Login, roles, branches (P0) · READY_TO_TEST
- **Source/AT:** `server/test/auth.test.ts`:
  - hardened cookie and generic error message;
  - lock after repeated failures;
  - CSRF header and Origin required;
  - 429 rate limit;
  - idle and absolute expiry;
  - logout revokes server-side;
  - no session fixation.
  `permissions.test.ts`: cannot change own role via the API; role in the login body ignored; denied attempts audited; last manager protected. `reservations.test.ts`: "an employee of Casablanca neither sees nor books Marrakech vehicles".
- **Steps:**
  1. Employee Casablanca opens a Marrakech vehicle or reservation URL.
  2. Employee tries a price change, a deposit refund and cash closing.
  3. Manager deactivates the employee while the employee is logged in.
- **Expected:** steps 1–2 are refused and audited; after step 3 the employee's next request is rejected.

### RC-S02 — Availability and reservation overlap (P0) · READY_TO_TEST
- **Source/AT:** `reservations.test.ts`:
  - 24-hour days;
  - "never allows two overlapping active reservations… back-to-back is fine";
  - "REVIEW CASE: simultaneous bookings… exactly one through";
  - cancellation needs a reason;
  - no-show only after pickup time.
  D-036 (exclusion constraint).
- **Steps:**
  1. Book `TEST-01-A` from 10/12 10:00 to 13/12 10:00.
  2. Book the same car from 12/12 09:00.
  3. Book from 13/12 10:00 exactly.
  4. Two employees book the same slot at the same moment.
- **Expected:** step 1 = 3 days; step 2 is refused; step 3 is accepted (back-to-back); step 4: exactly one succeeds.

### RC-S03 — Contract, check-out, print, signed scan, check-in (P0) · READY_TO_TEST
- **Source/AT:** `contracts.test.ts`:
  - contract with frozen copy;
  - refuses: vehicle not inspected, lower mileage, paper number used twice;
  - signed paper scan and photos kept with the contract and served only from it;
  - template versions;
  - minimum driver age 18.
  D-015, D-039, D-041.
- **Steps:**
  1. Check out with km 45,000, fuel 3/4 and 4 synthetic photos.
  2. Print the contract (browser PDF).
  3. Upload a synthetic "signed" scan.
  4. Check in with km 44,900.
  5. Check in again with km 45,620, fuel 1/2 and 2 photos.
- **Expected:** step 4 is refused (lower mileage); after step 5 the vehicle is "inspection pending" (D-028); the signed scan is not editable; the contract keeps its template version.

### RC-S04 — Payments, deposit, refund, retention (P0) · READY_TO_TEST
- **Source/AT:** `contracts.test.ts` ("rental is paid in cash or transfer; overpayment and wrong rights are refused"; "deposit: refund and keep need their rights; kept needs a reason; mistakes are reversed, never edited"); `slice5.test.ts` (income = rent paid + deposits kept; deposits received are not income); D-040, D-047, D-048.
- **Steps:**
  1. Rent 3 days × 400.00 = 1,200.00; deposit 5,000.00 in cash.
  2. Pay 700.00, then try 600.00.
  3. Pay 500.00.
  4. Return without damage; refund the deposit as an employee, then as manager.
  5. Second scenario: keep 300.00 for fuel with a reason.
  6. Reverse a wrong payment.
- **Expected:**
  - Step 2: the second payment is refused (overpayment: 700 + 600 > 1,200).
  - Step 4: refused for the employee, accepted for the manager.
  - Report: income = 1,200.00 (+ 300.00 kept in step 5), deposits shown apart.
  - Step 6: a reversal entry is created, the original is not edited.
- **Invariant:** cash closing expected = cash in − cash out; cheques and card holds are not counted as cash.

### RC-S05 — Late return decided by the manager; partial refund (P0/P1) · PARTIAL · BLOCKED by #26 (RC-03)
- **Source/AT:** `contracts.test.ts` ("late return: an employee does the return, the MANAGER decides day / half day / hour", "on-time return: nothing to decide"); D-044; [#26](https://github.com/hdnkabour-gif/rent-car-app/issues/26).
- **Steps:**
  1. Return 2 h late (tolerance 60 min); the employee records the return.
  2. The manager decides on 1 half day at 200.00; payment is collected.
  3. The manager later waives 100.00 of that charge (partial refund).
  4. Submit the same decision twice.
- **Expected:** step 2 adds 200.00 to the amount due; step 3 should allow a **partial** refund of 100.00. **Today this is RC-03 OPEN**: the ledger can only reverse the full receipt, so step 3 is `BLOCKED`. Step 4 should yield one charge; its idempotency has no named AT, so it is `UNKNOWN` until run.
- **RC-04** (duplicate receipt ownership) is fixed by PR #29 (`slice5.test.ts` "RC-04: independent employees may attach an identical receipt only after each uploads it"), so it is READY_TO_TEST.

### RC-S06 — Customer intake link and time-limited code (P0) · READY_TO_TEST
- **Source/AT:** `customer-intake.test.ts`:
  - time-limited code, plaintext never stored;
  - rejects invalid codes, locks after 5 guesses;
  - rejects an expired or revoked link;
  - uploads after consent, attached only after manager approval;
  - OCR is manager-only and fails closed if disabled;
  - no invitation for an already-booked vehicle.
- **Steps:**
  1. Manager creates an intake link for a synthetic customer.
  2. Open it with a wrong code 5 times.
  3. With the correct code after expiry.
  4. Revoke a link, then open it.
  5. Upload 3 synthetic SPECIMEN images.
- **Expected:** steps 2–4 are refused (lock after 5); uploads stay *pending* and are not attached to the customer until a manager approves.

### RC-S07 — Synthetic OCR (AR/FR/Latin MRZ) with mandatory human review (P0) · READY_TO_TEST (synthetic only)
- **Source/AT:** `local-ocr.test.ts` (stays a suggestion; rejects foreign or out-of-bounds output); `vehicle-ocr.test.ts`; `customer-intake.test.ts` (manager corrections stored independently, employee approval forbidden); PRs #20, #25 (framing, TD1 MRZ, licence labels); #15 (open P1 for mobile framing); D-004, D-038 (no external OCR).
- **Setup:** generated SPECIMEN cards only:
  - FR/AR identity-style card;
  - TD1 MRZ with valid and invalid check digits;
  - licence-style card;
  - a vehicle registration-style card;
  - one blurred, one skewed, one dark.
  **No real CIN or permit, ever.**
- **Steps:**
  1. Run OCR on each card.
  2. Accept nothing automatically.
  3. Employee tries to approve.
  4. Manager corrects a field and approves.
  5. Upload a vehicle document to a *customer* and a customer card to a *vehicle*.
- **Expected:** low-quality images give retake guidance, not a guess; invalid MRZ check digits are not used; step 3 is refused; step 4 stores the correction separately and audits it; step 5 is rejected or flagged (no cross-entity confusion).
- **Evidence:** per card, the fields proposed, their confidence and the reviewer's decision.
- **Gap:** #15 (mobile perspective and field mapping) is still open, so record mobile capture quality as MP with `PARTIAL`.

### RC-S08 — Files: missing, stale, duplicate, spoofed; branch isolation (P0) · READY_TO_TEST
- **Source/AT:** `vehicle-docs.test.ts`:
  - real types from content;
  - spoofed, empty and oversized files refused;
  - a duplicate photo on retry is not duplicated;
  - another branch's files never served.
  `customers.test.ts` ("same scan on another customer is flagged"); `storage-concurrency.test.ts`; `file-report.test.ts`, `storage-health.test.ts` (missing file reported); `slice5.test.ts` IDOR on receipts.
- **Steps:**
  1. Upload a `.jpg` that is actually a PDF.
  2. Upload a 0-byte file.
  3. Upload an oversized file.
  4. Upload the same photo twice (simulated retry).
  5. Request a Marrakech file id as a Casablanca employee.
  6. Rename a stored file in a local test volume and run the live check.
- **Expected:** steps 1–3 are refused; step 4 stores one record; step 5 is refused; step 6 is reported as missing and nothing is silently re-created.

### RC-S09 — Mobile usability and accessibility (P1) · READY_TO_TEST (MP)
- **Source:** `docs/USABILITY_TEST_PLAN.md`, `docs/UX_GUIDELINES.md`, `docs/ACCEPTANCE_TEST_PLAN_AR.md`; web tests `i18n.test.tsx`, `no-technical-codes.test.tsx`.
- **Steps:** an employee completes RC-S02 → RC-S04 on a 375 px phone in Arabic (RTL) and in French, timing each task and noting any unclear wording.
- **Expected:** no horizontal scroll; touch targets are large enough; no technical error codes shown; RTL is correct.

### RC-S10 — Infractions (NARSA) manual registry (P2) · READY_TO_TEST
- **Source/AT:** `infractions.test.ts`; PR #31; `docs/INFRACTIONS_NARSA_MVP.md`; #30.
- **Steps:**
  1. Manager records a synthetic infraction at a time inside a rental.
  2. Matching suggests the contract; the manager confirms.
  3. An employee tries to read the registry.
- **Expected:** a suggestion only, with the manager's decision audited; the employee is denied (no `infractions.read`).

### RC-S11 — Disaster-recovery drill DB + files + manifest, isolated (P0) · PLAN ONLY
- **Source/AT:** `backup.test.ts` (6) and `offsite-backup.test.ts` (≈30: encrypted, authenticated manifest, push → list → pull → verify, wrong passphrase fails, symlinks refused, retention never deletes the last verified copy); `BACKUP_RESTORE.md`; `npm run backup-drill -w server`; #14, #22.
- **Plan (never against production):**
  1. Run on staging or local.
  2. Take an encrypted backup.
  3. Push it to a test off-site target.
  4. Pull it into a detached folder.
  5. Restore into a fresh isolated DB.
  6. Check every SHA-256 and the row counts.
  7. Drop the copy.
- **Also verify (AQ-X4):** each restored file is linked to its original record (vehicle, customer, contract) with the same access rules; ledger totals match; no reminder or job runs from the restored copy.
- **Evidence:** drill record id, counts, ledger totals, hash result.
- **Decision preserved:** Railway remains demo-only (D-030). Real production is the company host (D-012) until the owner explicitly changes that decision (docs/32 §5.2).

### RC-STOP — Stop conditions before any real data (RENT CAR)
1. D-030 / D-012 unchanged: Railway may only hold fictitious data.
2. [#14](https://github.com/hdnkabour-gif/rent-car-app/issues/14): production offsite backup and restore proof.
3. [#22](https://github.com/hdnkabour-gif/rent-car-app/issues/22): independent security, finance, document and recovery audit not closed.
4. [#26](https://github.com/hdnkabour-gif/rent-car-app/issues/26) RC-03: partial late-charge refund.
5. A CNDP / legal review for identity documents and licences (docs/32 §3.4).
6. Global gate in §8.

---

## 5. TIJARA OS — three sector pilots
Analysed SHA `e5e2b26d` (main = staging). Tests are in `test/*.test.ts` (Vitest on real PostgreSQL). Activity templates are in `src/templates.ts` (`butcher`, `grill`, `restaurant`, `grocery`, `equipment`, `mechanic`, `security_systems`). Known limits are listed in `docs/TEST_STATUS.md`. **Setup:** local `scripts/setup-db.sh` or `tijara-os-staging`; a platform admin creates a synthetic shop with the chosen activities (`W4`). Clean-up: a disposable DB or a new tenant.

### TJ-02 — Butcher / grill (PILOT-TJ-02)
| ID | Crit. | Scenario | Source / AT | Expected and invariants | Status |
|---|---|---|---|---|---|
| TJ2-S01 | P0 | Receive 10 kg of beef; sell 1.47 kg of kefta at 130.00/kg + grilling 20.00/kg | `sales.test.ts` T1; `api.test.ts` J1; `e2e.test.ts` E1, E6 | total **220.50** (191.10 + 29.40); the meat leaves stock **once**; weighing alone never moves stock | READY_TO_TEST |
| TJ2-S02 | P0 | Grams vs kg entry (1470 g = 1.47 kg); rounding on the receipt equals the screen | `e2e.test.ts` E6 ("weighed totals match"); `baseUom: 'kg'` in templates | same total whichever unit is shown. **No unit-conversion table exists** (docs/TEST_STATUS "no units of measure") | PARTIAL |
| TJ2-S03 | P0 | Recipe / production: 5 kg beef → 4.6 kg kafta + 0.4 kg waste | `production.test.ts` T2, unbalanced order refused | raw −5 kg exactly once; waste is a document line at estimated cost; inputs = outputs + waste | READY_TO_TEST |
| TJ2-S04 | P0 | Cancel before weighing, after weighing, after commit, during grilling | `sales.test.ts` T3–T6 | release only / return needs approval or write-off / during grilling = write-off | READY_TO_TEST |
| TJ2-S05 | P0 | Partially paid invoice and later collection; credit limit | `sales.test.ts` T22; `api.test.ts` J2 | balance = invoice − allocations; limit enforced | READY_TO_TEST |
| TJ2-S06 | P0 | Discount above the limit, sole owner, step-up | T15, T15b, T16 | blocked until a **different** user approves; a sole owner self-approves only with a reason, flagged. **Step-up is a flag, not real re-authentication** | PARTIAL |
| TJ2-S07 | P0 | Two registers race for the last 2 kg | `ledger.test.ts` T8, T8b | exactly one wins; never negative | READY_TO_TEST |
| TJ2-S08 | P0 | Double tap on pay; retry with the same key | `e2e.test.ts` E6, E7; `ledger.test.ts` T12, T13; `api.test.ts` A11 | one payment; the same key with a different body gives CONFLICT | READY_TO_TEST |
| TJ2-S09 | P0 | Role and branch isolation; shop A vs shop B | `api.test.ts` A7–A9; `isolation.test.ts` T9–T11; `e2e.test.ts` E4 | no cross-shop or cross-branch read/write, even by id | READY_TO_TEST |
| TJ2-S10 | P1 | **Cash session open/close (caisse)** | docs/TEST_STATUS O21 | — | **UNIMPLEMENTED** |
| TJ2-S11 | P1 | **Partial return of one line** | docs/TEST_STATUS ("full-invoice refund only") | — | **UNIMPLEMENTED** |
| TJ2-S12 | P1 | Phone in Arabic (RTL) at 375 px | `e2e.test.ts` E2 | no overflow; touch targets | READY_TO_TEST |

### TJ-01 — Auto mechanic (PILOT-TJ-01)
| ID | Crit. | Scenario | Source | Status |
|---|---|---|---|---|
| TJ1-S01 | P1 | Sell parts (filter, brake pads) + service (oil change) + labour hours from the `mechanic` template | `templates.ts`; `sales.test.ts` T21 (mixed activity, each component leaves stock once) | READY_TO_TEST (as a counter sale) |
| TJ1-S02 | P0 | Customer **vehicle** record (plate, km, history) | no `vehicles` table in `db/migrations` | **UNIMPLEMENTED** |
| TJ1-S03 | P0 | **Work order** life cycle (open → diagnosis → quote → parts reserved → done → invoice) | T25 not built; no `work_orders` table | **UNIMPLEMENTED** |
| TJ1-S04 | P1 | Parts warranty on repair | T20 covers serial warranty on sale only | PARTIAL |
**Requirements discovery worksheet (fill with the owner before building):** see [pilot-checklists/PILOT-TJ-01_fr.md](pilot-checklists/PILOT-TJ-01_fr.md) §B. Reuse candidates *as specifications only*: PNEU `work_orders` and `user_work_order` (D-53), PNEU and RENT CAR vehicle catalogue (docs/27 RU-04).

### TJ-03 — Alarm & fire equipment (PILOT-TJ-03)
| ID | Crit. | Scenario | Source | Status |
|---|---|---|---|---|
| TJ3-S01 | P0 | Serial-numbered detector or panel sold once; installation service touches no stock; warranty recorded | `sales.test.ts` T20; `api.test.ts` J3; `e2e.test.ts` E3 | READY_TO_TEST |
| TJ3-S02 | P0 | Same serial sold twice; return of a serial item | T20 ("a serial-numbered pump is sold once…"); returns are full-invoice only (docs/TEST_STATUS) | PARTIAL |
| TJ3-S03 | P0 | **Installation job** at a customer site with a technician | T25 | **UNIMPLEMENTED** |
| TJ3-S04 | P0 | **Maintenance contract and periodic visits** (extinguisher checks) | no tables | **UNIMPLEMENTED** |
| TJ3-S05 | P1 | Equipment installed per customer site (register) | serials exist, no site register | **UNIMPLEMENTED** |
Worksheet: [pilot-checklists/PILOT-TJ-03_fr.md](pilot-checklists/PILOT-TJ-03_fr.md) §B. Reuse candidate as a specification: PNEU `equipment` / `equipment_events`.

**TIJARA real-data stop conditions:** `docs/DEPLOYMENT.md` "Conditions for real data" 1–6:
1. scheduled backup and restore from a stored copy;
2. `main` protection;
3. email recovery;
4. sensitive-field encryption;
5. shared rate limit;
6. CNDP.

Plus the global gate in §8.

---

## 6. AMANZINE — limited clothing pilot (PILOT-AM-01)
Analysed SHA `4ff08a99` (main = `Amanzine` + staging). The GitHub issues and CI state for this repo are **UNKNOWN** (no API access, docs/27). External providers (Promo Livraison, Amana, CMI, WhatsApp, Cloudinary) are **not verified** and must be **mocked or sandboxed**. Never create a real shipment or charge.

| ID | Crit. | Scenario | Source (CR = code reading) | Expected | Status |
|---|---|---|---|---|---|
| AM-S01 | P0 | Merchant creates 5 synthetic garments with photos | `server/routes/products.js:21`; `products.images` JSONB; `product-persistence.test.js` | products persist; images load from the media store | READY_TO_TEST |
| AM-S02 | P0 | **Stock per size × colour** (e.g. T-shirt M/Noir = 3, L/Blanc = 0) | `server/migrate.js:81-93` CR: one `stock INTEGER` per product + `sizes` JSONB list; no variant table | selling L/Blanc must be refused | **UNIMPLEMENTED** |
| AM-S03 | P0 | Cart → order with idempotency key; double submit | `orders.js:44-77`; `order-idempotency.test.js` | one order; a reused key with a different body gives 409 | READY_TO_TEST |
| AM-S04 | P0 | Merchant approves an order → stock decrement | `orders.js:200-222` CR: decrement on approve, read-then-write, `Math.max(0, stock − qty)`; no status check before approving | order of 3 with stock 2 → **must be refused**. CR suggests it is clamped to 0 (silent oversell); approving twice may decrement twice. **Needs a test** | **OPEN (suspected defect, CR)** |
| AM-S05 | P0 | Reject or cancel after approval → stock restored | `orders.js:345-353` CR: sets `cancelled`, no stock restore | stock back to the previous value | **OPEN (suspected defect, CR)** |
| AM-S06 | P0 | **Return / exchange** (size swap) with stock and money reversal | no table or route named returns found (CR). Absence of a name is not proof; a complete return → stock → payment reversal path is **unverified** | stock and amount reversed exactly once | **UNVERIFIED (treat as not available)** |
| AM-S07 | P1 | Money rounding: 3 × 129.90 − coupon 10% + delivery 35.00 | `products.price NUMERIC`; `order-costing.test.js`, `pricing-engine.test.js` | 389.70 − 38.97 + 35.00 = **385.73**; same on screen, order and payment | READY_TO_TEST (verify no float drift) |
| AM-S08 | P0 | Delivery via Promo Livraison **mock**: create, timeout, unknown status, reconcile, no duplicate shipment | `promo_livraison-contract.test.js`, `shipment-retry.test.js`, `tracking-sync.test.js`, `retry-queue.test.js`, `auto-ship-on-approval.test.js` | a timeout leads to reconciliation by query, not a second shipment; unknown stays UNKNOWN | READY_TO_TEST (mock only); production NOT VERIFIED |
| AM-S09 | P1 | Customer tracking by code; privacy of tracking by phone | `orders.js` `GET /track/:phone`, `/track-code/:code`; `order-tracking.test.js`; branch `repair/amanzine-p0-tracking-privacy-20261113` | tracking by phone must not expose another customer's orders | **UNKNOWN** (was a repair branch merged? CI not visible) |
| AM-S10 | P1 | Mobile Darija/FR: a buyer orders on a 375 px phone | `src/` PWA; golden journeys in CI (docs/27) | order completed; text understandable | READY_TO_TEST (MP) |
| AM-S11 | P0 | Settlement: COD collected by the carrier vs order total vs payout | `payments`, `wallets` tables; CMI unverified | — | **BLOCKED** (no verified settlement path) |
**Decision before the pilot (docs/32 §5.4):** either add variant stock and returns to AMANZINE and fix AM-S04/S05, or run the clothing trial on a ready-made shop (Astra comparison). AMANZINE stays untouched either way.

---

## 7. Supporting systems (short checklists)
| ID | System | Scenario | Expected | Status |
|---|---|---|---|---|
| AX-S01 | ALLOSERVIX | Visitor sends a quote or contact request with synthetic data | stored only if `ENABLE_INQUIRIES`; encrypted (`inquiries.enc`); no price promised; no technician chosen by AI | READY_TO_TEST (staging config) |
| AX-S02 | ALLOSERVIX | Staff admin: password + TOTP, invite, wrong TOTP, lockout | `docs/ADMIN_ACCESS_CONTROL_V15.md`; `tests/*.test.js` | READY_TO_TEST |
| AX-S03 | ALLOSERVIX | Assistant with `ENABLE_AI` off: answer from the catalogue only; with prompt injection text | deterministic match; no external call (`docs/AI_INTENT_ONLY.md`) | READY_TO_TEST |
| NX-S01 | NEXUS | Shows GitHub SHA vs deployed SHA; stale data shows UNKNOWN; HTTP 200 ≠ healthy business; backup listed ≠ restorable | docs/24–26; `tests/public-probes.test.mjs`, `command-os.test.mjs` | READY_TO_TEST (read-only) |
| NX-S02 | NEXUS | Owner session, CSRF, logout, password change | `tests/auth.test.mjs`, `csrf.test.mjs`, `owner-db.test.mjs` | READY_TO_TEST |
| SF-S01 | SCANFLOW | Local only: 3 synthetic PDFs (one corrupt, one 60 pages, one with a forged extension); ROI; extract codes; merge; ZIP; clear-old-files | corrupt file rejected; nothing leaves the PC; temp files cleaned. **API has no auth**: never expose it on a network | READY_TO_TEST (local), no CI |
| NR-S01 | NEXORA | Synthetic demo: switch org/role; data lives in browser memory; `/api/health` only | no patient endpoint; refresh resets the data; **no real patient data** | READY_TO_TEST |
| TP-S00 | TECH PLATFORM 2M | — | **No tests against employer systems.** Any test needs written employer permission (ADR-010, docs/30 R-001/R-005) | EXCLUDED |

## 8. Global risk gate before ANY real usage (per app; all must be true)
| # | Gate | Evidence required | PNEU | RENT CAR | TIJARA | AMANZINE |
|---|---|---|---|---|---|---|
| G1 | No real personal data entered until the gate clears | owner statement + spot check of the environment | owner-stated ✓ (not inspected) | owner-stated ✓ (not inspected) | no real data (doc) | unknown |
| G2 | P0 security issues fixed | linked issues closed with tests | #20 open | #22 open | conditions 3–5 open | UNKNOWN |
| G3 | **Isolated restore of the actual stored backup (DB + attachments)** from the off-site copy | drill record: date, counts, hashes | partial (#13: Railway bucket, not R2) | synthetic staging only (#14) | local only | none found |
| G4 | Authorised production configuration (environment, domain, secrets set by the owner, scheduled jobs observed) | Railway + app check | #13 schedule unobserved | D-012 host not built | backup service not deployed | providers unverified |
| G5 | Legal, contract and privacy responsibilities agreed (controller vs provider, hosting location, retention, CNDP) | signed document (kept private) | open | open (identity documents) | open | open |
| G6 | App-specific go-live decision approved by the owner (and the customer) | written decision with date and SHA | open | open | open | open |
Until all of G1–G6 hold for an app, every pilot result is **synthetic acceptance only**.

## 9. Owner decisions (PR #22 comment, 2026-11-20 05:04Z)
| Q | Decision | Effect on this plan |
|---|---|---|
| Q-01 URLs | `UNKNOWN`; do not infer the URL sent from Railway | §1 table stays "observed, unconfirmed". **No destructive or manual transaction tests on PNEU `mouhim` or RENT CAR `production`.** Existing browsing stays passive and synthetic-only |
| Q-02 testers | Two evidence streams: **technical operator** runs tests in isolated fixtures; **business owner** does usability/business acceptance on a safe synthetic environment | Record role, app/deployed SHA, outcome and support time; no personal details |
| Q-03 expected failures | Allowed **only** in isolated, non-production environments, as diagnostic regression tests first | Report "failing test showing a bug" separately from "test execution error"; fixes go to app-specific PRs. PNEU staging app/worker SHA alignment (R-008) comes first |
| Q-04 clothing | Compare **WooCommerce** on the same narrow clothing pilot first (size×colour stock, refunds/exchanges, COD/shipping, 12-month ownership cost); AMANZINE is not deleted or replaced | AM-S02/S06/S11 stay unavailable. **AM-S04/S05 suspected stock defects are a separate P0 verification track** with safe automated tests in the AMANZINE repo, whatever the comparison decides |
| Q-05 TIJARA | Discovery worksheets from both prospects **before** T25 | TJ1-S02/S03, TJ3-S03…S05 stay `UNIMPLEMENTED` |
| Q-06 stage | PNEU and RENT CAR = `ACTIVE_TRIAL · OWNER_STATED · SYNTHETIC_ONLY`, applied in **PR #19's** registry, not here | Does not imply a verified login, a PASS, acceptance, production use or payment |
Testing constraints restated: never send a real shipment, payment, WhatsApp, SMS or email; every result stays `NOT_RUN` until evidence is recorded.

## CHECKPOINT
- **Branch:** `docs/pilot-acceptance-scenarios-v1-20261120`, from NEXUS `main` `bc8e6d13`. It is **independent** of PR #18/#19, whose branches are untouched.
- **Files:** `docs/33_PILOT_ACCEPTANCE_TEST_PLAN.md`, `docs/34_PILOT_TRACEABILITY_MATRIX.md`, `docs/pilot-checklists/_COMMON_fr.md` + `PILOT-{PM-01,RC-01,TJ-01,TJ-02,TJ-03,AM-01}_fr.md`. No README or registry edits, to avoid conflicts with #18/#19.
- **Source SHAs read:**
  - PNEU `ea55329f`: `app/Enums/{RoleName,Permission}.php`, `app/Actions/**`, `app/Console/Commands/*`, 53 test files' titles.
  - RENT CAR `781ab813`: `server/migrations/0001–0019` permission grants, `server/test/*.test.ts` titles, `package.json` scripts.
  - TIJARA `e5e2b26d`: `src/templates.ts`, `test/*.test.ts` titles, `docs/TEST_STATUS.md`.
  - AMANZINE `4ff08a99`: `server/routes/orders.js`, `server/migrate.js`, `server/test/*`.
- **Astra input:** numeric cases and cross-cutting checks relayed by the owner (§2A); no Astra text on GitHub.
- **Issues read:** PNEU #13, #14, #17–#20; RENT CAR #14, #15, #16, #22, #26 (latest comments included).
- **Executed in this task:** no app test suite, no scenario, no environment access beyond read-only reading of the source files. NEXUS checks are listed in the PR.
- **Not done:** any run against Railway; ERPNext/Odoo/WooCommerce comparison (Astra); legal review.
- **Revision 2 (2026-11-20):** owner decisions §9 recorded; PM-S09 over-return/replay steps made precise (Codex P2 review on `abe70c0`); AM-S06 wording tightened; §2 points to PR #18 revision 2.
- **Unresolved:** Q-01 URLs still UNKNOWN; AM-S04/S05 suspected defects need a test in the AMANZINE repo (separate task, not created here); AMANZINE issue/CI state UNKNOWN.
