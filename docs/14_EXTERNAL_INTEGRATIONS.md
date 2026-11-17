# 14 — Complete external monitoring / integration matrix (design)

**Recorded 2026-11-17. Status: designed, NOT connected.** The phrase "monitor everything" means the platform can inventory and observe **authorized, technically exposed** signals, not that it can silently see secrets, customers, offline assets or inaccessible external systems.

## Integration model
Every provider has an independent `connector_instance` scoped to one organization/application/environment and a capability set: discover/read_events/read_health/read_aggregate/request_action/restore_test. Default = **read-only**. Store only credential *references* in a vault, never token values or copies of customer records. Track API quotas, OAuth scopes/authorization, last_success_at, last_error_code (redacted), event freshness, schema versions, source URL and reliability.

NEXUS monitors three distinct planes:
- **Source/control plane**: repositories, pipelines, infrastructure config metadata, dependencies, versions, policy and role boundaries.
- **Runtime/reliability plane**: deployments, metrics, logs/traces, queues, scheduler, databases/storage health, backups/restoration evidence and DNS/SSL.
- **Business-integrity plane**: strictly source-computed PASS/FAIL/UNKNOWN checks and anonymous counts. The product remains source of truth.

## Connector registry

| ID | Source | Minimum observations | Policy / special care | Priority |
|---|---|---|---|---|
| EX01 | GitHub App | repositories, branch SHA, code structure, protected branches, PR, CI, dependencies, releases | app installation per approved repo; source indexed by pinned SHA; avoid leaking code | P0 |
| EX02 | Railway GraphQL | projects, environments, deployments, services, metrics, logs, volume presence, domains, consumption, provider alerts | read-only scoped provider identity; **never read/display env values** | P0 |
| EX03 | Source-app adapter | health, DB schema status, jobs, queues, data-integrity check counters | no business table access; per-capability auth + local source audit | P0 |
| EX04 | PostgreSQL/MySQL | uptime, migration drift, backup version, replication, latency, connection saturation | via source-app probes or restricted metrics endpoint, **no central SQL superuser** | P1 |
| EX05 | S3/R2/object storage | object ages, success receipts, checksums, encryption, retention and restore evidence | head/list metadata only; separate backup vault account | P1 |
| EX06 | Railway Volumes | backup schedule/snapshot age, mount/size, restore workflow status | snapshots ≠ complete logical backup; staged restore changes need human review | P1 |
| EX07 | PostgreSQL PITR/WAL | archive status, restore window, recovery objective and fork drill evidence | restore creates sibling DB; never silent production cutover | P1 |
| EX08 | DNS/registrar | A/AAAA/CNAME/TXT, expiry, nameserver, DNSSEC where relevant | public records only; registrar account optional | P1 |
| EX09 | TLS/certificates | certificate expiration, chain, hostname match, HTTP redirect | public bounded probe, safe host allowlist | P1 |
| EX10 | HTTP/API synthetic tests | availability, timing, status, configured non-mutating critical journeys | no real payments/orders, no auth secrets in logs | P0 |
| EX11 | SMTP/email delivery | queue, bounce, failure and expiry/reset-email delivery aggregates | never store message bodies, reset tokens or recipients | P1 |
| EX12 | WhatsApp/SMS/push | message job failures, rate limits and delivery status aggregates | provider API via app; no private message content | P1 |
| EX13 | Delivery vendors (Promo Livraison, etc.) | webhook arrival, tracking consistency, ambiguous submissions, stale status | via source app only; prevent duplicate shipment on unknown result | P1 |
| EX14 | Payment gateways | settlement state consistency, webhook failures, idempotency and reconciliation result | aggregate status only; no PAN, payer identity or secret | P1 |
| EX15 | OCR/document engines | queue lag, quality/confidence distributions, language coverage, review backlog | no images, CIN, licenses or extracted text | P1 |
| EX16 | Auth/identity | MFA coverage, lockouts, unusual session patterns, account recovery results | aggregate or opaque identifier, no password or session token | P1 |
| EX17 | Sentry/OTel/APM | error fingerprints, traces, latency, release correlation, budgeted logs | redact before collection; low-cardinality, bounded retention | P1 |
| EX18 | CDN/WAF/Cloudflare | availability, cache, origin errors, DDoS indicators, blocked requests | scoped zone access, avoid raw IP retention if unnecessary | P1 |
| EX19 | Security scanning | dependency CVEs, SBOM, SAST, secret-alert status, config drift | metadata/evidence, never leaked secret content | P1 |
| EX20 | Analytics (privacy-conscious) | aggregate user journeys, conversion funnel, slow page experience | no session recording or personal profiling by default | P2 |
| EX21 | Infrastructure/cost | consumption, quota, CPU/memory/disk/net, spend threshold and forecast | budgeting with no business sale figures copied | P1 |
| EX22 | OpenAI API / Claude API | diagnostic proposals and evidence summaries | redacted evidence + budget limits; responses are hypotheses | P1/P2 |
| EX23 | Claude Code / Agent SDK | isolated code worktree analysis, test PRs, diagnostic reproduction | separate sandbox identity; no production secrets/deploy rights | P2 |
| EX24 | Incident channels | email/Slack/Teams etc notifications and on-call | redact and minimize; explicit authorized destinations | P1 |
| EX25 | 2M private intranet | only permissioned health/ticket/device status via outbound-only bridge | employer authorization mandatory; never public ingress | P2 |
| EX26 | Future provider | documented plugin SDK, contract tests and scoped capability registry | fail closed for unknown providers | P2 |

## Unifying observations
- Integrations: `provider_instances(id, app_env_id, provider_kind, scope_hash, connection_status, last_success_at, last_observation_at, vault_secret_ref)`.
- Provider assets: `external_resources(id, provider_instance_id, external_ref, kind, display_name_redacted, health, last_seen_at)`.
- Dependencies: `resource_edges(from_resource_id, to_resource_id, relation, evidence_ref)`.
- Checks: `check_results(check_id, app_env_id, outcome, observed_at, evidence_ref, source_version)`.
- External incidents correlate provider signals to source app incidents by time/environment, not assume causal links without verification.

## Permissions / failure semantics
- 401/403: report **credentials revoked / permission denied**, not "app down."
- 429: provider rate-limited; backoff and cache snapshot; preserve timestamp/STALE status.
- 5xx/timeout: integration degraded/unknown, never invent latest state.
- Missing data/unsupported API: NOT_CONNECTED or UNKNOWN, never PASS.
- No arbitrary callback endpoints; restrict outbound URLs, prevent SSRF and webhook spoof/replay.
- Keep integration credentials distinct from conversational ChatGPT/Railway connectors; production uses its own dedicated credentials.

## Provider-specific read vs action
Railway provides a GraphQL API with scoped token types, and native volume backup and PITR capabilities. NEXUS should start with **status reading**, then optionally request approved restore drills through dedicated source-owned automation. A Railway volume restore is staged and keeps the old volume, but is restricted to the same project/environment. PostgreSQL PITR restoration creates a sibling DB and manual cutover. Neither should be called 'safe production restore' without prior independent verification and sign-off.

Official references:
- https://docs.railway.com/integrations/api
- https://docs.railway.com/volumes/backups
- https://docs.railway.com/volumes/point-in-time-recovery
