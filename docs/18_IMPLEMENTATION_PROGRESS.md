# 18 — Actual implementation status (as of 2026-11-17)

## What is real and testable now
- Versioned JSON schemas/OpenAPI design contracts and synthetic examples.
- `packages/monitor-core` pure, read-only operational assessment library:
  * classify last backup run / age / integrity / offsite / DB+files coverage / isolated restore evidence;
  * normalize provider observations by field allowlist and per-app/env scope;
  * deduplicate last observations and make stale data UNKNOWN instead of healthy;
  * fixed-host readonly Github repository metadata and Railway project metadata fetching helpers, with injectible fetch for tests;
  * unit/negative tests under Node.js 22 with no external dependencies.
- A GitHub Actions CI workflow to run unit, negative and syntax tests.
- A durable idea register and provider/AI/backup architecture.
- Dated repository/Railway metadata discovery for six application families in registry/portfolio-discovery.v1.json (not live NEXUS telemetry).

**Tests use synthetic examples and mock provider responses.** Neither GitHub nor Railway integration helpers have been exercised against dedicated production credentials. No live data, live backup operation or restore has been executed.

## First-console implementation (2026-11-17)
- Next.js Arabic/RTL owner-only web console with route-protected overview, app listing/360, topology, observability, backup, AI and integration readiness, security and settings.
- Server-side credential bootstrap and signed sessions, secure production cookie, origin validation; tests verify fail-closed auth.
- Protected read-only metadata API and per-app GitHub/Railway credential-optional probe endpoints; real dedicated provider credentials not yet connected.
- CI additionally builds Next.js production app and runs auth tests.

## Not implemented
- No independently verified NEXUS web deployment yet at the time of this document; Next.js source exists and is built in CI. No NestJS API server, OIDC/MFA platform or PostgreSQL NEXUS DB.
- A dedicated NEXUS Railway project has been created; service/domain/deployment must be verified separately.
- No credential vault, GitHub App installation or Railway token configured in NEXUS.
- No real product agent, heartbeat, signed command execution, action approval or audit persistence.
- No provider log reading, database introspection, backups listing, restore drilling or AI API request.
- No production recovery, feature toggle, password reset, code patching, PR creation or deployment through NEXUS.

## Release gates before live collectors
1. Implement OIDC/MFA, app-env RBAC+ABAC, secure server-only credential vault and audit persistence.
2. Design restricted provider scopes; refresh GH/Railway GraphQL query against staging with dedicated tokens.
3. Build Postgres metadata tables, migrations and bounded Redis/BullMQ ingestion/collection workers.
4. Add source-owned PNEU MOUHIM readonly adapter with signed event envelope + masking.
5. Establish backup evidence from actual DB+files, offsite object and isolated test.
6. Add UI showing last observation time and UNKNOWN/degraded explicitly.
7. Add provider API failure tests and permission revocation; protect GitHub branch with required CI.

## Next implementation PRs
- P0.1 API skeleton + OIDC guard + PostgreSQL registry/audit tables + integration tests.
- P0.2 Next.js app registry / app 360 / read-only dashboard.
- P0.3 readonly GitHub App and Railway collectors / scheduled jobs with token vault.
- P0.4 PNEU MOUHIM adapter and real read-only integrity checks / backup alerting.
- P1 restoration *drill* orchestrator and verification; R3/R4 source-owned controlled action only in later independent security-reviewed PR.

Never translate a deployed service's status SUCCESS into a verified restorable business system.
