# 20 — First functioning NEXUS control console

**Initial web MVP, date 2026-11-17.** This is deliberately not a production-ready control plane.

## Implemented
- Next.js 16.4.6 / React 19 / Node.js 22.
- Arabic RTL responsive command-center UI, private login, 9 console pages:
  dashboard, app registry, app 360, topology preview, observability, backups, diagnostics, integrations, security, settings.
- Admin bootstrap by Railway-provided environment values (no default credentials, no secrets committed).
- Session HMAC SHA-256 cookies, HttpOnly/SameSite/Secure in production, eight-hour expiry; login origin verification and preliminary per-process login rate limiting (not distributed).
- Auth-protected portfolio metadata API and per-app read-only GitHub/Railway metadata connectivity check, only when independent dedicated provider credentials are configured.
- Public health endpoint returns only process state (NOT product health), no public inventory.
- Full six-app dated source/provider snapshot; dashboard is **NOT live data** while provider credentials and product adapters absent.
- No direct write endpoints to source products; no production restore capability.

## Route map
Public `/login`, `/api/health`. Auth-only `/console`, `/console/apps`, `/console/apps/[id]`, `/console/topology`, `/console/observability`, `/console/backups`, `/console/diagnostics`, `/console/integrations`, `/console/security`, `/console/settings`, `/api/v1/portfolio`, `/api/v1/check?app=<registered-app-id>`.
Actions: POST `/api/auth/login` and `/api/auth/logout`, origin-checked.

## Required env variables
- `NEXUS_ADMIN_EMAIL`: first owner account.
- `NEXUS_ADMIN_PASSWORD_HASH`: `scrypt$<32-hex-salt>$<128-hex-hash>`. Generate with Node.js scrypt securely, never commit plaintext/password hash into GitHub.
- `NEXUS_SESSION_SECRET`: cryptographically random 32+ character secret, not shared across apps.
- `NEXUS_GITHUB_READ_TOKEN` (optional; server only): dedicated least-privilege GitHub read token for approved private repos.
- `NEXUS_RAILWAY_READ_TOKEN` (optional; server only): dedicated scoped Railway API token. Confirm provider GraphQL permissions/staging.
- `PORT` managed by Railway.
No shared admin login defaults; no hardcoded keys.

## Deploy
Deploy private repo `hdnkabour-gif/nexus` main branch to **new dedicated Railway project NEXUS** (never piggyback on another product's Postgres/environment). Set login variables before exposing a domain. Use Railway's Next.js build detection, run Node.js 22. For additional services/DB use separate environment and least-privilege credentials later.

## Validation
CI tests auth HMAC, credential checks, unsafe origin rejection, monitor-core, Next production build. Smoke after deployment: public `/login`; unauth `/console` redirects login; unauth `/api/v1/portfolio` 401; `/api/health` returns process state only; authenticated UI + navigation + per-app details; no raw secrets in response.

## Important limitations
This bootstrap is a **single-owner preview**: no OIDC/MFA, no central Postgres DB, no distributed rate limiting, no persistent audit/incident store, no server-side scheduled collectors, no real backup verification or restore tool. **Keep action gateway and product agents disabled** until independent security review and signed capability policies. Replace bootstrap auth with hardened MFA/OIDC before expanding user access or sensitive production operations. Do not expose provider tokens to browser.

## First Railway deployment verified
Refer to [21_FIRST_DEPLOYMENT_EVIDENCE.md](21_FIRST_DEPLOYMENT_EVIDENCE.md). Dedicated NEXUS service runs Next.js and a protected login endpoint at https://nexus-control-center.up.railway.app/login. This does **not** establish live GitHub/Railway provider connections or product backup safety.
