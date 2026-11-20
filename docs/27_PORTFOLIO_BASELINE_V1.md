# 27 — Portfolio Baseline V1 (المرجع الموحد للمشاريع)

**Verified on: 2026-11-20.** Read-only inventory. No application code, database, secret or Railway setting was changed.
Machine-readable twin: [registry/portfolio-baseline.v1.json](../registry/portfolio-baseline.v1.json).
Companion registers: [28 Feature Registry](28_FEATURE_REGISTRY.md) · [29 Decision Registry](29_DECISION_REGISTRY.md) · [30 Risk & Gap Register](30_RISK_GAP_REGISTER.md) · [31 Evidence Index](31_EVIDENCE_INDEX.md).

The 2026-11-17 snapshot ([19_PORTFOLIO_DISCOVERY.md](19_PORTFOLIO_DISCOVERY.md), `registry/portfolio-discovery.v1.json`) is **kept unchanged** as history; it is still read by `lib/data.js` and by `packages/monitor-core/test/inventory.test.mjs` (which asserts exactly 6 apps). This baseline supersedes it for *current* state only.

## How this was observed
| Channel | What it proves | What it does NOT prove |
|---|---|---|
| `git clone --depth 1` of each default branch | file tree and HEAD SHA at 2026-11-20 | history, other branches' content |
| GitHub REST (repo-scoped, read) | issues, PRs, branches, Actions run conclusions | deployment health, code correctness |
| Railway GraphQL, **queries only** | per-service source repo, branch, latest deployment status + commit SHA, domains, volumes, backup lists | runtime behaviour, data integrity, env values (never read) |
| Anonymous public HTTPS GET (alloservix.ma robots.txt) | domain answers with this app's robots file | functionality |

Status vocabulary: `IDEA / DESIGNED / IMPLEMENTED / TESTED / DEPLOYED / VERIFIED / REJECTED / UNKNOWN`.
Rules applied: *DEPLOYED* = Railway latest deployment `SUCCESS` at the stated SHA. *TESTED* = automated tests exist and the latest `main` CI run is green — **CI success is not production proof**. *VERIFIED* is **not granted to any application in this baseline**: no independent end-to-end, restore or acceptance evidence was produced in this pass.

## Accounts and repositories
- `hdnkabour-gif`: 9 repositories visible through the connected GitHub.
- `abdellatifhadana-byte`: 10 **public** repositories readable anonymously. **Private repositories in this account, if any, are not visible to this session → UNKNOWN.** GitHub API metadata (issues/CI) for this account is not reachable from this session.

## Portfolio summary
| # | App | Canonical repo | GitHub `main` SHA | Deployed SHA (Railway) | Lifecycle | Tests / CI (main) |
|---|---|---|---|---|---|---|
| 1 | TECH PLATFORM 2M | `hdnkabour-gif/Tech-Platform-` | `924aa502` (2026-09-27) | `924aa502` ×2 (in AMANZINE project) + `04e70ae8` (old preview branch, 164 behind) | DEPLOYED (employer authorization pending) | 192 test files; CI success 2026-09-27 |
| 2 | SCANFLOW PRO | `abdellatifhadana-byte/Scanflowpro` (candidate) | `5ad13e25` (2026-10-30) | none found | IMPLEMENTED (local tool) | 0 test files; no CI |
| 3 | RENT CAR MANAGER / Fleetora | `hdnkabour-gif/rent-car-app` | `781ab813` (2026-11-20) | prod-demo `781ab813` = main; OCR staging `3a2b28b4` (feature branch, 3 behind) | DEPLOYED (demo, fictitious data) | 60 test files; CI success `781ab813` |
| 4 | PNEU MOUHIM | `hdnkabour-gif/Pneumatiques-MOUHIM` | `ea55329f` (2026-11-17) | pilot `ea55329f` = main; staging app `a2691d7d` (1 behind), staging worker `6a811897` (6 behind) | DEPLOYED (pilot, go-live blocked) | 53 test files; CI success `ea55329f` |
| 5 | AMANZINE | `hdnkabour-gif/amanzine2` | `4ff08a99` (2026-11-16) | `balanced-growth` + `amanzine-staging` = `4ff08a99` | DEPLOYED (pre-launch) | 160 test files; CI UNKNOWN (API not granted) |
| 6 | ALLOSERVIX | `hdnkabour-gif/Alloservix` | `781c982f` (2026-11-20) | `781c982f` = main | DEPLOYED (custom domain attached; staging-gated content) | 30 test files; CI + production smoke success |
| 7 | NEXUS | `hdnkabour-gif/nexus` | `bc8e6d13` (2026-11-18) | web + cron `bc8e6d13` = main | DEPLOYED | 10 test files; 3 workflows success |
| 8 | NEXORA | `hdnkabour-gif/Nexora` | `aed95a38` (2026-11-15) | `aed95a38` = main | DEPLOYED (synthetic demo only) | 6 test files; CI success |
| 9 | TIJARA OS | `hdnkabour-gif/tijara-os` | `e5e2b26d` (2026-11-20) | runtime + migrate `e5e2b26d` = main | DEPLOYED (staging, no real data) | 15 test files; CI success |
| — | School platform | none | — | — | IDEA | — |
| — | FleetDocs AI | none | — | — | IDEA | — |

