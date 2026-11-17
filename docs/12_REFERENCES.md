# 12 — References, ADRs and evidence rules

## External standards and documentation
- GitHub webhook signature validation: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
- GitHub webhook best practices / delivery IDs: https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks
- Railway Public API (GraphQL): https://docs.railway.com/integrations/api
- Railway projects API examples: https://docs.railway.com/integrations/api/manage-projects
- OpenTelemetry signal conventions: https://opentelemetry.io/docs/concepts/semantic-conventions/
- OWASP API Security Top 10: https://owasp.org/projects/api-security-project
- OWASP webhook security: https://cheatsheetseries.owasp.org/cheatsheets/Webhook_Security_Cheat_Sheet.html
- JSON Schema Draft 2020-12: https://json-schema.org/draft/2020-12
- OpenAPI specification: https://spec.openapis.org/oas/latest.html

Consult updated official vendor docs before implementing provider-specific scopes/endpoints or choosing dependency versions; do not treat this blueprint as a pinned dependency lockfile.

## Decision log — open ADRs
- ADR-001: TypeScript/Next.js/NestJS modular monolith vs alternative backend.
- ADR-002: OIDC provider / MFA mechanism and service-to-service credential management.
- ADR-003: Single-org first vs multi-tenant from day one; isolation enforcement.
- ADR-004: Event retention, business signal minimization, data residency and compliance.
- ADR-005: GitHub App scopes, Railway token scopes and secrets vault provider.
- ADR-006: Adapter signature protocol, key rotation, nonce store, idempotency and canonical JSON.
- ADR-007: Recovery approval thresholds R2/R3/R4, RTO and RPO.
- ADR-008: Observability budget, metrics backend and sampling.
- ADR-009: AI provider and local/no-cloud options, per-product privacy.
- ADR-010: authorized TECH PLATFORM network connectivity.

Each ADR must record date, context, alternatives, decision owner, security assessment, consequences and reversible migration path. Until accepted, technology choices are architectural recommendations.

## Evidence rules
- Source state = exact commit SHA and URL; provider state = environment + service + observation time.
- A green deployment is not a backup check, CI check, business integrity check or customer readiness signoff.
- Keep confirmed / proposed / unknown distinct in both reports and database.
- Never store passwords, private keys, source business rows, medical records, raw documents, identifying OCR data or environment variable values.
- Target future tools must return time, confidence/evidence, action scope, audit and verification.
