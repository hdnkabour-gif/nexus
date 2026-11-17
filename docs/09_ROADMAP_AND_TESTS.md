# 09 — Delivery plan, test strategy and release gates

## Phase 0 — architecture and scope (THIS PR)
- Stable vision, trust boundaries, target stack, data model, UI routes, API paths, source app inventory.
- Machine-readable manifest, event and command envelopes and synthetic samples.
- No actual API, UI, deployment or source adapter claims.

## Phase 1 — NEXUS read-only control plane (P0)
Deliver:
- NestJS API modules: auth, registry, provider connections, ingestion, checks, audit.
- Next.js app: login/MFA integration, overview, app registry, App 360, provider connection setup, alert inbox.
- Postgres migrations, secrets references, Redis worker, outbox and dedupe.
- GitHub read-only collectors / signed webhook; Railway read-only API collector; no raw tokens in browser.
- PNEU MOUHIM readonly adapter with stock:verify, scheduler, backup age, queue health and redacted service metadata.
- Automated CI for API unit/integration + UI accessibility + contract schema validation.
Exit: tests pass on isolated staging; role-to-app isolation verified; event injection rejected; unauthorized reads denied; no raw customer data stored; provider revocation tested.

## Phase 2 — reliability operations (P1)
Deliver: incidents, topology, runbooks, backup health and isolated restoration test orchestration, deployment correlations, alert routing, 360 verification.
Exit: staging exercises prove crash/backup failure/stock inconsistency are detected; false positives and alert dedupe measured; restore drill reproduces data and files safely.

## Phase 3 — governed support actions (P1)
Deliver: capability registry, policy engine, approvals, signed one-time commands, source-side handler, reconciliation and receipt verification. Begin with no-risk and support actions.
Exit: authorization matrix tests including privilege escalation/BOLA, nonce replay, expiry, duplicate delivery, timeout UNKNOWN reconciliation and deliberate failure; no irreversible change possible without approvals.

## Phase 4 — cross-app rollout (P1/P2)
Add one scoped app at a time: AMANZINE -> RENT CAR -> ALLOSERVIX -> NEXORA operations-only -> approved TECH PLATFORM agent. Each app requires owner signoff and privacy review.
Exit: per-app independent access, health and restoration proof; no implicit cross-app authorization.

## Phase 5 — assistant and optimization (P2)
Versioned knowledge ingestion, code map, cited AI diagnosis, synthetic reproduction, budget analytics, anomaly detection and forecast. No AI auto-approval.
Exit: evaluation set contains known incidents, wrong hypotheses, prompt injection, missing evidence, cost and data-exposure tests.

## Mandatory test families
1. **Unit:** rule engines, masking, state transitions, idempotency and policy decisions.
2. **Contract:** JSON Schema, OpenAPI validation, version mismatch and backwards compatibility.
3. **Integration:** GitHub/Railway collector rate-limits/permission revocation; outbox -> inbox replay.
4. **Security:** login/MFA, RBAC/ABAC per org/app/env, BOLA/IDOR, CSRF, SSRF, signature, replay/nonce, overposting, malicious logs, dependency scanning.
5. **Failure:** network disconnect after command accepted, duplicate POST, expired signature, clock skew, queue lag, dead-letter, crashed worker, offsite storage down.
6. **Data safety:** staging backup/restore into new DB, tables+FK+sequences+files hash, stock/payment consistency check, immutable audit verification.
7. **E2E UX:** Arabic RTL/French, keyboard access, mobile, action approvals, error/unknown state, no secret visible.
8. **Load:** ingestion burst, telemetry cardinality, queue backpressure, performance per SLO.
9. **Operational:** build, test, deployment gate, smoke, rollback, disaster recovery evidence.
10. **Compliance:** consent, minimization, retention, audit export and employer/private-network permissions.

## Release blockers (Go / No-Go)
- Red: unscoped cross-app/tenant data access, missing backups/failed restore drill, secrets in logs, dangerous unsandboxed commands, no actor audit.
- Red: inability to distinguish unknown outcome from failed command.
- Red: production action without source-side authorization and correctly configured approval policy.
- Yellow: lack of OTel full instrumentation, absence of assistant, advanced forecasts; does not block readonly MVP.
- Green: all P0 acceptance tests on staging with evidence and reviewed PR, owner approves promotion.

## Definition of Done for each feature
Design + permissions + API contract + migration + unit tests + role/cross-scope tests + negative tests + logging redaction + runbook + rollback plan + CI evidence + staging acceptance + documentation update. Status tracked as proposed / designed / implemented / tested / deployed / independently verified. Never collapse these into a single Done.
