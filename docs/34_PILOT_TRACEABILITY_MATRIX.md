# 34 — Pilot Traceability Matrix (V1, 2026-11-20)

Business requirement → current implementation → test evidence → blocker → GitHub issue. The scenario IDs refer to [33_PILOT_ACCEPTANCE_TEST_PLAN.md](33_PILOT_ACCEPTANCE_TEST_PLAN.md).

**Pilot result** is `NOT_RUN` for every row until someone runs the scenario and records the evidence. "AT" means an automated test exists by that name at the analysed SHA and the latest `main` CI was green, as recorded in docs/31 E3 (PR #18). It is not proof that the pilot environment behaves that way.

SHAs: PNEU `ea55329f` · RENT CAR `781ab813` · TIJARA `e5e2b26d` · AMANZINE `4ff08a99`.

## PNEU MOUHIM
| Requirement (source) | Implementation | Test evidence | Scenario | Blocker | Issue | Pilot result |
|---|---|---|---|---|---|---|
| Server-side role and site permissions (CLAUDE.md §4, D-32, D-33) | `RoleName::defaultPermissions`, Policies | AT `AccessControlTest`, `SiteTest`, `LoginTest`, `TwoFactorTest` | PM-S01 | — | — | NOT_RUN |
| Stock only through the movements ledger (D-08) | `StockService`, `stock_movements` append-only | AT `StockServiceTest` ("keeps the stock ledger append-only") | PM-S02 | — | — | NOT_RUN |
| Never negative stock (D-45) | row locks + DB constraint | AT `StockServiceTest` (2 tests) | PM-S02/S11 | — | — | NOT_RUN |
| Weighted average cost, no guessed cost (D-09) | `StockService` | AT `StockServiceTest` | PM-S02 | accountant confirmation (D-09) | — | NOT_RUN |
| Opening data import (§17) | `Services/Imports` | AT `StartupImportTest` | PM-S02 | product-duplicate guard: no AT | — | NOT_RUN |
| Transfers with 3 statuses (D-11) | `Send/Receive/CancelTransferAction` | AT `TransferTest` (8) | PM-S03 | — | — | NOT_RUN |
| Oldest DOT first (D-10); used tyres with a safety check (D-12) | `StockService`, `UsedTyreActions` | AT `StockServiceTest`, `UsedTyreTest` (9) | PM-S04 | — | — | NOT_RUN |
| Quote reservation by the owner only (D-13, D-56) | `QuoteActions` | AT `DocumentsTest` | PM-S04 | — | — | NOT_RUN |
| Oil cans vs drums in litres (D-06) | `Services/Oil`, `oil_drum_movements` | AT `OilDrumTest` (13) | PM-S05 | — | — | NOT_RUN |
| Service consumables and work order entered by the seller (D-53) | `WorkOrderActions` | AT `SaleEngineTest` | PM-S06 | — | — | NOT_RUN |
| Discount caps and approvals (D-18, D-25, D-55) | `RequestSaleApprovalAction`, `Approvals` | AT `SaleEngineTest` (4) | PM-S07 | — | — | NOT_RUN |
| Credit decided by the owner (D-21, D-54) | `SaleRules` | AT `SaleEngineTest` (3) | PM-S07 | concurrent overshoot | [#18](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/18) | NOT_RUN |
| Mixed payments + cheques (D-22, D-50) | `ConfirmSaleAction`, `CustomerAccountActions` | AT `SaleEngineTest`, `CustomerAccountTest` | PM-S07 | — | — | NOT_RUN |
| Invoice frozen, correction only by credit note (D-15) | DB protection + `CreateCreditNoteAction` | AT `SaleEngineTest` ("not even in SQL"), `IssuedInvoiceIntegrityTest` | PM-S08/S09 | legacy invoice PDFs | [#20](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/20) PM-05 | NOT_RUN |
| Numbering (D-14, D-49, D-58) | `SequenceService` | AT `InvoiceNumberFormatTest`, `SaleEngineTest` | PM-S08 | production format + next number | [#13](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/13) | NOT_RUN |
| Returns, exchanges, trade-ins (D-52, D-56) | `CreditNoteHandler` | AT `DocumentsTest` (11) | PM-S09 | over-return (cumulative > sold), replay and cash refund: no AT | — | NOT_RUN |
| Cash day close and lock (D-29) | `Services/Money/CashRegister` | AT `CashRegisterTest` (3) | PM-S10 | close vs receipt race; audit atomicity and retry | [#17](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/17), [#19](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/19) | NOT_RUN |
| Overpayment / negative payment refused | CR: guards in `CustomerAccountActions`, `ConfirmSaleAction` | **no named AT** | PM-S10 | — | — | UNKNOWN |
| Immutable activity log (D-34) | PG trigger | AT `ActivityLogTest` | PM-S12 | — | — | NOT_RUN |
| Daily backup of DB + files (D-37, CLAUDE.md §7) | spatie backup + `RestoreDatabaseBackupAction` | AT `BackupRestoreTest` (24), `BackupRestoreBusinessDataTest`; reported production restore from the Railway bucket (#13) | PM-S13 | R2 offsite restore, overnight schedule | [#13](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/13) | PLAN ONLY |
| Go-live without destroying users or references | `GoLiveAuditCommand` (read-only) | AT `GoLiveAuditTest` | PM-STOP | demo-data removal not executed; protected-table proof | [#14](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/14), [#20](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/20) | BLOCKED |

## RENT CAR
| Requirement (source) | Implementation | Test evidence | Scenario | Blocker | Issue | Pilot result |
|---|---|---|---|---|---|---|
| Backend-enforced permissions, delegation (CLAUDE.md, D-022, D-027) | `role_permissions`, `user_permission_grants` | AT `permissions.test.ts` (11), `auth.test.ts` (19) | RC-S01 | MFA absent (docs/30) | [#22](https://github.com/hdnkabour-gif/rent-car-app/issues/22) | NOT_RUN |
| Branch isolation (D-026) | `user_branches` | AT `reservations.test.ts` (branch scope), `vehicle-docs.test.ts` (another branch's files never served) | RC-S01/S08 | — | — | NOT_RUN |
| No overlapping reservations (D-036) | PG exclusion constraint | AT `reservations.test.ts` (incl. concurrent case) | RC-S02 | — | — | NOT_RUN |
| Contract + frozen copy + signed paper as official (D-015, D-039) | `contracts`, `contract_templates` | AT `contracts.test.ts` (15) | RC-S03 | — | — | NOT_RUN |
| Deposits are not revenue; append-only ledger (CLAUDE.md, D-040, D-048) | `payments` ledger | AT `contracts.test.ts`, `slice5.test.ts` | RC-S04 | — | — | NOT_RUN |
| Late charge decided by the manager (D-044) | `routes/contracts.ts` | AT `contracts.test.ts` (3) | RC-S05 | partial refund after a waiver | [#26](https://github.com/hdnkabour-gif/rent-car-app/issues/26) RC-03 | BLOCKED (step 3) |
| Duplicate receipt ownership (RC-04) | PR #29, migration 0018 | AT `slice5.test.ts` "RC-04…" | RC-S05 | — | [#26](https://github.com/hdnkabour-gif/rent-car-app/issues/26) (RC-04 fixed) | NOT_RUN |
| Intake link + time-limited code | `customer_intake_*` | AT `customer-intake.test.ts` (6) | RC-S06 | — | — | NOT_RUN |
| OCR is a suggestion with mandatory human review; local only (D-004, D-038) | `server/src/ocr/*` | AT `local-ocr.test.ts`, `vehicle-ocr.test.ts`, `customer-intake.test.ts` | RC-S07 | mobile framing and field mapping | [#15](https://github.com/hdnkabour-gif/rent-car-app/issues/15) | NOT_RUN (synthetic only) |
| Upload validation and content-addressed storage (CLAUDE.md, D-031) | `FileStorage` adapter | AT `vehicle-docs.test.ts`, `customers.test.ts`, `storage-concurrency.test.ts`, `storage-health.test.ts` | RC-S08 | 2 missing synthetic uploads investigated | [#16](https://github.com/hdnkabour-gif/rent-car-app/issues/16) | NOT_RUN |
| FR/AR + RTL, simple UX (D-024) | web | AT `i18n.test.tsx`, `no-technical-codes.test.tsx` | RC-S09 | — | — | NOT_RUN |
| Infractions registry | PR #31 | AT `infractions.test.ts` | RC-S10 | — | [#30](https://github.com/hdnkabour-gif/rent-car-app/issues/30) | NOT_RUN |
| Verified encrypted backups + offsite + drill (D-037, D-046, D-051) | `scripts/backup*`, `backup_runs`, `backup_drills` | AT `backup.test.ts` (6), `offsite-backup.test.ts` (≈30) | RC-S11 | production offsite + restore proof | [#14](https://github.com/hdnkabour-gif/rent-car-app/issues/14) | PLAN ONLY |
| Real data only on the company host (D-012, D-030) | — | — | RC-STOP | host + VPN not built; CNDP | [#22](https://github.com/hdnkabour-gif/rent-car-app/issues/22) | BLOCKED |

## TIJARA OS
| Requirement | Implementation | Test evidence | Scenario | Blocker | Issue | Pilot result |
|---|---|---|---|---|---|---|
| Weighed sale with grilling (T1) | `sales.ts` | AT `sales.test.ts` T1, `api.test.ts` J1, `e2e.test.ts` E1 | TJ2-S01 | — | — | NOT_RUN |
| Unit conversion g↔kg | `baseUom` only | partial (E6) | TJ2-S02 | no unit table | — (no issue yet) | NOT_RUN |
| Production with waste (T2) | `production.ts` | AT `production.test.ts` | TJ2-S03 | — | — | NOT_RUN |
| Cancellations (T3–T6) | `sales.ts` | AT `sales.test.ts` | TJ2-S04 | — | — | NOT_RUN |
| Partial payment (T22) | `payments.ts` | AT `sales.test.ts` T22 | TJ2-S05 | — | — | NOT_RUN |
| Discount approval and step-up (T15, T16) | `approvals.ts` | AT T15, T15b, T16 (partial) | TJ2-S06 | real step-up re-auth | — | NOT_RUN |
| Concurrency and idempotency (T8, T12–T14) | `inventory.ts`, `commands.ts` | AT `ledger.test.ts`, `e2e.test.ts` E6–E7 | TJ2-S07/S08 | — | — | NOT_RUN |
| Tenant and branch isolation (T9–T11) | FORCE RLS | AT `isolation.test.ts`, `api.test.ts` A7–A9 | TJ2-S09 | — | — | NOT_RUN |
| Cash sessions (O21) | none | none | TJ2-S10 | not built | — (no issue yet) | UNIMPLEMENTED |
| Partial line return | none | none | TJ2-S11 | not built | — | UNIMPLEMENTED |
| Mechanic: vehicles + work orders (T25) | none | none | TJ1-S02/S03 | not built; discovery first | — | UNIMPLEMENTED |
| Alarm/fire: installation jobs, maintenance contracts, site register | none (serials only) | AT T20 for serials | TJ3-S03…S05 | not built; discovery first | — | UNIMPLEMENTED |
| Real-data conditions 1–6 | `docs/DEPLOYMENT.md` | backup K1–K3, restore R1 (local) | — | backup service not deployed; R2 untested | — | BLOCKED |

## AMANZINE
| Requirement | Implementation | Test evidence | Scenario | Blocker | Issue | Pilot result |
|---|---|---|---|---|---|---|
| Product photos | `products.images`, Cloudinary | `product-persistence.test.js` | AM-S01 | Cloudinary credentials UNKNOWN | UNKNOWN | NOT_RUN |
| Stock per size × colour | **none** (`stock INTEGER` per product) | none | AM-S02 | not built | UNKNOWN | UNIMPLEMENTED |
| Order idempotency | `orders.js:44-77` | `order-idempotency.test.js` | AM-S03 | — | UNKNOWN | NOT_RUN |
| No oversell; single decrement | CR `orders.js:217-222` (clamped, no status check) | none found for oversell | AM-S04 | suspected defect | UNKNOWN (no API access) | OPEN |
| Stock restored on cancel | CR `orders.js:345-353` (no restore) | none found | AM-S05 | suspected defect | UNKNOWN | OPEN |
| Returns / exchange with stock + money reversal | none found by name (CR) | none | AM-S06 | complete path unverified | UNKNOWN | UNVERIFIED |
| Delivery retry and reconciliation | delivery registry + retry queue | `promo_livraison-contract`, `shipment-retry`, `tracking-sync`, `retry-queue` tests | AM-S08 | production provider not verified | UNKNOWN | NOT_RUN (mock) |
| Tracking privacy | `/track/:phone`, `/track-code/:code` | `order-tracking.test.js` | AM-S09 | was the repair branch merged? | UNKNOWN | UNKNOWN |
| Settlement (COD/CMI) | `payments`, `wallets` | `payment.test.js` | AM-S11 | no verified settlement path | UNKNOWN | BLOCKED |

## Astra numeric cases (docs/33 §2A)
| Case | Requirement | Evidence today | Blocker | Issue | Pilot result |
|---|---|---|---|---|---|
| AQ-PM-01 | return deducted from debt; net one piece out | closest AT `DocumentsTest` (damaged return deducts debt) | no AT with these numbers | — | NOT_RUN |
| AQ-RC-01 | partial refund of a waived late fee | none | RC-03 | [#26](https://github.com/hdnkabour-gif/rent-car-app/issues/26) | BLOCKED |
| AQ-TJ-01 | production then sale, 3.130 kg left, waste once | AT T2 + T1 separately | chained case not tested | — | NOT_RUN |
| AQ-AM-01 | last unit of a size, concurrent orders | none | no variant stock; CR oversell | UNKNOWN | BLOCKED |
| AQ-X1 | permission revoked mid-session | AT RENT CAR, TIJARA | PNEU no AT | — | NOT_RUN |
| AQ-X2 | receipt photo ownership | AT RENT CAR | PNEU public storage path | [PNEU #13](https://github.com/hdnkabour-gif/Pneumatiques-MOUHIM/issues/13) | NOT_RUN |
| AQ-X3 | no re-shipment after carrier timeout | AT mocks | production unverified | UNKNOWN | NOT_RUN |
| AQ-X4 | restore keeps file permissions, no external jobs | PNEU AT private restored copies | drill not run from R2 | PNEU #13, RENT CAR #14 | PLAN ONLY |

## Follow-ups to open in source repositories (not created by this task, to avoid duplicates)
The owner or the app's own session should first check whether these already exist:
1. **AMANZINE:** "Oversell / double decrement on order approval and no stock restore on reject" (AM-S04/S05), with a regression test. GitHub issues cannot be listed from this session.
2. **PNEU:** named ATs for overpayment, negative payment, double return and cash refund (PM-S09/S10 gaps). This may fit under #19.
3. **TIJARA:** issues for cash sessions (O21), partial returns, unit conversion and T25, created **after** the discovery worksheets.
