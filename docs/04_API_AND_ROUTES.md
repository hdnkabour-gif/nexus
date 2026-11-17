# 04 — Navigation and API contracts (planned)

**All routes below are design contracts, not currently implemented.** API prefix: /api/v1. Target adapters use /internal/nexus/v1 on the target product. All application-scoped routes enforce object-level authorization and environment scope.

## UI routes — Next.js
| Route | Screen |
|---|---|
| / | Control Center: SLO, incidents, backups, deployments |
| /apps | Application registry, onboarding and lifecycle |
| /apps/[appId] | App 360: code, topology, health, risks, runbooks |
| /apps/[appId]/environments/[envId] | Environment detail and dependencies |
| /topology | Interactive cross-product dependency map |
| /deployments | GitHub CI, commit, migrations, Railway rollout and rollback planning |
| /observability | Metrics, logs (redacted), traces, synthetic checks |
| /incidents | Incident queue, severity, assignment, SLA |
| /incidents/[incidentId] | Timeline, evidence, hypotheses and verify outcome |
| /diagnostics | Guided investigation and evidence-based assistant |
| /runbooks | Versioned operational procedures |
| /actions | Safe action requests and execution receipts |
| /approvals | Human approvals and dual-control |
| /backups | Offsite backup status, verification and isolated restore drills |
| /security | MFA, identities, token scope, audit anomalies, vulnerabilities |
| /support | Account recovery, lockout, application-user support tickets |
| /integrations | GitHub, Railway and product-adapter connection health |
| /catalog | Knowledge base, capabilities and feature flags |
| /costs | Infra costs, usage forecasts and budgets |
| /audit | Immutable action and access history |
| /settings | Organization, language, alert channels, policies |

## NEXUS API (authenticated)
| Method | Endpoint | Purpose |
|---|---|---|
| GET / POST | /api/v1/apps | list/register an application (create = privileged) |
| GET | /api/v1/apps/:appId | manifest, owner, environments, providers |
| GET | /api/v1/apps/:appId/topology | services/dependencies and evidence refs |
| GET | /api/v1/apps/:appId/capabilities | only approved actions for requester |
| GET | /api/v1/environments/:envId/health | latest timestamped health |
| GET | /api/v1/deployments | source/build/rollout history |
| GET | /api/v1/incidents | filtered app/environment incidents |
| GET | /api/v1/incidents/:id | incident, redacted evidence, audit |
| POST | /api/v1/incidents/:id/diagnose | run evidence-grounded diagnosis |
| GET | /api/v1/runbooks/:id | specific immutable version |
| POST | /api/v1/actions/requests | create request with idempotency key |
| POST | /api/v1/actions/:id/approve | approve as eligible independent reviewer |
| POST | /api/v1/actions/:id/dispatch | perform preflight + dispatch; never raw command |
| GET | /api/v1/actions/:id | state and verification receipt |
| GET | /api/v1/backups/status | status/restore-drill evidence |
| GET | /api/v1/audit | scoped, read-only audit events |
| GET | /api/v1/connections | provider scopes and health, **never secret values** |

## Inbound ingestion/webhooks
- POST /api/v1/ingest/events — product event envelope, schema validation, signed origin, idempotency, size limits, replay control.
- POST /api/v1/webhooks/github — GitHub signature HMAC-SHA256, unique delivery ID, asynchronous processing.
- POST /api/v1/webhooks/railway — only where provider supports validated events; otherwise safe polling via API.
- POST /api/v1/ingest/receipts — signed execution receipt from product (or verified via poll).
- GET /health/live and /health/ready — no internals/secrets; readiness includes essential dependencies.

## Product adapter (inside source product)
| Method | Endpoint | Guarantee |
|---|---|---|
| GET | /internal/nexus/v1/capabilities | versioned list of actually implemented capabilities, signed/authenticated |
| GET | /internal/nexus/v1/health | bounded, non-sensitive health and schema version |
| POST | /internal/nexus/v1/diagnostics | named read-only check, bounded result; no arbitrary query |
| POST | /internal/nexus/v1/actions | signed, approved, short-lived, allowlisted command |
| GET | /internal/nexus/v1/actions/:executionId | idempotent reconciliation / source receipt |

## Required interface semantics
- HTTPS only; content type JSON; API version + schema_version; request_id/correlation_id; UTC RFC3339 timestamp.
- Consistent error envelope: code, message (sanitized), request_id, retryable, optional docs_ref; never raw exception/stack.
- No public or user-generated URL as an internal HTTP target (SSRF allowlist); no arbitrary query, shell or URL fetch capability.
- Cursor pagination; rate limits; per-app quotas; explicit retention/sampling; JSON Schema and OpenAPI-based contract tests.
- 202 Accepted is not command success; success requires target receipt plus verification.
