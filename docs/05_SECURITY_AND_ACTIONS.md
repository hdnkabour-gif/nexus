# 05 — Security, governance and controlled actions

## Security invariant
No unbounded remote control. NEXUS is **not** a superuser across all customer data. Authorization is at three points: UI/API identity policy, NEXUS command policy, **and** independent authorization inside the target product. Compromising NEXUS must not grant unrestricted product database access.

## Authentication and authorization
- OIDC provider with phishing-resistant MFA preferred for privileged operators; short sessions, secure cookie, CSRF and step-up MFA on writes.
- RBAC + ABAC: organization/app/environment, business tenant/site, role, action risk, time, maintenance window and incident context.
- Deny by default, per-object authorization (BOLA/IDOR), audited explicit grants, periodic access review, instant credential revocation.
- Separate identities/permissions for GitHub integration, Railway integration, product adapter and human operator.
- No sharing of OAuth tokens or UI user sessions with background jobs.
- Support access to customer account must be time-bounded, scoped to an opaque subject reference and explicitly delegated by app owner.
- Break-glass only via documented time-limited procedure with reason, notification and independent retrospective audit.

## Action risk matrix
| Risk | Examples | Policy |
|---|---|---|
| R0 read-only | health, redacted diagnostics, get backup age | scoped auth + audit |
| R1 low write | trigger safe cache probe, notify owner, open ticket | role + preflight + audit |
| R2 sensitive | unlock login, issue password-reset link, revoke sessions, retry idempotent job | step-up MFA, owner-defined approval, rate limit, verify postcondition |
| R3 high-risk | restore to new isolated DB, update integration scopes, change feature flag affecting money | independent reviewer, staged/dry-run, maintenance window, backup evidence |
| R4 destructive | replace production database, delete records, mass financial corrections | **disabled by default**; explicit out-of-band business authorization, two-person approval, full tested recovery plan; never agent-initiated |

Examples intentionally excluded: reset password to known plaintext, bypass 2FA, arbitrary SQL/shell, directly mutate invoice amounts, force-merge CI failure, delete audit logs.

## Signed command protocol
1. Create unique action_request with app/environment, capability name and version, canonical JSON args, idempotency key, actor and evidence.
2. Policy service validates actor and source app ownership; recent MFA and approval thresholds.
3. Preflight retrieves capability version, target data status, app state, maintenance and backup requirements; store signed digest of immutable request.
4. Sign command with per-app asymmetric key (Ed25519 suggested) including key id, nonce, issued_at, expires_at (short TTL), target audience, payload hash, approvals hash and idempotency key.
5. Adapter validates signature, key rotation state, audience, clock tolerance, nonce, request hash, scope, local role/policy, version and business preconditions.
6. Adapter records a local audit/inbox entry and calls **existing native service/action** in a transaction where appropriate. Prevent replay; do not execute twice.
7. Adapter returns execution ID, status and verifier data; on network timeout NEXUS marks UNKNOWN and polls target status before any retry.
8. NEXUS stores immutable receipt + verification, not raw business response. Any fail/unknown triggers alert/reconciliation workflow.

Signature protects identity/integrity; transport security, replay protection, authorization, rate limiting and audit still required. Never trust client-supplied target URLs or unvalidated webhook bodies.

## Recovery and data safety
- Restore first to isolated database/environment and run integrity tests: schema/FK/sequence, documents presence and hashes, business checks.
- Production restore requires explicit two-person approval, announced downtime/maintenance, current-state backup, point-in-time analysis and post-restore consistency check.
- Backup age, checksum, object location, encryption, restore exercise date and scope visible in NEXUS; success of backup command alone is insufficient.
- No bulk transfer of business tables to NEXUS. Classify and redact logs/notifications. Define per-app retention, deletion and regulatory reviews.
- Per-application key rotation, least privilege, incident revocation, optional outbound-only connection when product is behind firewall.

## Threat model (minimum)
- Compromised central admin -> mitigate step-up MFA, R3/R4 dual control, product-side checks.
- Cross-app or cross-tenant data leak -> row/object scoping on every query, contract tests, field filtering.
- Signed webhook replay / spoofed event -> signature check, event ID ledger, replay window and bounded size.
- Command delivered twice / ambiguous network -> idempotency key + target reconciliation.
- Prompt injection via logs/repos/runbooks -> treat inputs as data, tool allowlist, citations and approval.
- Sensitive logging -> field allowlist, redaction, encryption, limited access, bounded retention.
- No backups / corrupted backups -> offsite copies + isolated restore drills and independent alerting.
- Hostile dependency or malicious PR -> dependency scanning/SBOM, branch protection, CI and reviews.
- Network SSRF / arbitrary connectors -> outbound allowlist, strict DNS/TLS verification, no generic URL action.
- Insider misuse -> access history, approval separation, alerts, support case linkage and review.

## Special cases
- NEXORA: do **not** centralize patient/medical content; separate compliance/security assessment and least-privilege operational indicators only.
- 2M TECH PLATFORM: employer approval required for monitoring or agent installation. Maintain private connectivity, no exposed inbound route.
- AMANZINE: no multi-merchant crossover; integration retries distinguish unknown remote outcome from guaranteed failure.
