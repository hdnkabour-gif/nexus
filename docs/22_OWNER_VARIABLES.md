# 22 — NEXUS owner Railway Variables and password rotation

Updated: 2026-11-17. **Single-owner preview only; no OIDC/MFA yet.** All variable values must stay in the Railway service; the repository contains only non-secret examples.

## Service
Project NEXUS Control Center; environment production; service nexus-web.
Dashboard: https://railway.com/project/f22f044b-d7a4-40f5-9929-2091f352e43c

## Variables used by application
| Variable name | Purpose | Current change |
|---|---|---|
| `NEXUS_ADMIN_NAME` | Owner display name in protected header; accepts Arabic/French text | newly added; example NEXUS Owner |
| `NEXUS_ADMIN_USERNAME` | Login alias, e.g. owner; 3–32 chars, Latin lowercase letters, digits, . _ -; must start with a letter | newly added |
| `NEXUS_ADMIN_EMAIL` | Owner account identity; login with email still supported | already exists; preserve user value |
| `NEXUS_ADMIN_PASSWORD_HASH` | Salted scrypt hash of owner password; **not plaintext** | already exists; preserve until owner rotates |
| `NEXUS_SESSION_SECRET` | HMAC signing key; keep unchanged when only changing password | already exists; preserve |
| `NODE_ENV` | Production environment | existing |
| `NEXT_TELEMETRY_DISABLED` | Disable framework telemetry | existing |
| `NEXUS_GITHUB_READ_TOKEN` | Future dedicated read-only GitHub credential | not configured; do not add fake token |
| `NEXUS_RAILWAY_READ_TOKEN` | Future dedicated Railway read-only credential | not configured; do not add fake token |

Do not add `NEXUS_ADMIN_PASSWORD` in plaintext. A plain password in environment configuration can be exposed through access, deployment traces and tooling. Existing code only accepts a salted, strongly hashed password; changing the hash in Railway takes effect on the next deployment.

## Change password safely
1. Open a local terminal in the NEXUS source repository with Node.js 22 installed.
2. Run `npm run owner:hash`. Type a **new** 16+ character password twice. Input is hidden. The script prints ONLY the salted `scrypt$` hash.
3. Railway -> NEXUS Control Center -> nexus-web -> Variables -> edit `NEXUS_ADMIN_PASSWORD_HASH` with the new generated string. Ensure Railway deployment is completed.
4. Visit https://nexus-control-center.up.railway.app/login and sign in with either `NEXUS_ADMIN_USERNAME` or `NEXUS_ADMIN_EMAIL`, plus the **plaintext password you typed locally** (not the hash).
5. Confirm unsuccessful attempts and your new login. Previous password stops working once the hash is changed. Avoid posting either plaintext or hash in chat, GitHub, issues or screenshots.

Changing the owner email will expire existing sessions because the session subject is pinned to `NEXUS_ADMIN_EMAIL`. Changing username or display name does not change the email-based session identity. Changing password hash does **not** automatically revoke already issued signed 8-hour session cookies; until full server-side session tracking exists, rotate `NEXUS_SESSION_SECRET` only if you need to invalidate all current sessions, accepting that this logs everyone out.

## Operational safeguards
- Temporary preview: no MFA, only one owner account, per-instance login rate limit, no durable audit/identity provider. Restrict users to the owner and do not activate destructive app commands.
- These updates must not modify other application/DB variables or provider credentials.
- After a Railway variable change, verify deployment status and first login manually; GitHub CI unit tests cannot validate the owner's actual new secret.
