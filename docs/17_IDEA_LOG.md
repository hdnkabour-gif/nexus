# 17 — Durable ideas, product decisions and progress journal

## Rule
Any new idea, requirement, new technical finding or decision must be added through a GitHub PR to this repository, rather than relying on chat memory. Give it an immutable ID, date, author/request origin, source link if public, status (IDEA, DESIGNED, IMPLEMENTED, TESTED, DEPLOYED, VERIFIED, REJECTED), priority and related modules. Update the status only with implementation and test evidence. A proposal is not a finished feature.

For large items, additionally open a GitHub Issue and reference it here. Preserve history instead of silently overwriting major architecture choices. Generated source metadata snapshots should include source commit SHA and observed_at.

## Ideas captured 2026-11-17
| ID | Idea / requirement | Current status | Reference |
|---|---|---|---|
| IDEA-001 | NEXUS = application source code, schema, routes, roles and dependency **knowledge graph** | DESIGNED | docs/13_CODE_INTELLIGENCE.md |
| IDEA-002 | Monitor every external provider, API, DNS, SSL, payments/delivery, mail, OCR, storage and network where authorized | DESIGNED | docs/14_EXTERNAL_INTEGRATIONS.md |
| IDEA-003 | Unified App 360 with code SHA, runtime/deployed SHA, topology, provider links, issues and recommendations | DESIGNED | docs/11_UX_AND_OPERATIONS.md |
| IDEA-004 | OpenAI API-powered diagnostic assistant with cited evidence and explicit unknown states | DESIGNED | docs/15_AI_CODING_AGENTS.md |
| IDEA-005 | Claude API / Claude Code / Agent SDK optional specialist for complex coding problems | DESIGNED | docs/15_AI_CODING_AGENTS.md |
| IDEA-006 | AI-generated patch via **isolated GitHub PR**, mandatory tests, human approval before merge | DESIGNED | docs/15_AI_CODING_AGENTS.md |
| IDEA-007 | A backup dashboard that verifies DB+file coverage, offsite copies and tests recoverability | DESIGNED | docs/16_BACKUP_RESTORE_ORCHESTRATION.md |
| IDEA-008 | Request an isolated restore drill in NEXUS, with success evidence and source-app authorization | DESIGNED | docs/16_BACKUP_RESTORE_ORCHESTRATION.md |
| IDEA-009 | Risky production restore strictly opt-in, independent approval, fresh backup, incident and recovery plan | DESIGNED | docs/05_SECURITY_AND_ACTIONS.md |
| IDEA-010 | Persist every new idea/decision/incident lesson in the repository with status and references | IMPLEMENTED (documentation) | this file |
| IDEA-011 | Read-only deterministic backup health classification as first executable reusable module | IMPLEMENTED; CI tests passed for prior commit | packages/monitor-core |
| IDEA-012 | Read-only Github/Railway collectors in a secured authenticated NEXUS service | PARTIAL: library fetchers tested with mocks; secure service and live connectors NOT IMPLEMENTED | packages/monitor-core/src/providers.mjs |
| IDEA-013 | Secrets/permissions drift checks without reading env values | DESIGNED | docs/14_EXTERNAL_INTEGRATIONS.md |
| IDEA-014 | Future applications onboard via same signed capability/observation contracts | DESIGNED | docs/07_INTEGRATION_PLAYBOOK.md |
| IDEA-015 | Offsite independence: Railway volume snapshots and logical dumps are complementary, not substitutes | DESIGNED | docs/16_BACKUP_RESTORE_ORCHESTRATION.md |
| IDEA-016 | Replay-safe action reconciliation: network timeout must not cause duplicate real-world effects | DESIGNED | docs/05_SECURITY_AND_ACTIONS.md |
| IDEA-017 | AI provider per-app data classification, provider opt-out and budget ceilings | DESIGNED | docs/15_AI_CODING_AGENTS.md |

| IDEA-018 | Dated source and Railway discovery for all six known product families, without falsely claiming live connection | IMPLEMENTED (metadata snapshot) | docs/19_PORTFOLIO_DISCOVERY.md |

| IDEA-019 | Protected first usable NEXUS web console (Arabic RTL, app registry, topology, backups, diagnostics) | IMPLEMENTED; Next build + auth CI passed on feature PR (deployment pending verification) | docs/20_FIRST_CONSOLE.md |
| IDEA-020 | First owner login with signed short-lived sessions, no default password | IMPLEMENTED; test-backed bootstrap, MFA/OIDC still missing | lib/auth.js |
| IDEA-021 | Read-only manual GitHub and Railway metadata probe from scoped server-only credentials | IMPLEMENTED (helpers and protected route); LIVE PROVIDER NOT CONFIGURED | lib/external.js |
| IDEA-022 | Live console must clearly distinguish observed historical inventory from live checks | IMPLEMENTED in first UI | app/console/page.jsx |
| IDEA-023 | Dedicated Railway NEXUS project isolated from business app services | DEPLOYED; startup and HTTP routing checked, full browser login not independently tested | docs/21_FIRST_DEPLOYMENT_EVIDENCE.md |

