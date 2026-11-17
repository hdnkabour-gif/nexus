# NEXUS — Unified Application Intelligence & Control Plane

**Status: architecture, contracts and tested read-only monitor-core library. There is no running NEXUS API, frontend, production connector or connected product agent yet.** This repository starts a controlled implementation; the documentation describes intended behavior, not completed functionality.

NEXUS is the central *operational knowledge, reliability, diagnostics and governed control* platform for the applications we build, host, and support. It is not a second business database and it is not an unrestricted remote terminal.

## Product principles
1. Each product owns its customer, patient, employee, sales, inventory, document, and accounting data. NEXUS receives **minimal redacted operational metadata**.
2. Read-only monitoring first. Actions require app-scoped, versioned, allowlisted capabilities, signed short-lived requests, source-side authorization, evidence, and audited outcomes.
3. No direct SQL, code execution, arbitrary shell, generic file browsing, password retrieval, silent database restoration, or automatic production merges.
4. Human authorization for risky actions; two-person approval for especially sensitive destructive/data operations. The target application is the final policy authority.
5. Verify results, not just API success. Never claim a backup is restorable without an isolated restore test.
6. All notifications and AI recommendations have evidence, provenance, timestamp, and confidence/unknown state.
7. Internationalization from the start: Arabic (RTL) and French, with technical English identifiers.

## Document map
| File | Purpose |
|---|---|
| [docs/01_PRODUCT_VISION.md](docs/01_PRODUCT_VISION.md) | Goals, users, boundaries, product experience |
| [docs/02_ARCHITECTURE.md](docs/02_ARCHITECTURE.md) | Components, stack, trust zones, data flows |
| [docs/03_DATA_RELATIONSHIPS.md](docs/03_DATA_RELATIONSHIPS.md) | Entities, relations, constraints |
| [docs/04_API_AND_ROUTES.md](docs/04_API_AND_ROUTES.md) | NEXUS UI/API and agent routes |
| [docs/05_SECURITY_AND_ACTIONS.md](docs/05_SECURITY_AND_ACTIONS.md) | Identity, approval, safe command protocol |
| [docs/06_FEATURE_CATALOG.md](docs/06_FEATURE_CATALOG.md) | Full feature registry and priorities |
| [docs/07_INTEGRATION_PLAYBOOK.md](docs/07_INTEGRATION_PLAYBOOK.md) | How to onboard current and future apps |
| [docs/08_PNEU_MOUHIM_DISCOVERY.md](docs/08_PNEU_MOUHIM_DISCOVERY.md) | First actual application discovery |
| [docs/09_ROADMAP_AND_TESTS.md](docs/09_ROADMAP_AND_TESTS.md) | Milestones, acceptance and go/no-go |
| [docs/10_AI_DIAGNOSTICS.md](docs/10_AI_DIAGNOSTICS.md) | Evidence-first assistant architecture |
| [docs/11_UX_AND_OPERATIONS.md](docs/11_UX_AND_OPERATIONS.md) | UX routes, workflows, alerts and roles |
| [docs/12_REFERENCES.md](docs/12_REFERENCES.md) | Technical references and ADR process |
| [docs/13_CODE_INTELLIGENCE.md](docs/13_CODE_INTELLIGENCE.md) | Deep source/route/schema/permission knowledge graph |
| [docs/14_EXTERNAL_INTEGRATIONS.md](docs/14_EXTERNAL_INTEGRATIONS.md) | All external dependencies and provider monitoring contracts |
| [docs/15_AI_CODING_AGENTS.md](docs/15_AI_CODING_AGENTS.md) | OpenAI/Claude and isolated coding agent governance |
| [docs/16_BACKUP_RESTORE_ORCHESTRATION.md](docs/16_BACKUP_RESTORE_ORCHESTRATION.md) | End-to-end recovery evidence and safe restoration |
| [docs/17_IDEA_LOG.md](docs/17_IDEA_LOG.md) | Persistent ideas, decisions and their actual status |
| [docs/18_IMPLEMENTATION_PROGRESS.md](docs/18_IMPLEMENTATION_PROGRESS.md) | Actual implementation status and next milestones |
| [docs/19_PORTFOLIO_DISCOVERY.md](docs/19_PORTFOLIO_DISCOVERY.md) | Dated discovery of six current application repositories and Railway projects |
| [registry/portfolio-discovery.v1.json](registry/portfolio-discovery.v1.json) | Machine-readable provider discovery snapshot, **not** live telemetry |
| [packages/monitor-core/](packages/monitor-core/) | Tested read-only normalization and backup health logic |
| [contracts/](contracts/) | Versioned JSON Schema/OpenAPI contracts and synthetic examples |

## Intended application registry
- PNEU MOUHIM (Laravel/PostgreSQL, initial discovery and first adapter)
- AMANZINE (commerce, merchant isolation, delivery integration)
- RENT CAR / Fleetora (rentals, documents, OCR)
- ALLOSERVIX (website, service requests and operations)
- NEXORA (healthcare; restrictive metadata-only monitoring and separate controls)
- 2M TECH PLATFORM (private intranet; connection **only with organizational authorization**, never open inbound access)
- Future applications via the same manifest and onboarding process.

## Now / next
- **Now:** architecture, testable safe monitoring primitives, contract specifications and dated provider discovery. No NEXUS live integrations.
- **Next P0:** auth + RBAC/ABAC, app registry, GitHub/Railway read-only collectors, ingestion & alert pipeline, PNEU MOUHIM readonly adapter, audit and basic dashboard.
- **Later P1:** incidents, verified backup health, runbooks, delegated support, signed approved commands and recovery test orchestration.
- **Later P2:** evidence-grounded assistant, cross-service dependency graphs, anomaly forecasts and cost intelligence.

Read [docs/09_ROADMAP_AND_TESTS.md](docs/09_ROADMAP_AND_TESTS.md) before implementation. Production security and backup readiness are release gates.
