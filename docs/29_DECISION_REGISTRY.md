# 29 — Portfolio Decision Registry (V1, verified 2026-11-20)

Index of technical decisions that already exist in each repository, plus portfolio-level decisions awaiting the owner. **The source documents remain authoritative**; this file only points to them so decisions are not re-litigated or silently overwritten. Status words are the source's own (Accepted / Proposed / Validated …).

## Where each app records decisions
| App | Decision source (path @ SHA) | Count / range |
|---|---|---|
| PNEU MOUHIM | `docs/decisions.md` @`ea55329f` | D-01 … D-58 (v1.1, validated) |
| RENT CAR | `DECISIONS.md` @`781ab813` | D-001 … D-051 |
| AMANZINE | `docs/adr/ADR-0001…0007` + `REPORTS/ARCHITECTURE_DECISIONS.md` @`4ff08a99` | 7 ADR + 5 documented decisions (13 sections) |
| NEXORA | `docs/decisions/ADR-0001…0003` @`aed95a38` | 2 accepted, 1 proposed |
| TIJARA OS | `docs/PRODUCT_AND_ARCHITECTURE.md`, `docs/DEPLOYMENT.md` @`e5e2b26d` | inline decisions (no IDs) |
| ALLOSERVIX | `README.md`, `docs/*_V1x.md`, `docs/AI_INTENT_ONLY.md` @`781c982f` | inline, versioned by doc |
| TECH PLATFORM | `ARCHITECTURE-DESIGN.md`, `MASTER-AUDIT-STATE.md`, `PASSATION.md` @`924aa502` | proposals "à valider" (metadata only) |
| SCANFLOW PRO | none | — |
| NEXUS | `docs/12_REFERENCES.md` ADR-001…010 (open), `docs/17_IDEA_LOG.md` | 10 open ADRs |

## Key cross-cutting decisions already taken
| Ref | App | Decision | Why (as recorded) |
|---|---|---|---|
| PM D-02, D-31 | PNEU | Laravel 13 + Filament 5 + Livewire 4 + PostgreSQL 18 + Pest | stable, free, Arabic support |
| PM D-05 | PNEU | Money in centimes (bigint), MAD only | exactness |
| PM D-08, D-45 | PNEU | Stock = movements ledger; cache table; never negative; row locks | integrity, `stock:verify` |
| PM D-14, D-58 | PNEU | Per-type yearly numbering; invoice number without letters ("219/26") | match paper invoices; accountant to confirm |
| PM D-15 | PNEU | Invoice correction only by credit note | legal traceability |
| PM D-34 | PNEU | Immutable activity log (PostgreSQL trigger) | audit |
| PM D-37 | PNEU | Daily 02:00 spatie backup of DB + files to external storage | recovery |
| PM D-47 | PNEU | TOTP 2FA mandatory for owner only | (D-38 superseded) |
| RC D-009 | RENT CAR | React + TS / Node + Express / PostgreSQL | — |
| RC D-012, D-013, D-014 | RENT CAR | Real production on a company-hosted machine; current i5 PC dev-only | data stays inside company |
| RC D-019, D-020 | RENT CAR | scrypt hashes; DB-backed opaque sessions, not JWT | revocation, Windows without build tools |
| RC D-030 | RENT CAR | Railway = public demo, fictitious data only | — |
| RC D-035, D-040 | RENT CAR | No delete on business tables; append-only money ledger | traceability |
| RC D-036 | RENT CAR | PostgreSQL exclusion constraint prevents overlapping reservations | correctness |
| RC D-037, D-046, D-051 | RENT CAR | pg_dump + files + SHA-256 manifest; optional AES-256-GCM; nightly + offsite | recovery |
| RC D-038 | RENT CAR | No telemetry, no external OCR, no third-party scripts; test fails on outbound network | privacy |
| RC D-050 | RENT CAR | Vehicle catalogue = advisory reference data with ids stable with PNEU seed | cross-app consistency |
| AM ADR-0001…0007 | AMANZINE | Knowledge foundation; executable constitution (rules as tests); everything explainable; single stance source; no hard navigation; cold-start demand capture | product doctrine |
| NX ADR-0001 | NEXORA | Modular monolith first | Phase 0 |
| NX ADR-0002 | NEXORA | One identity, multiple memberships, isolated clinical data; platform admin has no clinical access by default | privacy |
| NX ADR-0003 | NEXORA | Patient-mediated care network — **Proposed**, needs clinical/legal review | — |
| TJ DEPLOYMENT | TIJARA OS | Separate migrate job with superuser creds; runtime role without SUPERUSER/BYPASSRLS; `/ready` refuses RLS bypass | tenant isolation |
| TJ DEPLOYMENT | TIJARA OS | Backups to Cloudflare R2 (encrypted, checksum, retention 7d/5w/12m) instead of Railway backups | Railway scheduled backups need Pro; independence from Railway |
| AX README | ALLOSERVIX | SQLite on one volume, single replica; analytics/inquiries/AI off by default; one admin with TOTP | privacy-first preview |
| NEXUS README | NEXUS | Metadata-only control plane; read-only first; no direct SQL/shell | product principles 1–7 |

## Features explicitly rejected or deferred (do not rebuild without a new decision)
| Ref | App | Rejected / deferred | Status |
|---|---|---|---|
| PM D-04 | PNEU | Offline mode | REJECTED (4G router recommended instead) |
| PM D-24 | PNEU | Commercial TecDoc database in V1 | REJECTED for V1 |
| PM D-26 | PNEU | WhatsApp Business API (wa.me links only) | deferred |
| PM D-27 | PNEU | Barcodes (except QR for used tyres) | deferred |
| PM D-28 | PNEU | Payroll, HR planning, e-commerce, full accounting, TecDoc | REJECTED for V1 |
| PM D-51 | PNEU | 80 mm thermal ticket | REJECTED (A4 only) |
| RC D-001 | RENT CAR | Public self-service booking marketplace | REJECTED |
| RC D-006, D-016 / F-016 | RENT CAR | WhatsApp API ingestion and automated sending | deferred |
| RC F-017, F-018, F-019 | RENT CAR | GPS, AI damage comparison, advanced AI analytics | deferred |
| RC D-038 | RENT CAR | External OCR providers, analytics, third-party scripts | REJECTED |
| RC D-041 | RENT CAR | Server-side PDF engine | deferred (browser print) |
| RC D-020 | RENT CAR | JWT sessions | REJECTED |
| NEXUS README | NEXUS | Direct SQL, arbitrary shell, generic file browsing, password retrieval, silent restore, auto production merges | REJECTED |
| AM docs/IDEAS_BACKLOG.md §④ | AMANZINE | "engineering fantasy" items not to be built before success metric | deferred |

## Portfolio decisions awaiting the owner
See D-REQ-01 … D-REQ-09 in [27_PORTFOLIO_BASELINE_V1.md](27_PORTFOLIO_BASELINE_V1.md#decisions-requiring-owner-approval), plus the still-open NEXUS ADR-001…010 in [12_REFERENCES.md](12_REFERENCES.md).