| IDEA-024 | Evidence report per deployment with SHA, Railway environment, startup/HTTP checks and limitations | IMPLEMENTED (documentation) | docs/21_FIRST_DEPLOYMENT_EVIDENCE.md |
| IDEA-025 | First customer-visible UI accessible via protected Railway URL; no public portfolio data | DEPLOYED, owner acceptance/screenshot pending | docs/20_FIRST_CONSOLE.md |

| IDEA-030 (legacy alias: IDEA-019, 2nd use) | Custom owner display name and username alias in Railway, without replacing existing email account | IMPLEMENTED (pending CI and Railway sync) | docs/22_OWNER_VARIABLES.md |
| IDEA-031 (legacy alias: IDEA-020, 2nd use) | Owner password rotation via offline generated scrypt hash; never plaintext Railway variable | IMPLEMENTED (pending CI) | scripts/hash-owner-password.mjs |

| IDEA-032 (legacy alias: IDEA-021, 2nd use) | NEXUS-owned isolated PostgreSQL and owner-internal first-time password enrollment | DEPLOYED; browser enrollment pending user acceptance | docs/25_INITIAL_DB_AND_PROBES_DEPLOYMENT.md |
| IDEA-033 (legacy alias: IDEA-022, 2nd use) | Persist session revocation and owner audit without business personal data | DEPLOYED; integration tests passed | lib/owner-db.js |

| IDEA-034 (legacy alias: IDEA-023, 2nd use) | Actual, credential-free HTTPS availability check of verified public app domains, with evidence age and no private data | DEPLOYED + VERIFIED collection of 7 observations; per-site outcome not asserted | docs/24_PUBLIC_HTTP_MONITORING.md |
| IDEA-035 (legacy alias: IDEA-024, 2nd use) | 15-minute independent Railway Cron worker for read-only public reachability | VERIFIED: first scheduled execution succeeded; saved 7/7 observations in NEXUS DB | docs/25_INITIAL_DB_AND_PROBES_DEPLOYMENT.md |

| IDEA-036 (legacy alias: IDEA-025, 2nd use) | Ensure NEXUS database itself is backed up offsite and restoration proof exists | PLANNED; no verified offsite backup | docs/16_BACKUP_RESTORE_ORCHESTRATION.md |

| IDEA-026 | Explicit trusted browser origin for Railway login behind reverse proxies, safer 303 redirects and visible rate-limit/Origin diagnostics | IMPLEMENTED (pending CI and deployed smoke) | docs/23_PERSISTENT_OWNER_AUTH.md |

| IDEA-027 | Browser-compatible signed double-submit CSRF across login, password setup, password change, and logout; no reliance on mobile Origin header | IMPLEMENTED (pending CI & Railway validation) | lib/csrf.js |

| IDEA-028 | Command OS premium operational interface with trustworthy freshness, app matrix, dynamic HTTP evidence and responsive navigation | CODED / pending CI and deployment | docs/26_COMMAND_OS_UI_V1.md |
| IDEA-029 | Local keyboard command palette and accessible app catalog filters, without exposing private content | CODED / pending CI and deployment | components/command-os/command-palette.jsx |

## Ideas captured 2026-11-20 (Portfolio Baseline V1)
| ID | Idea / requirement | Current status | Reference |
|---|---|---|---|
| IDEA-037 | Portfolio Baseline V1: dated inventory of 9 apps + 2 proposed, with GitHub SHA vs Railway deployed SHA, feature/decision/risk/evidence registers | IMPLEMENTED (documentation + `registry/portfolio-baseline.v1.json`); not consumed by UI yet | docs/27_PORTFOLIO_BASELINE_V1.md, Issue #5 |
| IDEA-038 | Add TIJARA OS and SCANFLOW PRO to NEXUS registry and probes | DESIGNED (in baseline registry only; probes/UI unchanged) | docs/27, D-REQ-03 |
| IDEA-039 | Portfolio convention: each app exposes deployed SHA on `/ready` (pattern from TIJARA OS) | IDEA | docs/27 RU-09 |
| IDEA-040 | Shared, tested backup + restore-drill runbook reused across apps (code reuse, no shared data) | IDEA | docs/27 RU-02, docs/30 R-003 |

