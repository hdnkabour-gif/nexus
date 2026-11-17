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
| IDEA-023 | Dedicated Railway NEXUS project isolated from business app services | SETUP IN PROGRESS; independent project created | docs/20_FIRST_CONSOLE.md |

## Decisions requiring explicit ADR approval
- OIDC provider and production 2FA method.
- Whether NEXUS v1 is personal-only or multi-organization, and data locality/retention.
- Provider credentials architecture (GitHub App, Railway project token/OAuth, vault).
- AI model provider, data sharing policy per application and cost ceilings.
- Restoration approval authority and product-specific RPO/RTO.
- Whether NEXORA and 2M TECH PLATFORM are legally authorized to send telemetry to cloud NEXUS.

## Changelog
### 2026-11-17
- Created external integration catalog, AI coding-agent governance, backup/restore orchestration and living idea log.
- Added read-only core and mock CI, six-app discovered provider inventory and automated inventory-scope test.
- Started protected Next.js preview app, signed bootstrap sessions and new build workflow; first independent Railway project created.
- All features marked DESIGNED or PLANNED unless verified by actual code/tests; no live connection inferred.