**Backups across the portfolio:** Railway reports **0 volume backups and 0 backup schedules on all 17 volumes** (2026-11-20). App-level backup code exists in PNEU, RENT CAR, TIJARA OS and ALLOSERVIX, but no offsite backup with a restore proof from the stored copy is evidenced for any deployed environment. See R-003.

---

## Per-application technical passport
Each passport lists only metadata. No customer, patient, employee, employer-internal or document content was copied.

### 1. TECH PLATFORM 2M — `tech-platform`
- **Purpose / users:** internal technical-operations platform for an employer site (locations hierarchy, rooms/racks/equipment, walls/screens, cabling map, procedures, tickets, field evidence). Users: technical staff and managers of the employer. **Employer-confidential: content deliberately not inventoried.**
- **Repos:** canonical `hdnkabour-gif/Tech-Platform-` (private, 164 remote branches, 97 merged PRs, 25 open issues). `abdellatifhadana-byte/sahar2026` (**public**) has 626 of 627 tracked files byte-identical to `main` (only one image missing) → unapproved public copy (R-001). `abdellatifhadana-byte/tech` is empty.
- **Stack:** Node.js ESM server (`scripts/serve.js`), `pg`, IndexedDB client stores with central sync, many browser/e2e gate scripts, `node:test`.
- **Roles/permissions:** `access-control.js` / `zone-access*.js` (scope by zone/room); open issues #130–#140 track scope leaks and governance (e.g. #133 implicit Manager bypass, #132 leak seeds).
- **Deployments:** `overflowing-vision/production/Tech-Platform-` → `04e70ae8` branch `preview/pilote-technique-ui` (2026-10-31, **164 commits behind main**), domain `tech-platform-ui.up.railway.app`. `spectacular-victory/production/AMANZINE` → `924aa502` domain `amanzine22.up.railway.app`. `spectacular-victory/TECH PLATFORM/amanzine2` → `924aa502` domain `tech-platform.up.railway.app`. Postgres in both projects; no Railway backups.
- **Open P0/P1:** #88 DEMO-GATE (labelled P0), #170 MAP-NESTED-PLACEMENT-P0, #147 SEC-01 follow-up (private media), #130–#140 access-scope series, #129 sync timeout.
- **Status:** DEPLOYED. Monitoring by NEXUS remains **deliberately disabled** until employer authorization (ADR-010).

