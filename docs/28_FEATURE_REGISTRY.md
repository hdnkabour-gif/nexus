# 28 — Portfolio Feature Registry (V1, verified 2026-11-20)

Portfolio-wide register of application features and their **actual** status. NEXUS's own target backlog stays in [06_FEATURE_CATALOG.md](06_FEATURE_CATALOG.md); NEXUS ideas stay in [17_IDEA_LOG.md](17_IDEA_LOG.md).

Status meaning here:
- **IMPLEMENTED** = code present on `main` at the SHA in [27](27_PORTFOLIO_BASELINE_V1.md).
- **TESTED** (strict, revised 2026-11-20 on owner instruction) = a **named test file or test** whose **passing result is visible in the CI job log at the analysed SHA**, listed in the evidence table `TE-*` below. A green CI badge, a README or a tracker line alone is **not** enough; such rows say `IMPLEMENTED (tests exist; per-test result not cited)`. TESTED ≠ production proof.
- **DEPLOYED** = present in the code at the Railway-deployed SHA (deployment SUCCESS). It does **not** mean real users use it.
- **VERIFIED** = not granted to any item in this pass.
- **DESIGNED / IDEA** = documented only. **UNKNOWN** = could not be determined.

Feature IDs reuse each app's own IDs when the app has them (RENT CAR `F-0xx`, PNEU phases/`D-xx`, TIJARA `T1–T25`, Tech-Platform issue keys). Portfolio IDs are `PF-<app>-NN`.

## Evidence for TESTED claims (CI job logs read 2026-11-20)
| TE ID | Repo @ SHA | CI run / job | Suite result in the log | Named tests or files cited (all passing in that log) |
|---|---|---|---|---|
| TE-PM-01 | Pneumatiques-MOUHIM @`ea55329f` | run 44119512301 / job 134166688755 (`pest`, PostgreSQL) | **406 passed, 1 skipped** (4,453 assertions). Skipped test: "prints the company letterhead…" (not a financial or security test) | `AccessControlTest`, `SiteTest`, `LoginTest` ("blocks login after 5 attempts per minute"), `TwoFactorTest` ("asks the owner for the code at login") |
| TE-PM-02 | same | same | same | `StockServiceTest` ("keeps the stock ledger append-only", "refuses to make a site stock negative"), `TransferTest`, `UsedTyreTest`, `StockScenarioTest`, `OilDrumTest` ("serialises two sales on the same drum") |
| TE-PM-03 | same | same | same | `SaleEngineTest` ("freezes a confirmed invoice…", "blocks credit above the customer limit", "takes partial payment by cash, card and cheque", "refuses sales to users without the permission or outside their s…") |
| TE-PM-04 | same | same | same | `DocumentsTest` ("returns goods to stock with a credit note…"), `CashRegisterTest` ("computes what must be in the drawer", "closes the day with the gap…"), `CustomerAccountTest`, `IssuedInvoiceIntegrityTest` |
| TE-PM-05 | same | same | same | `BackupRestoreTest` ("restores the uploaded files together with the database", "never replaces a live file with a copy that does not match…"), `BackupRestoreBusinessDataTest` ("…three-site business day figure for figur…"), `ActivityLogTest` ("refuses UPDATE at database level"), `GoLiveAuditTest` ("runs a read-only go-live audit") |
| TE-PM-06 | same | same | same | `PurchaseTest`, `EquipmentTest`, `VehicleCompatibilityTest`, `ChineseMarketVehicleCatalogueTest` |
| TE-RC-01 | rent-car-app @`781ab813` | run 44653856509 / job 136015159090 (`checks`) | server **319 passed (31 files)**, web **89 passed (16 files)**; 0 failed, 0 skipped | `auth.test.ts` (19), `permissions.test.ts` (22), `audit.test.ts` (7), `password.test.ts` (6) |
| TE-RC-02 | same | same | same | `reservations.test.ts` (12), `customers.test.ts` (13), `vehicles.test.ts` (33) |
| TE-RC-03 | same | same | same | `contracts.test.ts` (15; incl. overpayment refused, deposit rights) |
| TE-RC-04 | same | same | same | `slice5.test.ts` (8; cash closing, reports, reminders, RC-04 receipts) |
| TE-RC-05 | same | same | same | `local-ocr.test.ts` (4), `vehicle-ocr.test.ts` (2), `customer-intake.test.ts` (6) |
| TE-RC-06 | same | same | same | `backup.test.ts` (6), `offsite-backup.test.ts` (29) — **synthetic, CI-only** |
| TE-RC-07 | same | same | same | `data-isolation.test.ts` (3), `vehicle-docs.test.ts` (14), `storage-concurrency.test.ts` (1) |
| TE-RC-08 | same | same | same | `vehicleCatalog.test.ts` (7), `infractions.test.ts` (5) |
| TE-TJ-01 | tijara-os @`e5e2b26d` | run 44659052532 / jobs 136032432315 (`test (pg18)`) and 136032432655 (`test (pg16)`), both success | pg18 log: **78 passed (12 files)** | `sales.test.ts` (12), `ledger.test.ts` (9), `production.test.ts` (7), `properties.test.ts` (3), `isolation.test.ts` (7), `api.test.ts` (17), `e2e.test.ts` (8), `web-session.test.ts` (5), `bootstrap.test.ts` (4) |
| TE-TJ-02 | same | same | same | `backup.test.ts` (3), `restore.test.ts` (1) — **CI database, not R2** |
For RENT CAR and TIJARA the log prints results per file, not per test. Because the run reports 0 failed and 0 skipped, every test in a cited file passed at that SHA. No log was read for AMANZINE (no API access), NEXORA or ALLOSERVIX, so no strict TESTED claim is made for them beyond the workflow runs cited.

