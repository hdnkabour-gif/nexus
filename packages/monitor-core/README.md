# NEXUS Monitor Core — real initial implementation

**Stage: tested read-only primitives; no live connector configured, no API/UI, no DB and no backup execution.**

`src/backup-health.mjs` computes backup integrity/recency, offsite, DB+files coverage, isolated restore proof and explicit UNKNOWN/CRITICAL/WARNING/HEALTHY. It cannot perform restores. Always returns `safe_to_restore_production:false`.

`src/observations.mjs` strictly normalizes external operational metadata, discards extra fields (e.g. secrets or personal data), scopes every app/environment, detects stale data and deduplicates latest observations.

`src/providers.mjs` implements fixed-host, **read-only** GitHub repo metadata and Railway project metadata fetchers. Both take tokens only as function arguments (from a later secrets vault), restrict request targets and return allowlisted fields. There is no live polling/connection, persistence or user-facing API; Railway GraphQL query needs real dedicated-token staging verification before production integration. These helpers must be invoked by a separately authenticated policy-bound service, not publicly exposed as-is.

## Run
```bash
cd packages/monitor-core
npm test
npm run check
```
Node.js 22 or newer; no external runtime dependencies.

## Security
A mock-fetched provider status is a **unit test** and is not evidence of any real external service or backup success. No product secrets or private data should be committed. Do not start provider polling until secure credential vault/OIDC/app-env authorization and audit are implemented.
