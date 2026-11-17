# 06 — Feature catalog, ownership and priority

This is a target product backlog. **Planned != implemented.** P0 = necessary foundation, P1 = next milestone, P2 = advanced.

| ID | Module / feature | Behavior and benefit | Phase |
|---|---|---|---|
| F01 | Application Registry | enumerate app, source repo, owner, environments and lifecycle | P0 |
| F02 | Automatic discovery | GitHub/Railway read-only discovery with manifest review | P0 |
| F03 | App 360 profile | tech stack, routes, API, DB relation summaries, migrations, deployments | P0 |
| F04 | Provider connections | credential scope, token health, rotation and expiry alerts | P0 |
| F05 | Environment topology | per-app services, DB, storage, dependencies, health | P0 |
| F06 | Status/SLO monitor | heartbeat, latency, health, downtime and thresholds | P0 |
| F07 | GitHub CI monitor | checks, PR/commit status, failing tests and build issues | P0 |
| F08 | Railway deploy monitor | rollout, crashes, replicas, build and runtime logs | P0 |
| F09 | Central alert inbox | dedupe, severity, ownership, escalation and quiet hours | P0 |
| F10 | Immutable audit | actor, permission, redacted evidence, timestamps and result | P0 |
| F11 | Schema-based ingestion | event/capability contract, masking, replay protection | P0 |
| F12 | RBAC + environment ABAC | scoped control, MFA, account management and approvals | P0 |
| F13 | Synthetic smoke probes | login-free liveness, critical non-destructive paths | P0 |
| F14 | Integrity dashboards | results of stock/financial consistency checks, no raw rows | P0 |
| F15 | Backup health | age, success/failure, offsite destination, scope and alert | P0 |
| F16 | Dependency map | graph of services and impact radius for any failure | P1 |
| F17 | Incident Management | timeline, assignment, SLA, cause and resolution evidence | P1 |
| F18 | Root cause correlation | deployment/config/metric/trace time correlation | P1 |
| F19 | Guided runbooks | checklists, prerequisites, rollback and verification | P1 |
| F20 | Recovery drills | isolated restoration, document checks, RPO/RTO evidence | P1 |
| F21 | Support console | delegated unlock, expiring reset link, session revoke | P1 |
| F22 | Action approval engine | policy, MFA, two-person R3/R4 and maintenance windows | P1 |
| F23 | Signed command gateway | allowlisted signed commands; idempotent dispatch/receipt | P1 |
| F24 | Feature flags governance | source-owned flag edits with approval and rollback | P1 |
| F25 | Audit evidence export | redacted review bundle, incident/changes/approvals | P1 |
| F26 | Versioned knowledge base | docs, source maps, known issues, runbook versions | P1 |
| F27 | Release readiness gates | CI+backup+security+smoke evidence before release | P1 |
| F28 | Security posture | 2FA, credential exposure, TLS, dependency risks, config drift | P1 |
| F29 | Queue and jobs health | age, lag, retries, poison/dead-letter and worker status | P1 |
| F30 | Storage and database health | quotas, replica, connections, disk, schema migrations | P1 |
| F31 | Cost/usage dashboard | Railway resource usage, project budgets and forecasts | P1 |
| F32 | Localization | Arabic/French, RTL, timezone, accessible operator UX | P0 |
| F33 | Alerts to channels | in-app, email or allowed channels with dedup/escalation | P1 |
| F34 | Incident postmortem | chronology, hypotheses vs facts, preventive work | P1 |
| F35 | Product-specific probes | PNEU, AMANZINE, Fleetora, Alloservix, NEXORA, Tech | P1 |
| F36 | Evidence-grounded AI | summarize logs/code/runbooks with citations and confidence | P2 |
| F37 | Investigation copilot | suggests next safe probe, never auto-runs risky actions | P2 |
| F38 | Pattern/anomaly detection | correlate recurring faults and forecast regressions | P2 |
| F39 | Fleet-wide compatibility | discover runtime library versions, deprecations, CVEs | P2 |
| F40 | Resource optimization | rightsizing and cost recommendations with guardrails | P2 |
| F41 | Intelligent support triage | dedupe reports, map ticket to app and known runbook | P2 |
| F42 | Portfolio roadmap | feature/PR/issue coverage and technical-debt dashboards | P2 |
| F43 | Change-impact simulator | predict dependencies affected before a new deployment | P2 |
| F44 | Recovery readiness score | evidence-based, not synthetic uptime = recoverability | P2 |
| F45 | SLO burn-rate alerts | early warning of budget exhaustion | P2 |
| F46 | Digital Twin topology | rooms/racks/physical dependencies where authorized | P2 |
| F47 | Access-sharing anomaly hints | security signals with human review; no auto accusation | P2 |
| F48 | Multi-organization operation | optional tenant separation for future external customers | P2 |
| F49 | Custom integration SDK | compatible adapters in PHP, TS and future languages | P1 |
| F50 | Compliance evidence tracker | CNDP/GDPR and domain-specific privacy obligations | P2 |
| F51 | Incident replay / sandbox | safe reproductions on synthetic data in staging | P2 |
| F52 | Self-healing policy | only validated R1 probes, scoped, limited and opt-in | P2 |
| F53 | Knowledge freshness | compare doc revisions with code migrations and routes | P2 |
| F54 | Observability noise control | sampling, PII guard, cardinality budgets, suppression | P1 |
| F55 | On-call and shift handoff | handover, tasks, on-call rota and incident ownership | P1 |
| F56 | Mobile / PWA operator view | alert-first overview and approval with strong MFA | P2 |
| F57 | Offline export | signed read-only report for constrained environments | P2 |
| F58 | Configuration inventory | safe presence/age of needed env vars, never values | P1 |

## Domain-specific extension packs
- **PNEU:** verify stock movements vs levels, reservations/lots, used tyres and oil drums, invoice sequence, cash closing, outstanding credit, transfer states, offsite backup and restoration.
- **AMANZINE:** merchant isolation, order/payment consistency, Promo Livraison timeout/duplicate/unknown status, shipment tracking transitions, webhooks, API token scope.
- **RENT CAR:** rental conflict, license policy, contract numbering, charges approval, OCR throughput/confidence and manager-approval queue, expiry of customer invite.
- **ALLOSERVIX:** lead routing, service catalog health, content editing audit, form delivery, visitor funnel *aggregates*, technician match status.
- **NEXORA:** operational infra/security only initially; no patient content; multi-clinic isolation, privileged access and audit.
- **TECH PLATFORM:** only sanctioned internal equipment health, ticket and outage metadata; physical/intranet network segregation.

Features require explicit definitions of owners, success metrics, minimum privileges, evidence requirements, versioned contracts, threat model and acceptance tests before shipping.