## TECH PLATFORM 2M (`924aa502`; metadata only)
| ID | Feature | Status | Evidence |
|---|---|---|---|
| PF-TP-01 | Locations hierarchy / rooms / racks / equipment | DEPLOYED | `ARCHITECTURE-DESIGN.md` A, `INTEGRATION-STATUS.md`; Railway `tech-platform.up.railway.app` @`924aa502` |
| PF-TP-02 | Walls/screens/screen groups model | DEPLOYED | `INTEGRATION-STATUS.md` ("Room → Wall ← Screen.wallId") |
| PF-TP-03 | Field evidence chain (4 trust levels) | DEPLOYED; private media contract open | `FIELD-EVIDENCE-INTAKE.md`, `SEC-01-FIELD-EVIDENCE-EXPOSURE.md`, issue #147 |
| PF-TP-04 | Zone/room access control | DEPLOYED with open scope leaks | `access-control.js`, issues #130, #132–#140 |
| PF-TP-05 | Procedures module | IMPLEMENTED (MVP), follow-up DESIGNED | `PROCEDURES-DESIGN.md`, issue #155 |
| PF-TP-06 | Cable map / physical routes | IMPLEMENTED partial; DESIGNED next | issue #154, `scripts/cable-route-e2e.mjs` |
| PF-TP-07 | Offline-first sync queue (IndexedDB ↔ central) | DEPLOYED with open defects | issues #87, #89, #122, #123, #129 |
| PF-TP-08 | Digital-twin map authoring | DESIGNED | issue #81, `MAP-PHASE18-DIGITAL-TWIN.md` |
| PF-TP-09 | Polymorphic `locations` store | DESIGNED ("Rien n'est implémenté") | `ARCHITECTURE-DESIGN.md:3` |

