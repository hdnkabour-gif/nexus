# 23 — NEXUS PostgreSQL and first-login password enrollment

Date 2026-11-17. Status: implementation and test gate in PR; separate database provisioning is required before representing this as deployed.

## Architecture
- NEXUS-only dedicated Railway PostgreSQL 18 service, inside NEXUS project. NEXUS has **no direct database credential** for any business application.
- Set web service variable `NEXUS_DATABASE_URL=${{Postgres.DATABASE_URL}}` (use actual database service name).
- Apply `npm run db:migrate` before deployment. The migration is idempotent and serializes through an advisory lock.
- Persistent metadata tables: `nexus_owner_credentials`, `nexus_sessions`, `nexus_audit`, `nexus_observations`, `nexus_connections`, `nexus_job_receipts`.
- Sessions stored as SHA-256 digest of 32-byte random token. The cookie itself is HttpOnly/Secure/SameSite. Passwords stored only as salted scrypt hash.
- Password change increments credential version and invalidates all other sessions without exposing a new secret in GitHub or Railway. No plaintext password storage.
- If DB is configured and unavailable, owner session validation fails closed; do not silently fall back to old stateless cookie access.

## First owner login (no manual hash generation)
- The current environment's bootstrap email or username and password are accepted **only until** an owner credential is created in NEXUS DB.
- On first successful bootstrap login, open `/owner/setup`, **not** the console. Enter a strong new password (minimum 16 characters) twice.
- This stores new salt+hash in database, binds existing session and invalidates any other pending setup sessions.
- Subsequent logins accept the Railway username or email with the **new database password**. The old bootstrap environment password is ignored after enrollment.
- In console Settings, change the password again by entering old+new password; all other sessions are invalidated by version.
- Onboarding uses a 2h first-session expiry; normal sessions 8h.
- This is a single-owner bootstrap, not MFA/OIDC; do not enable production mutation capabilities. A lost post-enrollment password requires a separate audited recovery procedure, not an automatic fallback to environment credentials.

## Reverse-proxy login correction
- On Railway, configure `NEXUS_PUBLIC_ORIGIN=https://nexus-control-center.up.railway.app`. Login form POST origins are validated against this trusted configured canonical origin, rather than unreliable forwarded host headers.
- Login and bootstrap redirects use the canonical public HTTPS origin. Invalid origin / request blocked / throttled attempts show actionable messages, not a silent redirect loop.
- The admin must wait 15 minutes after repeated failed attempts or restart/redeploy to reset the initial in-memory attempt counter. Do not hammer the login button.
- Integration tests simulate a valid public Origin with a different internal `x-forwarded-host`, and assert successful bootstrap cookie+redirect and database session.

## Mobile-browser form protection correction (2026-11-17)
The strict `Origin` equality check rejected legitimate Android browser posts (reported with `error=origin` in production HTTP records). The replacement uses a cryptographically random HttpOnly SameSite=Lax cookie and short-lived HMAC-SHA256 signed form token bound to the cookie and its action scope. Server-side anti-CSRF verification rejects cross-site fetch-metadata requests even with a valid token, and rejects missing or mismatched cookie/token. `GET /api/auth/prepare` issues the cookie then redirects to an allowlisted local page, and does not grant authentication. Sign-in, first owner setup, password change and logout all use signed tokens. Origin may be absent, stripped or opaque without reducing the CSRF requirement.

No owner credentials, database or app data are reset. Tested with missing Origin, hostile cross-site, expired tokens, missing nonce and session persistence. **Actual Chrome Android authentication is still pending a user test after Railway deployment.**

## Security cautions
- Never publish bootstrap password or owner hash in GitHub/issues/logs. Rotate any temporary bootstrap secret promptly.
- Audit currently stores sanitized event *kind/result only* (no passwords or emails). Production authorization/RBAC+ABAC and comprehensive audit remain future work.
- More than one owner, multi-tenant isolation, SSO, phishing-resistant MFA, distributed rate-limits and token vault still require separate security review.
- Provider credentials stored through `nexus_connections` must be encrypted before enabling live integrations; merely having a DB table does not authorize writing secrets there.

## Tests
- GitHub Actions uses isolated PostgreSQL 18 service and runs migrations before Node integration tests.
- Tests verify scrypt hashing, bootstrap enforced, second bootstrap invalidated, versioned revocation, incorrect password rejected, audit event creation.
- A successful CI test is not proof that browser login was exercised in Railway production.

## Railway rollout checklist
- [x] CI passed tests/build on code SHA 86c25efc9d80503a9467b52b60f709cdff2d6d34.
- [x] Deployed independent PostgreSQL 18 inside NEXUS project (new service may incur Railway charges).
- [x] Set `NEXUS_DATABASE_URL` to private network reference (never paste raw URL in GitHub).
- [x] Migrations ran in predeploy and printed schema applied; web service online with readiness healthcheck.
- [ ] Owner browser login/first-password enrollment not yet verified.
- [ ] Do not expose incident/action or product data until MFA and scoped policies are implemented.