### 2. SCANFLOW PRO — `scanflow-pro`
- **Purpose / users:** batch PDF processing for office operators: upload PDFs, draw ROI, OCR/HTR + YOLO text detection, extract 4–8 digit codes, group child pages, merge, preview and ZIP download.
- **Repos:** `abdellatifhadana-byte/Scanflowpro` (2026-10, Python engines + React, 1 commit visible) – **canonical candidate, needs owner confirmation**. `abdellatifhadana-byte/scan-Flow-pro` (2025-11, Emergent-generated base; 67 files shared by path) = earlier generation. Both **public**.
- **Stack:** FastAPI 0.110, Motor/MongoDB (`localhost`), PyMuPDF, OpenCV, Tesseract, YOLOv8n weights committed; React 19 + shadcn/ui (CRA/craco); Windows `.bat` launchers.
- **API:** `/api/session/create`, `/session/{id}/upload|file-settings|process|cancel|status|results|page|merge-final|download-zip|move-page|change-parent|reorder-pages|preview/{code}`, `/pdf/first-page`, `/pdf/info`, `/clear-cache`, `/clear-old-files` (`backend/server.py`). **No authentication.**
- **Data:** MongoDB `files`/session documents + local JSON session manager; files on local disk.
- **Hygiene:** `Scanflowpro` commits `node_modules` (310 files), `.pyc` caches, `.env` files (only localhost/CORS values). `scan-Flow-pro` commits **197 PDFs** under `backend/uploads` and `backend/results` (not opened) → R-002.
- **Tests/CI:** none in `Scanflowpro`; `scan-Flow-pro` has `backend_test.py` + agent `test_result.md`, and an irrelevant Deno template workflow.
- **Deployment:** none found in Railway. **Status:** IMPLEMENTED (local).