## SCANFLOW PRO (`Scanflowpro@5ad13e25`)
| ID | Feature | Status | Evidence |
|---|---|---|---|
| PF-SF-01 | Session-based multi-PDF upload | IMPLEMENTED | `backend/server.py:84,109` |
| PF-SF-02 | ROI per file (keyword + code zone) | IMPLEMENTED | `server.py:155`, `engines/roi_utils.py` |
| PF-SF-03 | OCR / HTR / YOLO text detection, image enhancement | IMPLEMENTED | `engines/ocr_engine.py`, `htr_engine.py`, `yolo_text_detector.py`, `image_enhancer.py` |
| PF-SF-04 | Code extraction + validation + cross-page validation + candidate ensemble | IMPLEMENTED | `engines/code_extractor.py`, `code_validator.py`, `cross_page_validator.py`, `candidate_ensemble.py` |
| PF-SF-05 | Page grouping, move/reorder/change parent, merge, ZIP download | IMPLEMENTED | `server.py:539–703` |
| PF-SF-06 | Auto-recovery / session locks | IMPLEMENTED | `engines/auto_recovery.py`, `managers/session_lock_manager.py` |
| PF-SF-07 | Authentication / multi-user | not present → IDEA | no auth code in `backend/` |
| PF-SF-08 | Automated tests | not present | 0 test files; scan-Flow-pro has `backend_test.py` only |
| PF-SF-09 | Hosted deployment | not present | no Railway service |

## RENT CAR MANAGER (`781ab813`)
Source of truth: `FEATURE_TRACKER.md` in the repo. Summary mapped to the vocabulary:
| ID | Feature | Status | Evidence |
|---|---|---|---|
| F-001/F-002/F-027/F-028/F-031 | Auth, roles, audit, staff admin, delegated permissions | TESTED (TE-RC-01) + DEPLOYED (demo) | FEATURE_TRACKER |
| F-004/F-005/F-006/F-020 | Fleet, customers, reservations (no-overlap), branches | TESTED (TE-RC-02) + DEPLOYED (demo) | rent-car:D-026, rent-car:D-036 |
| F-007/F-008/F-024/F-025/F-034 | Contracts, check-out/in, extensions, extra drivers, templates | TESTED (TE-RC-03) + DEPLOYED (demo) | rent-car:D-039, D-044, D-045 |
| F-009 | Payments/deposits ledger | IMPLEMENTED; FEATURE_TRACKER says "In progress"; RC-03 open | issue #26 |
| F-010/F-022 | Uploads, duplicate detection | IMPLEMENTED; tracker "In progress" | D-031, PR #24/#27 |
| F-011 | OCR with human approval (framing, MRZ TD1, licence labels) | TESTED (TE-RC-05) + DEPLOYED (demo + OCR staging); tracker still "Planned" (stale) | PRs #20, #25, #28 |
| F-012/F-013/F-014/F-026/F-036 | Maintenance, expiry alerts, reports, wa.me reminders, vehicle-first home | TESTED (TE-RC-04) + DEPLOYED (demo) | FEATURE_TRACKER |
| F-032 | Data durability + verified backups + restore drill | TESTED (TE-RC-06, synthetic CI only); NOT deployed on a real host | PR #23, `BACKUP_RESTORE.md:56`, issue #14 open |
| F-033 | No outbound calls / no third-party scripts | TESTED (TE-RC-07) | rent-car:D-038 |
| F-035 | White-label branding (JMR) | DEPLOYED (demo) | PRs #32–#36 |
| F-037 | Shared vehicle reference catalogue | TESTED (TE-RC-08) | rent-car:D-050, migration 0011 |
| PF-RC-01 | NARSA road infractions manual registry + manager-reviewed matching | TESTED (TE-RC-08) + DEPLOYED (demo) | PR #31, migration 0019, `docs/INFRACTIONS_NARSA_MVP.md` |
| F-021 | Company-hosted production + VPN | DESIGNED | D-012, D-017 |
| F-015 | Manual WhatsApp attachment batch | DESIGNED | FEATURE_TRACKER |
| F-023 | Controlled customer merge | DESIGNED (tables exist: `customer_merge_links`) | FEATURE_TRACKER |
| F-016/F-017/F-018/F-019 | WhatsApp API, GPS, AI damage, AI analytics | IDEA (deferred) | FEATURE_TRACKER |

