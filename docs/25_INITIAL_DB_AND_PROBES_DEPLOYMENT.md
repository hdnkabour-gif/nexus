# 25 — First persistent DB + public reachability deployment evidence

**Observed 2026-11-17 in connected GitHub and Railway.** This document describes the exact verified scope; it does **not** claim complete live portfolio intelligence, restored backups or authenticated user acceptance.

## Infrastructure
Project: NEXUS Control Center, Railway project `f22f044b-d7a4-40f5-9929-2091f352e43c`, production environment `c88d54df-c322-4ace-85c5-c11a1b5b9c10`.
- `nexus-web` service `4b9c3918-49fd-4d92-b33b-213c172b2fb1`, source `hdnkabour-gif/nexus:main`. Public URL: https://nexus-control-center.up.railway.app/login.
- `Postgres` service `376a479e-dc4e-4606-8040-123405fa366e`, PostgreSQL 18, private network. **Independent of all product databases**.
- `nexus-public-probes` service `ab495671-fec1-4c58-b221-dedfefa58b1a`, source `hdnkabour-gif/nexus:main`, cron `*/15 * * * *`, no public domain. Configured to run `npm run probe:public` using only private NEXUS_DATABASE_URL.

## Verified facts
1. PR #7 merged at `86c25efc9d80503a9467b52b60f709cdff2d6d34`, GitHub CI all green including temporary PostgreSQL 18 schema migration, owner enrollment/login/rotation integration tests and production Next.js build.
2. Railway `nexus-web` deployment `0e0c2bd7-9e78-4013-9b52-89c1dcf08601` became SUCCESS; logs explicitly printed `NEXUS metadata schema applied (idempotent).` and Next.js ready. Healthcheck route `/api/ready` configured.
3. Railway has `NEXUS_DATABASE_URL` (reference to PostgreSQL) and existing bootstrap credentials; values not copied here. A temporary owner credential is rotated through protected first-login `/owner/setup` into the database. **Actual browser login remains UNTESTED by owner**.
4. PR #8 merged at `8dab1d62bfeb51f2a72aecd8229aabebc421da78`; GitHub contract, monitor and Next build/PostgreSQL-integration workflows all passed on PR. New UI `/console/observability` includes read-only public HTTP check cards.
5. Railway `nexus-web` deployment `058fa0bd-89bd-4c3f-bc97-f52b110b5eb9` for #8 became SUCCESS, service status online. Cron service built successfully and reported `cronReady` after its first deployment (service did not report issues).
6. **First scheduled run confirmed:** Railway environment status reported `cronSucceeded`, `lastExecutionStatus=succeeded`, `lastExecutionAt=2026-11-17T18:46:19.358Z`. The cron deployment `15d12102-ac7f-4003-b6ad-109371f64e61` log explicitly printed `NEXUS HTTP public probes completed. Saved 7 of 7 observations.` This proves seven observations were successfully written by the task. Individual target outcomes (reachable/HTTP error/unknown) are not asserted here; obtain them from authenticated NEXUS API. Other app-integrity and backup health remain unknown.

## Seven permitted public probes
- pneu-mouhim / mouhim / pneumatiques-mouhim-mouhim.up.railway.app
- rent-car / production / jmr-luxe-car.up.railway.app
- alloservix / production / alloservix-web-production.up.railway.app
- nexora / demo / nexora-web-demo-demo.up.railway.app
- rent-car / staging / fleetora-ocr-app-staging.up.railway.app
- amanzine / amanzine / amanzine.up.railway.app
- amanzine / staging / triumphant-courage-staging.up.railway.app

**HTTP GET response is not a business health check.** It cannot prove authenticity of invoices, stock counts, backup integrity, restore ability, worker jobs, payments, patient confidentiality or production safety. Do not expose Tech Platform employer-owned systems without authorization.

## Additional costs / restrictions
A PostgreSQL service and cron worker add Railway resource charges. The NEXUS database itself must also have verified offsite backups and isolated restore drills before NEXUS is considered recoverable.

## Pending before production-sensitive features
- Owner manually signs in, changes password and confirms desktop/mobile navigation and login/logout.
- MFA/OIDC, durable role-permission boundaries, distributed login rate limiting and access review.
- GitHub App and Railway dedicated scoped credential connection and real deployment/CI monitoring.
- PNEU MOUHIM source-owned adapter + business integrity/backup evidence; similarly other apps.
- NEXUS metadata DB offsite backup + restoration proof.
- App-specific independent backup/restore drills, no production cutovers.
- Provider-specific AI assistant with explicit opt-in and redacted evidence.

All missing items remain open and must not be represented as completed.