### 3. RENT CAR MANAGER / Fleetora — `rent-car`
- **Purpose / users:** internal rental operations for a Moroccan rental company (30–100 vehicles); roles manager / employee + delegable individual grants (D-022, D-027). Tenant branding JMR.
- **Repo:** `hdnkabour-gif/rent-car-app` only (44 branches, 22 merged PRs).
- **Stack:** React 19 + TS + Vite PWA; Node 22 + Express 5 + TS; PostgreSQL (migrations `0001`–`0019`); local OCR behind adapter (`server/src/ocr/*`); content-addressed private file storage.
- **Data model (60 tables):** users/roles/permissions/user_permission_grants/sessions/audit_logs; branches/user_branches; vehicles + status history/transitions, documents, photos, reviews; customers, customer_documents, intake links/documents/analysis/reviews, merge links; reservations (+events, exclusion constraint), contracts (+drivers, events, photos, signed scan reviews, templates); payments, expenses, cash_closings, receipt upload claims; maintenance plans/records; reminder_log; road_infractions (+events); backup_runs, backup_drills; 18 `vehicle_catalog_*` tables (shared seed with PNEU, D-050).
- **Integrations:** none outbound by design (D-038: test fails on outbound network); wa.me links only.
- **Deployments:** `lucid-playfulness/production/rent-car-app` `781ab813` (= main) `jmr-luxe-car.up.railway.app`, volume `/data`; `Fleetora OCR Staging/staging/fleetora-ocr-app` `3a2b28b4` branch `feat/jmr-raster-brand-20261119` (merged, 3 behind main).
- **Backups:** encrypted pg_dump + files + SHA-256 manifest, offsite copy, prune and drill scripts (PR #23, `BACKUP_RESTORE.md`, migration `0017`), status "tested on synthetic data in a development container". Railway volume backups: 0.
- **Open:** #14 P0 offsite backups/restore proof (issue still open after PR #23), #22 Astra independent P0 audit, #26 RC-03/RC-04, #15/#16 P1, #30 infractions (MVP merged in PR #31, issue open), #21 coordination.
- **Status:** DEPLOYED (demo). Real production (company host + VPN, D-012/D-017, F-021) = DESIGNED, not deployed.

### 4. PNEU MOUHIM — `pneu-mouhim`
- **Purpose / users:** management for a 3-site tyre business (Dépôt Central, Magasin 01, Magasin 02). Roles (spatie, `app/Enums/RoleName.php`): `owner`, `site_manager`, `seller`, `storekeeper`, `technician` (D-32); permissions in `app/Enums/Permission.php`; owner-only 2FA (D-47); users assigned to one or more sites (D-33).
- **Repo:** `hdnkabour-gif/Pneumatiques-MOUHIM` (30 branches; open PRs #1, #2, #3, #7).
- **Stack:** PHP 8.4 FrankenPHP, Laravel 13, Filament 5, Livewire 4, PostgreSQL 18, Pest 5, spatie permission/activitylog/backup, mPDF.
- **Modules (Filament resources):** Activities, ApprovalRequests, Brands, Bundles, Categories, Customers, Equipment, InventoryCounts, Oil/Tyre catalogue references, OilDrums, Payments, Products, PurchaseOrders, ReplenishmentRequests, Roles, Sales, Services, Sites, StockLevels, StockMovements, Suppliers, Transfers, TyreLots, UsedTyres, Users, Vehicles.
- **Data model (73 tables created in `database/migrations`):** stock ledger `stock_movements` + cache `stock_levels` (D-08), reservations, lots, used tyres + inspections, transfers, sales/sale_lines/payments/allocations, issued_invoice_documents, work_orders, oil_drums + movements, cash_days, expenses, purchase orders/receipts/supplier_payments, approval_requests, vehicle make/model/generation/engine + fitments, activity_log (immutable trigger, D-34).
- **Deployments:** `lucid-playfulness/mouhim /Pneumatiques-MOUHIM` + `PNEU-MOUHIM-Worker` `ea55329f` (= main) `pneumatiques-mouhim-mouhim.up.railway.app`, volume `/app/storage/app/public`, `Postgres-ekYj`. Staging project: app `a2691d7d` (branch `fix/go-live-complete-strict-audit`), worker `6a811897` (branch `staging/integration`, closed unmerged PR #11) → **app and worker run different code** (R-008).
- **Backups:** spatie daily 02:00 to external storage (D-37); Cloudflare R2 production + automated verification still open (#13).
- **Open:** #20 P0 release gate, #14 P0 go-live demo-data removal (not executed), #17/#18/#19 P1 concurrency/atomicity, #13 R2.
- **Status:** DEPLOYED (pilot); go-live NOT cleared.

### 5. AMANZINE — `amanzine`
- **Purpose / users:** "Need OS": user writes a need (Darija/FR/AR/EN…), the knowledge graph `understand()` maps it to capability/profession/product → providers, merchants, orders, bookings. Users: consumers, merchants/providers, field agents, admins.
- **Repos and lineage:** see [AMANZINE classification](#amanzine-repository-classification-no-deletion-no-merge).
- **Stack:** React 19 + TS + Vite PWA; Node/Express (`server/routes/*` 32 routers); PostgreSQL (46 tables found in `server/`); Cloudinary media; WhatsApp Cloud API; optional OpenAI/Anthropic; Web Push/VAPID; delivery connectors (Amana, Promo Livraison); CMI payment references; legacy Supabase `sahar_sync`.
- **Data model:** users, refresh/otp tokens, providers + services/verifications/concepts, products, listings, orders + order_events, payments, wallets + wallet_transactions, loyalty_points, coupons, bookings + availability, conversations, user_memory, need_requests, field_visits, learning_* / search_* analytics, delivery providers/pricing/city mappings, notifications, broadcasts, reviews, audit_logs.
- **Deployments:** `spectacular-victory/Amanzine/balanced-growth` `4ff08a99` `amanzine.up.railway.app`; `spectacular-victory/staging/amanzine-staging` `4ff08a99` `triumphant-courage-staging.up.railway.app`, volume `/data`. Services named `AMANZINE` and `amanzine2` in the same project run **Tech-Platform-** (R-004).
- **Open:** GitHub issues/PR/CI state **UNKNOWN** (API not granted). 26 remote branches incl. many `repair/*-20261113` lines and `integration/unified-amanzine-20261115`.
- **Status:** DEPLOYED (pre-launch). `PRODUCTION_READINESS.md` in the tree is inherited from SAHARSHOP2026 (2026-06-18) – stale (C-09).

### 6. ALLOSERVIX — `alloservix`
- **Purpose / users:** IT/technical services website (32 services, 10 groups), visitor assistant (deterministic catalogue matching; optional OpenAI opt-in), service requests and technician ops, knowledge studio, admin (password + TOTP).
- **Repo:** `hdnkabour-gif/Alloservix` (27 merged PRs, 0 open issues).
- **Stack:** Node 22 `http` server, `node:sqlite` on `/data` volume (single replica), static pages, `node:test`.
- **Data model (27 tables):** services, service_revisions/drafts, settings, staff_accounts, staff_invites, security_state, audit, inquiries, service_requests, request_events, technicians, technician_skills, knowledge_concepts/links, brain_calls/unmatched/eval_cases/eval_runs, ai_usage, ai_provider_events, events, error_log, backup_log, backup_checks.
- **API:** `/api/public/{catalog,service/,assistant,diagnose,event,inquiry,requests,transcribe-audio,understand-image}`, `/api/admin/{login,logout,session,overview,services,settings,audit,inquiries,control-center,studio/*,ops/*,ai/status}`.
- **Deployment:** `ALLOSERVIX Website/production/alloservix-web` `781c982f` (= main), domains `alloservix-web-production.up.railway.app`, **`alloservix.ma`, `www.alloservix.ma`**; `robots.txt` still `Disallow: /`.
- **Status:** DEPLOYED. Public launch approval: UNKNOWN (C-07).

### 7. NEXUS — `nexus`
See docs/18, 20–26. Deployed `bc8e6d13` (web + `*/15` cron probes) in `NEXUS Control Center`; Postgres volume without backup (IDEA-025 / #13). Open: #10 P0 auth, #11 P0 integration, #12/#13 P1, #14 P2, #5 coordination.

### 8. NEXORA — `nexora`
- **Purpose / users:** modular medical platform (doctors, clinics, hospitals); multi-org memberships; platform admin without clinical access by default (ADR-0002).
- **Stack:** NestJS health-only API, Prisma schema 27 models (User, Organization, Facility, Department, Membership, Role/Permission, Plan/Feature/Subscription, Patient, Appointment, Encounter, ClinicalNote, AuditEvent, SupportGrant, PartnerAgreement, CareExchangeGrant…), local PostgreSQL RLS experiment, React synthetic demo, `packages/policy` deny-by-default.
- **Deployment:** `NEXORA Demo/demo/nexora-web-demo` `aed95a38` (= main), no database.
- **Status:** DEPLOYED (synthetic demo). Real patient data gate unmet (CNDP, hosting, security review, restore test, clinical sign-off).

### 9. TIJARA OS — `tijara-os`
- **Purpose / users:** multi-tenant SaaS for small shops (butcher/grill/restaurant, mechanics, fire/alarm). Tenants, branches, roles/memberships, platform admins.
- **Stack:** Node + TypeScript without framework, PostgreSQL with FORCE RLS and non-superuser runtime role, separate migrate job, Vitest (39 acceptance tests T1–T25 + API/e2e/backup/restore).
- **Data model (36 tables):** plans, tenants, branches, users, roles, role_permissions, memberships, items, recipe_versions/lines, batches, serials, customers, business_commands (idempotency), stock_balances, stock_movements (append-only), stock_reservations, sales_orders/lines, order_events, invoice_counters, invoices, payments, payment_allocations, receivable_entries, production_orders/lines, cost_policies(+versions), approval_policies/requests, audit_log, sessions, password_resets, platform_admins, platform_audit.
- **Deployment:** `tijara-os-staging/staging` `tijara-os` + `tijara-migrate` `e5e2b26d` (= main), `tijara-os-staging.up.railway.app`; Postgres 18. Backup service (R2) **not deployed**.
- **Gaps (docs/TEST_STATUS.md):** T25 work orders not built, T16 step-up is a caller flag, T24 plan limits partial, no locations/transfers/cash sessions.
- **Status:** DEPLOYED (staging, no real data).

### Proposed projects (no implementation evidence)
| Project | Status | Evidence of absence (2026-11-20) |
|---|---|---|
| School platform (المنصة المدرسية) | IDEA | No repo/branch/service; AMANZINE mentions schools only as need categories. |
| FleetDocs AI | IDEA | No repo or code reference. Would overlap RENT CAR document intelligence and SCANFLOW PRO (RU-03). |
| Other historical ideas | UNKNOWN | Not recorded in any repository; owner must list them to be registered. |

---

## AMANZINE repository classification (no deletion, no merge)
Measured by shared tracked paths / byte-identical blobs against `amanzine2`:

| Repo | Account / visibility | Last commit | Shared with amanzine2 (paths/identical) | Classification |
|---|---|---|---|---|
| `hdnkabour-gif/amanzine2` | public | 2026-11-16 | 756/756 | **CANONICAL** (deployed) |
| `hdnkabour-gif/AMANZINE` | public | 2026-07-21 | – (README only) | EMPTY PLACEHOLDER |
| `abdellatifhadana-byte/AMANZINE` | public | 2026-07-08 | 155/72 | HISTORICAL SNAPSHOT (168/168 identical to SAHARSHOP2026) |
| `abdellatifhadana-byte/SAHARSHOP2026` | public | 2026-07-08 | 212/124 | DIRECT ANCESTOR |
| `abdellatifhadana-byte/sahar-shop2026` | public | 2026-06-08 | 94/24 | ANCESTOR |
| `abdellatifhadana-byte/sahar-shop` | public | 2026-05-23 | 74/17 | EARLY PROTOTYPE ("AI Commerce OS") |
| `abdellatifhadana-byte/saharshop2025` | public | 2026-05-23 | 78/19 | EARLY PROTOTYPE (75/78 identical to sahar-shop) |
| `abdellatifhadana-byte/SAHARSHOP` | public | 2026-05-23 | 12/3 | EARLIEST PROTOTYPE (committed zip) |
| Railway services `AMANZINE`, `amanzine2` | spectacular-victory | – | source = Tech-Platform- | **MISNAMED – NOT AMANZINE** |

Lineage: `SAHARSHOP → sahar-shop / saharshop2025 → sahar-shop2026 → SAHARSHOP2026 ⊃ abdellatif/AMANZINE → amanzine2`.

## Dependency map (relations, not data flows)
```
hdnkabour-gif/Tech-Platform- ──deploys──▶ overflowing-vision (preview, stale)
          │                  └─deploys──▶ spectacular-victory: AMANZINE, amanzine2 (misnamed)
          └─public copy──▶ abdellatifhadana-byte/sahar2026
amanzine2 ──deploys──▶ spectacular-victory: balanced-growth, amanzine-staging
          └─legacy sync──▶ Supabase sahar_sync (external)
rent-car-app ──deploys──▶ lucid-playfulness/production  ◀── shared project ──▶ Pneumatiques-MOUHIM (env "mouhim ")
     │   └──▶ Fleetora OCR Staging
     └── vehicle_catalog_* seed (D-050) ◀── shared ids ──▶ PNEU vehicle/tyre/oil reference (D-48)
     └── ARCHITECTURE: "reuse ideas/engines from ScanFlowPro only after testing" ──▶ SCANFLOW PRO
NEXUS ──public HTTPS probes (7 hosts)──▶ PNEU pilot, Rent Car web + OCR staging, Alloservix, NEXORA demo, AMANZINE web + staging
NEXUS ──issue #5 coordination (metadata)──▶ rent-car #21/#22, PNEU #13/#14
TIJARA OS, NEXORA, SCANFLOW: no runtime dependency on other apps.
```
No app shares a database with another app according to service topology; **whether `rent-car-app` and `Pneumatiques-MOUHIM` use distinct Postgres services inside `lucid-playfulness` is UNKNOWN** (env values were not read; topology suggests `Postgres` ↔ production and `Postgres-ekYj` ↔ mouhim).

## Reuse opportunities (code reuse without merging data)
| ID | Capability | Exists in | Could serve | Approach |
|---|---|---|---|---|
| RU-01 | Append-only stock ledger + cache + reservations + no-negative stock | PNEU (D-08, D-45), TIJARA (ledger tests T7–T14) | each other, AMANZINE merchant stock | extract rules/tests as a spec; keep separate DBs |
| RU-02 | Encrypted backup → checksum → offsite → retention → restore drill | RENT CAR (`server/src/scripts/backup*`), TIJARA (`scripts/backup-job.sh`), PNEU (spatie), ALLOSERVIX (`backup_log`) | all apps incl. NEXUS (#13) | one shared runbook + one tested job image per stack |
| RU-03 | Document OCR with mandatory human review | RENT CAR local OCR (TD1 MRZ, framing), SCANFLOW PRO engines (code extraction, YOLO) | FleetDocs AI idea, ALLOSERVIX "ocr-documents" service | library-level reuse after independent test (already stated in rent-car ARCHITECTURE.md:8) |
| RU-04 | Vehicle / tyre / oil reference catalogue | PNEU, RENT CAR (shared text ids) | AMANZINE auto-repair needs | publish catalogue as versioned dataset package, not shared DB |
| RU-05 | Need understanding / catalogue-grounded assistant | AMANZINE AKG `understand()`, ALLOSERVIX brain + eval tables | each other | shared evaluation harness and lexicon format |
| RU-06 | Tenant isolation with FORCE RLS + non-bypass runtime role | TIJARA (tested), NEXORA (prototype) | NEXORA Phase 1, AMANZINE merchants | reuse migration patterns and `/ready` RLS self-check |
| RU-07 | Owner auth: scrypt hashes, DB sessions, CSRF, TOTP, invite/bootstrap | NEXUS, RENT CAR (D-019/D-020), TIJARA bootstrap invite, ALLOSERVIX TOTP | all | common checklist + tests; no shared identity store |
| RU-08 | Approvals engine (discount, credit, under-cost, stock adjust) | PNEU (D-25), TIJARA (approval_policies) | RENT CAR (late fees), AMANZINE | shared policy model |
| RU-09 | `/ready` exposing deployed SHA | TIJARA (`/ready` version) | all apps → NEXUS deployed-SHA checks | adopt as portfolio convention |

## Things built twice (or more)
| ID | Duplicate | Where | Note |
|---|---|---|---|
| DUP-01 | Inventory/stock ledger, invoices, payments allocations, cash closing, approvals | PNEU (Laravel) and TIJARA OS (TS) | TIJARA is a generalised multi-tenant version of PNEU's domain; decide whether PNEU is a TIJARA tenant later (D-REQ-04) |
| DUP-02 | Backup/restore tooling | 4 implementations (RU-02) | none proven against a stored offsite copy |
| DUP-03 | Knowledge-graph "brain" | NEXUS IDEA-001 (code knowledge graph), AMANZINE AKG, ALLOSERVIX knowledge studio | different purposes (code vs. needs vs. catalogue) – share format only |
| DUP-04 | OCR/document pipelines | RENT CAR, SCANFLOW PRO (×2 repos) | |
| DUP-05 | Same product in multiple repos | AMANZINE ×8 repos; SCANFLOW ×2; TECH PLATFORM ×2 (+empty) | classification above |
| DUP-06 | Same source deployed multiple times | Tech-Platform- ×3 services in 2 projects | |
| DUP-07 | Owner/admin login stacks | NEXUS, RENT CAR, TIJARA, ALLOSERVIX, PNEU (Filament), AMANZINE (JWT+OTP) | RU-07 |

## What could NOT be verified (UNKNOWN)
1. Private repositories of `abdellatifhadana-byte` (not visible).
2. GitHub issues/PRs/CI for `amanzine2` and all `abdellatifhadana-byte` repos (API access not granted; push-attach for amanzine2 was refused in this session).
3. Runtime health, functional correctness and data integrity of every deployed service (only deployment status was read).
4. Which Postgres service each app uses inside shared projects (env values intentionally not read).
5. Any offsite backup existence (R2/S3/external disks) and any restore performed from a stored copy.
6. Whether PNEU go-live reset, Rent Car real-company host, AMANZINE launch, ALLOSERVIX public launch were approved by the owner.
7. Employer authorization status for TECH PLATFORM monitoring and for the public `sahar2026` copy.
8. Contents of the 197 PDFs in `scan-Flow-pro` (not opened on purpose).
9. Which SCANFLOW repo is canonical; whether SCANFLOW was ever deployed anywhere.
10. The list of "other historical ideas" (not present in any repository).
11. Owner browser login/acceptance of NEXUS UI (docs/25).

---

## Contradictions report and decisions needing approval (ملخص)
### Contradictions found
| ID | Where | Contradiction | Proposed correction |
|---|---|---|---|
| C-01 | docs/17 | IDEA-019…IDEA-025 are each used twice (14 rows, 7 IDs) | keep first occurrences; give second occurrences IDEA-030…036 with legacy alias (applied as annotation in docs/17, renumbering pending approval) |
| C-02 | docs/17 | statuses outside the vocabulary: `PARTIAL`, `PLANNED`, `CODED`, `IMPLEMENTED (pending CI)` | map to vocabulary; IDEA-028/029 now DEPLOYED per Railway `bc8e6d13` |
| C-03 | docs/18 | "Not implemented" section says no PostgreSQL NEXUS DB and lists the Railway project, while docs/25 records them DEPLOYED | annotate docs/18 as superseded by docs/25 (done via note) |
| C-04 | docs/19 + registry v1 | main SHAs stale for PNEU (`181095a7`→`ea55329f`), RENT CAR (`1e934d36`→`781ab813`), ALLOSERVIX (`188b928d`→`781c982f`); TIJARA OS and SCANFLOW absent; "six" app families | keep v1 as history; current state in baseline v1 |
| C-05 | registry v1 `projects_with_unclear_app_mapping` | now resolved: Railway source proves `AMANZINE`/`amanzine2` services = Tech-Platform- | recorded R-004 |
| C-06 | rent-car README "Status (2026-11-05)" | says OCR not implemented; OCR merged in PRs #20, #25, #28 | app-side doc fix (out of scope, read-only) |
| C-07 | Alloservix README step 3 | "do not point alloservix.ma here until approved" vs domains attached on Railway | owner decision D-REQ-06 |
| C-08 | tijara-os docs/TEST_STATUS.md | says "not deployed on any environment / no UI/API/auth", while README + DEPLOYMENT.md + Railway show staging with UI/auth | app-side doc fix |
| C-09 | amanzine2 PRODUCTION_READINESS.md | readiness report for SAHARSHOP2026 (2026-06-18) inside current AMANZINE | mark historical (app-side) |
| C-10 | Railway | environment name `mouhim ` has trailing space; NEXUS public-http-targets uses `mouhim` | normalise IDs in NEXUS only |
| C-11 | rent-car #30 open | MVP merged in PR #31 | owner decides whether to close |
| C-12 | Issue #5 acceptance #1 | requests source issue refs recorded in docs/17 | now recorded in docs/31 and IDEA-037 |

### Decisions requiring owner approval
| ID | Decision |
|---|---|
| D-REQ-01 | Approve the IDEA ID collision fix (IDEA-030…036) or another scheme. |
| D-REQ-02 | Public copies: what to do with `abdellatifhadana-byte/sahar2026` (employer code public) and `scan-Flow-pro` PDFs (make private / remove – owner action, not done here). |
| D-REQ-03 | Canonical SCANFLOW repo, and whether SCANFLOW joins NEXUS monitoring. |
| D-REQ-04 | PNEU vs TIJARA OS relationship (independent products, or PNEU as a TIJARA vertical later). |
| D-REQ-05 | Rename / separate Railway services that run Tech-Platform- inside the AMANZINE project; retire stale `overflowing-vision` preview (owner action in Railway). |
| D-REQ-06 | ALLOSERVIX: is `alloservix.ma` an approved public launch? |
| D-REQ-07 | Backup policy: enable Railway volume backups and/or app-level offsite backups per app, and first restore drill order. |
| D-REQ-08 | Whether to update `registry/portfolio-discovery.v1.json` consumers (`lib/data.js`, inventory test) to read baseline v1 (code change → separate PR). |
| D-REQ-09 | Employer authorization for TECH PLATFORM (ADR-010) given it is already publicly deployed on 3 Railway domains. |

---

## CHECKPOINT
- **Branch:** `docs/portfolio-baseline-v1-20261120` from NEXUS `main` `bc8e6d1393748b2e47cee34cd6ab69d5bb06dac3`.
- **Files added:** `docs/27_PORTFOLIO_BASELINE_V1.md`, `docs/28_FEATURE_REGISTRY.md`, `docs/29_DECISION_REGISTRY.md`, `docs/30_RISK_GAP_REGISTER.md`, `docs/31_EVIDENCE_INDEX.md`, `registry/portfolio-baseline.v1.json`.
- **Files edited (append/annotate only):** `docs/17_IDEA_LOG.md` (ID collision register, new IDEA-037…040, status corrections with evidence), `docs/18_IMPLEMENTATION_PROGRESS.md` (supersession note), `docs/19_PORTFOLIO_DISCOVERY.md` (pointer to baseline), `README.md` (document map).
- **Not changed:** any application repo, database, secret, Railway setting, `registry/portfolio-discovery.v1.json`, `registry/public-http-targets.v1.json`, code or tests.
- **Tests run:** NEXUS `npm`-free checks: JSON validity of the new registry and the existing inventory test (see PR body for output).
- **Deployment state:** nothing deployed or merged by this task.
- **Next step:** owner review of D-REQ-01…09; then (separate PRs) registry consumer update and app-side doc fixes.
- **Blockers:** access to `amanzine2` API and to private `abdellatifhadana-byte` repos.