## PNEU MOUHIM (`ea55329f`)
| ID | Feature | Status | Evidence |
|---|---|---|---|
| Phase 1 | Docker, auth, roles, sites, FR/AR, activity log, settings, backups | DEPLOYED (pilot); R2 offsite pending | README "État d'avancement", issue #13 |
| Phase 2 | Catalogue, DOT lots, used tyres + QR, services/bundles, movements, transfers, replenishment, inventory, approvals | TESTED (TE-PM-02) + DEPLOYED (pilot), owner validation pending | README |
| pneu-mouhim:D-48 | Vehicle reference + compatibilities | TESTED (TE-PM-06) | README, `docs/CHINESE_VEHICLE_CATALOGUE_MOROCCO_2026.md` |
| Phase 3a | Sales screen, A4 invoice (mPDF), payments, approvals, "ask depot", workshop by seller, numbering | TESTED (TE-PM-03) + DEPLOYED (pilot), validation pending | README, D-49–D-55 |
| Phase 3b | Quotes, BL/BT + summary invoice, credit notes, returns, exchanges, trade-ins | TESTED (TE-PM-04) + DEPLOYED (pilot) | README, D-56 |
| Phase 4 | Customer accounts, opening balances, receipts, cheques, cash closing, expenses | TESTED (TE-PM-04) + DEPLOYED (pilot); concurrency gaps PM-02/03/04 | issues #17, #18, #19 |
| Phase 5 | Today/objectives/evening summary/PWA | IMPLEMENTED partial (push + remaining Excel imports missing) | README |
| Phase 6 | Suppliers, purchase orders, partial receipts, supplier debts | TESTED (TE-PM-06) | README |
| Phase 7 | Equipment & maintenance | TESTED (TE-PM-06); advanced reports + accounting export = DESIGNED | README |
| PF-PM-01 | `app:go-live-audit --strict` (count-only, no purge) | TESTED (TE-PM-05) + DEPLOYED | CHANGELOG 2026-11-17, PR #16 |
| PF-PM-02 | Demo business data removal for go-live | DESIGNED; **NOT executed** | issue #14 |
| PF-PM-03 | Issued invoice PDF preservation + voucher totals | IMPLEMENTED on branch, PR #7 OPEN | PR #7 |
| PF-PM-04 | Reference workbook export / catalogue image uploads | IMPLEMENTED on branches, PRs #2/#3 OPEN | PRs #2, #3 |
| D-26/D-27/D-28/D-51 | WhatsApp API, barcodes, payroll/e-commerce, thermal ticket | REJECTED for V1 (deferred) | docs/decisions.md |

## AMANZINE (`4ff08a99`)
| ID | Feature | Status | Evidence |
|---|---|---|---|
| PF-AM-01 | Need understanding (AKG `understand()`, KB, lexicon) | IMPLEMENTED + tests in repo; CI UNKNOWN | README, `src/lib/akg/` |
| PF-AM-02 | Providers/services/verification, listings, products | IMPLEMENTED | `server/routes/providers.js`, `listings.js`, `products.js` |
| PF-AM-03 | Orders + order events timeline + idempotency | IMPLEMENTED | `AUDIT/CONSOLIDATION_STATUS.md` |
| PF-AM-04 | Delivery connectors (Amana, Promo Livraison), pricing rules | IMPLEMENTED; production behaviour UNKNOWN ("presence in code does not prove they work") | `AUDIT/CONSOLIDATION_STATUS.md` release gate 4 |
| PF-AM-05 | Payments (CMI refs), wallet, loyalty, coupons | IMPLEMENTED; production behaviour UNKNOWN | `server/routes/payment.js`, `wallet.js` |
| PF-AM-06 | OTP auth, refresh tokens, account recovery | IMPLEMENTED (repair branches 2026-11-13/14) | branches `repair/amanzine-otp-*` |
| PF-AM-07 | WhatsApp Cloud API, Web Push, Cloudinary media | IMPLEMENTED; credentials state UNKNOWN | code references |
| PF-AM-08 | Field visits with human learning gate | IMPLEMENTED | branch `fix/field-visit-human-learning-gate` |
| PF-AM-09 | Bookings/availability | IMPLEMENTED | `server/routes/bookings.js` |
| PF-AM-10 | Optional AI search (OpenAI/Anthropic) with isolated public keys | IMPLEMENTED | last commit "isolate public AI keys (#24)" |

