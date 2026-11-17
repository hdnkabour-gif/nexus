# 07 — Application onboarding and adapter playbook

## Prerequisites / discovery checklist
1. Confirm ownership and right to connect; record authorization, environment classification and allowed data categories.
2. Inspect repository current default-branch SHA, languages, framework, routes, migrations, models, background tasks, tests, deployment manifests and documentation.
3. Inventory hosting providers, projects, services, environments, storage volumes, DB services, DNS and external integrations; **do not copy secrets**.
4. Record business invariants as diagnostic checks, e.g. stock ledger equals cached stock; invoice sequences unique; order state reconciliation.
5. Catalog existing admin services and policies to reuse rather than introducing duplicate business logic.
6. Identify backup process, offsite destination, age, encryption, scope and actual isolated restore test.
7. Build signed JSON manifest, obtain owner approval, mark evidence and 'unknown' fields honestly.
8. Provision read-only provider integration; test least-privilege and rotation.
9. Build app-side read-only adapter; run test/staging; measure performance and data minimization.
10. Only then propose source-owned commands and explicit approvals in a separate release.

## Manifest and capability lifecycle
- Artifact: contracts/application-manifest.schema.json; each app has app_id, owner, source, environments, discovered metadata, planned capabilities, evidence/provenance.
- Status values: discovered, awaiting-authorization, onboarding, active, degraded, suspended, revoked.
- Never mark an adapter ACTIVE merely because the repository or Railway service exists.
- Adapter capability must exist in *target code* and pass its own authorization tests before NEXUS allows it.
- Capability schema holds name, version, input schema, output schema, risk, approvals, timeout, idempotency behavior and verification rule.
- Changes to capability risk, permissions or command payload require reviewed version bump; avoid silently re-granting.

## Adapter instrumentation
- Read-only: health, version, schema/migration status, queue, scheduled tasks, limited aggregates, business check results.
- Event producer: uses outbox and retries, signs payload, redacts fields, includes source timestamp and correlation id.
- Signed action handler: verifies audience/signature/nonce/expiry/capability then invokes source application service; never SQL or shell.
- Safe fallback: if NEXUS unavailable, business app continues working; outbox bounded and has circuit breaker.
- Source audit: log actor/authorization, local target status, method and completion. NEXUS audit links by immutable correlation ID.

## Provider collectors
- GitHub App: installation scoped to approved repositories, webhooks verified via signature and unique delivery ID; reading code depends on repo grants.
- Railway API: dedicated scoped token; distinguish project/environment, active vs staged resources, deployment state and logs. Never expose env values; report presence only.
- External services (e.g. Promo Livraison): only through source app integration to avoid storing live merchant shipping credentials in NEXUS.
- Private networks: sanctioned local agent can initiate **outbound** mTLS tunnel; no direct inbound open ports.

## Implementation order
- First: PNEU MOUHIM (contract, stock/backup health, readonly).
- Next: AMANZINE and RENT CAR after audit and privacy review.
- Then: ALLOSERVIX, NEXORA operations-only, and authorized Tech Platform.
- All future apps use discovery -> approval -> readonly -> verified action-capabilities process.

## Per-app delivery artifacts
For every app maintain: current source SHA, service/dependency diagram, route index, database relationship inventory (schema only), role/permission matrix, business invariants, provider environment map, backups/restore evidence, incident/runbook catalog, implementation status, contract tests, threat model and open issues. No business customer records in any artifact.

## Risk and connection modes
- discovery_only: repo/provider inventory; no agent
- readonly: diagnostics and status, strict field allowlist
- governed_actions: approved capabilities after staging + authorization tests
- suspended: immediately block commands while retaining scoped incident history
