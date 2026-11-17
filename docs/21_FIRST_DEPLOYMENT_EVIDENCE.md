# 21 — Initial Railway deployment evidence

**Observation date: 2026-11-17.** Scope: initial owner-only web console. This report records what was directly observed, without claiming broader proof.

## Source identity and approvals
- Repository: `hdnkabour-gif/nexus` (private), default branch `main`.
- PR #3: https://github.com/hdnkabour-gif/nexus/pull/3 — merged.
- Deployed commit SHA: `49662155bdf288dc8cb788661e9bd16f0736d8ce`.
- Three GitHub workflows passed for merged main commit: `Monitor core unit and safety checks`, `NEXUS first console build and auth safety`, `Contract and architecture checks`.
- No source applications' code, users, invoices, files, live DBs or backup configurations were altered.

## Independent Railway environment
- Project: **NEXUS Control Center** (`f22f044b-d7a4-40f5-9929-2091f352e43c`)
- Environment: `production` (`c88d54df-c322-4ace-85c5-c11a1b5b9c10`)
- Service: `nexus-web` (`4b9c3918-49fd-4d92-b33b-213c172b2fb1`)
- GitHub source: `hdnkabour-gif/nexus`, tracking `main`.
- Deployment: `5473f48a-810e-48cc-a485-7946a3f48671`; Railway reported `SUCCESS`.
- URL: https://nexus-control-center.up.railway.app/login
- Application listening on Railway-provided `PORT=8080`; domain targetPort changed from 3000 to **8080** to match actual runtime.
- Runtime log included `Next.js 16.4.6` and `Ready in 106ms`.

## Runtime HTTP verification
The available connected Railway tool sends POST sample webhooks; it does **not** perform GET+browser login. We tested the routing using it:
- POST `/api/health` -> **405 Method Not Allowed**, expected for GET-only process health route, confirms routing reached Next.js.
- POST `/api/auth/logout` without matching Origin -> **403 Forbidden**, expected origin/CSRF protection.
- POST `/api/v1/portfolio` -> **405 Method Not Allowed**, expected GET-only API.
- Railway HTTP logs independently showed the same method/path/status triples.
- Service deploy logs show server startup without error.

**Not yet independently verified:** browser GET `/login`, authenticated POST login, full console rendering, console navigation on desktop/mobile, authentic session login/logout and GET API 401 for unauthenticated calls. A user acceptance pass is required. The web crawler cannot fetch `*.up.railway.app` in this execution environment, including known older app domains; this is a tool-access limitation, not proof of site outage.

## Security/configuration
Railway service variable **names** inspected (values not saved in GitHub): `NODE_ENV`, `NEXT_TELEMETRY_DISABLED`, `NEXUS_ADMIN_EMAIL`, `NEXUS_ADMIN_PASSWORD_HASH`, `NEXUS_SESSION_SECRET`. One strong generated temporary owner credential was configured via service variables. Credential values intentionally omitted. Rotate initial password as part of owner acceptance.
- `NEXUS_GITHUB_READ_TOKEN`: not configured; private GitHub live probing unavailable.
- `NEXUS_RAILWAY_READ_TOKEN`: not configured; live Railway metadata polling unavailable.
- No app-side adapters, Redis/PostgreSQL NEXUS DB, OAuth/MFA, persistent audit, scheduled checks, offsite restore or AI inference enabled.
- Exposing admin dashboard to multiple operators is explicitly out of scope until MFA/OIDC, durable sessions and rate limiting are implemented.

## Next acceptance/priority
1. Owner opens live login and checks Arabic RTL screen, console metrics and app details on desktop/mobile; report any blank/error pages/screenshots.
2. Rotate bootstrap password safely in Railway variables; do not send it via user-facing comments/issues.
3. Register dedicated least-privilege GitHub App/token and Railway project-scoped read token; test credentials with restricted provider checks.
4. Deploy NEXUS Postgres metadata + audit and auth guard, then build signed readonly PNEU MOUHIM adapter in a separate reviewed PR.
5. Only after these gates: real backup verification, isolated restore drill and app-specific diagnostics; no automatic production restore.