## ALLOSERVIX (`781c982f`)
| ID | Feature | Status | Evidence |
|---|---|---|---|
| PF-AX-01 | 32 service pages + catalogue search | DEPLOYED | `services/*.html`, `/api/public/catalog` |
| PF-AX-02 | Admin with password + TOTP | DEPLOYED | README; `docs/ADMIN_ACCESS_CONTROL_V15.md` |
| PF-AX-03 | Staff accounts / invites (multi-user) | IMPLEMENTED (README still says single admin → stale) | tables `staff_accounts`, `staff_invites` |
| PF-AX-04 | Catalogue-grounded assistant, diagnose, audio/image understanding | IMPLEMENTED; external AI off by default | `/api/public/assistant|diagnose|transcribe-audio|understand-image`, `docs/AI_INTENT_ONLY.md` |
| PF-AX-05 | Service requests, technicians, ops status | IMPLEMENTED | `/api/admin/ops/*`, `OPERATIONS_V10.md` |
| PF-AX-06 | Knowledge studio + brain evals | IMPLEMENTED | `docs/KNOWLEDGE_STUDIO_V11.md`, `ADMIN_BRAIN_MONITORING_V18.md` |
| PF-AX-07 | Opt-in analytics, inquiries | IMPLEMENTED, disabled by default | README |
| PF-AX-08 | Backup log/checks | IMPLEMENTED; Railway volume backups 0 | tables `backup_log`, `backup_checks` |
| PF-AX-09 | Production smoke + visual QA workflows | TESTED (CI success) | runs 44654187998, 44654188238 |

## NEXORA (`aed95a38`)
| ID | Feature | Status | Evidence |
|---|---|---|---|
| PF-NX-01 | Synthetic interactive clinic demo (browser memory) | DEPLOYED | `apps/web`, Railway demo |
| PF-NX-02 | Prisma domain model (27 models) | DESIGNED (schema only, no routes) | `apps/api/prisma/schema.prisma` |
| PF-NX-03 | PostgreSQL RLS isolation prototype | IMPLEMENTED (README says tested locally; no CI per-test result cited) | `scripts/db`, README |
| PF-NX-04 | Deny-by-default policy package | IMPLEMENTED (tests exist; per-test result not cited) | `packages/policy` |
| PF-NX-05 | Auth/MFA/tenancy, clinician MVP, portal, CDSS/OCR, FHIR/DICOM | DESIGNED (Phases 1–6) | `docs/roadmap.md` |

## TIJARA OS (`e5e2b26d`)
| ID | Feature | Status | Evidence |
|---|---|---|---|
| T1–T15, T17–T23 | Ledger, sales, production, reservations, isolation, idempotency, payments, cost policy | TESTED (TE-TJ-01) + DEPLOYED (staging) | `docs/TEST_STATUS.md`, CI 44659052532 |
| T16 | Single-owner step-up verification | IMPLEMENTED partial (flag only) | `docs/TEST_STATUS.md` |
| T24 | Plan limits | IMPLEMENTED partial | same |
| T25 | Work orders with parts & warranty | DESIGNED (no tables) | same |
| PF-TJ-01 | Web UI (AR/FR), browser-safe sessions, platform admin bootstrap by invite | DEPLOYED (staging) | PR #1, `docs/DEPLOYMENT.md` |
| PF-TJ-02 | Encrypted R2 backup job + restore script | TESTED (TE-TJ-02, CI database only); NOT deployed; not run against R2 | `docs/DEPLOYMENT.md`, `test/backup.test.ts`, `test/restore.test.ts` |
| PF-TJ-03 | Locations, inter-branch transfers, cash sessions, units/variants, partial returns | IDEA/DESIGNED (known limits) | `docs/TEST_STATUS.md` |

## Proposed products
| ID | Feature | Status |
|---|---|---|
| PF-SCH-01 | School platform | IDEA |
| PF-FDA-01 | FleetDocs AI | IDEA |