## ID collision register (found and resolved 2026-11-20 on owner instruction, PR #18 comment)
IDEA-019 … IDEA-025 were each assigned twice on 2026-11-17. **Resolution:** the first occurrence keeps its ID. The second occurrence now has a unique **primary** ID (IDEA-030 … IDEA-036) and carries the legacy alias in its row. No row was deleted and the text of each row is unchanged. A reference anywhere that says "IDEA-019" etc. means the first occurrence, unless it points to a PR in the "2nd occurrence" column below.

| Legacy ID | 1st occurrence (keeps ID) | 2nd occurrence → new primary ID | Introduced by (1st / 2nd) |
|---|---|---|---|
| IDEA-019 | Protected first NEXUS web console | Owner display name / username alias → **IDEA-030** | PR #3 / PR #6 |
| IDEA-020 | First owner login, signed sessions | Owner password rotation via scrypt hash → **IDEA-031** | PR #3 / PR #6 |
| IDEA-021 | Read-only manual GitHub/Railway probe | NEXUS-owned PostgreSQL + enrollment → **IDEA-032** | PR #3 / PR #7 |
| IDEA-022 | Live console distinguishes historical vs live | Session revocation + owner audit → **IDEA-033** | PR #3 / PR #7 |
| IDEA-023 | Dedicated Railway NEXUS project | Credential-free HTTPS availability checks → **IDEA-034** | PR #3 (row edited in #4) / PR #8 |
| IDEA-024 | Evidence report per deployment | 15-minute Railway cron worker → **IDEA-035** | PR #4 / PR #8 |
| IDEA-025 | First UI on protected Railway URL | NEXUS DB offsite backup + restore proof → **IDEA-036** | PR #4 / PR #9 |

## Status corrections with evidence (2026-11-20)
Original status text above is kept; the evidence-based status below takes precedence.
| ID | Status text in table | Status per vocabulary | Evidence |
|---|---|---|---|
| IDEA-012 | PARTIAL | IMPLEMENTED (library, mock-tested) | packages/monitor-core |
| IDEA-030, IDEA-031 (legacy 2nd IDEA-019/020), IDEA-026, IDEA-027 | IMPLEMENTED (pending CI …) | DEPLOYED (part of `bc8e6d13`, Railway nexus-web SUCCESS 2026-11-18T17:29); owner browser acceptance UNKNOWN | docs/31 E2, E3 |
| IDEA-036 (legacy 2nd IDEA-025) | PLANNED | DESIGNED; Railway shows 0 volume backups on the NEXUS Postgres volume (snapshot S1, docs/31) and no app-level offsite backup is known for NEXUS | docs/31 E2 |
| IDEA-028, IDEA-029 | CODED / pending CI and deployment | DEPLOYED (`bc8e6d13`, CI 3/3 success); not VERIFIED | docs/31 E2, E3 |
| IDEA-034, IDEA-035 (legacy 2nd IDEA-023/024) | DEPLOYED + VERIFIED / VERIFIED | keep VERIFIED only for "first scheduled run saved 7/7 observations" (docs/25); not re-verified in this pass | docs/25 |

## Decisions requiring explicit ADR approval
- OIDC provider and production 2FA method.
- Whether NEXUS v1 is personal-only or multi-organization, and data locality/retention.
- Provider credentials architecture (GitHub App, Railway project token/OAuth, vault).
- AI model provider, data sharing policy per application and cost ceilings.
- Restoration approval authority and product-specific RPO/RTO.
- Whether NEXORA and 2M TECH PLATFORM are legally authorized to send telemetry to cloud NEXUS.

## Changelog
### 2026-11-20
- Revision 2 (owner-relayed review): duplicate primary IDs resolved (IDEA-030…036 + legacy aliases); R-003 backup evidence split; strict TESTED evidence (docs/28 TE-*).
- Portfolio Baseline V1 (docs/27–31, registry/portfolio-baseline.v1.json). Resolved IDEA ID collisions: second uses now IDEA-030…036 with legacy aliases, rows preserved, status corrections with evidence, IDEA-037…040. Issue #5 cross-app references recorded in docs/31 E4.

### 2026-11-17
- Created external integration catalog, AI coding-agent governance, backup/restore orchestration and living idea log.
- Added read-only core and mock CI, six-app discovered provider inventory and automated inventory-scope test.
- Started protected Next.js preview app, signed bootstrap sessions and new build workflow; first independent Railway project created.
- Completed initial Railway deployment and documented actual HTTP routing and limitations; no source product adapter connected.
- Deployed first isolated NEXUS PostgreSQL, forced owner password enrollment, public HTTPS probes and a scheduled cron service; confirmed their exact limits in docs/25_INITIAL_DB_AND_PROBES_DEPLOYMENT.md.
- Previous features stay DESIGN/PLAN until actual code/tests/deployment evidence proves their separate status.
