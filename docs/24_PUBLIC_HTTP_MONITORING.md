# 24 — First live, read-only public HTTP monitoring

Date 2026-11-17. Design and implementation subject to CI and Railway acceptance. No product business records are fetched.

## Scope / evidence
Allowlisted public Railway service domains directly verified through user's authorized Railway account (2026-11-17):
- PNEU MOUHIM: pneumatiques-mouhim-mouhim.up.railway.app
- Rent Car: jmr-luxe-car.up.railway.app
- ALLOSERVIX: alloservix-web-production.up.railway.app
- NEXORA (demo only): nexora-web-demo-demo.up.railway.app
- Fleetora OCR staging: fleetora-ocr-app-staging.up.railway.app
- AMANZINE application environment: amanzine.up.railway.app (Railway service balanced-growth, source hdnkabour-gif/amanzine2)
- AMANZINE staging: triumphant-courage-staging.up.railway.app (Railway service amanzine-staging, source hdnkabour-gif/amanzine2)

**Important naming anomaly:** the service named AMANZINE in another Railway production environment reports GitHub source hdnkabour-gif/Tech-Platform-; do not assume it belongs to the commerce app. Confirm service source and environment, not its display name.

The first examined AMANZINE-labeled service had an unrelated source repo; use only the two additional verified commerce service domains above. Employer-owned TECH PLATFORM remains unmonitored pending explicit permission.

## What a probe proves
HTTPS GET to a **fixed**, preapproved host and path '/', redirect manual, 8s timeout; no response body parsed, no cookies or secrets. Record HTTP response status, duration and timestamp in NEXUS PostgreSQL.

HTTP 2xx/3xx/4xx -> reachable network endpoint (even if login required), HTTP 5xx -> HTTP error, network/TLS/timeout -> unknown. **No response guarantees application health, tenant isolation, transactions, payment, stock, document files, backup, or runtime business integrity**.

## User workflows
- Authenticated GET /api/v1/http-checks shows persisted latest status and staleness (>20 minutes).
- Authenticated origin-validated POST /api/v1/http-checks triggers bounded read-only checks; requests within 45 seconds reuse recent results.
- /console/observability offers a refresh button and clearly separates public reachability from deeper provider/source signals.
- Optional Railway Cron service `nexus-public-probes` runs `node scripts/public-probe.mjs` every 15 minutes with only NEXUS_DATABASE_URL; no source product secrets.

## Security and operations
- Never accept user-controlled URL, protocol, host or path; target registry fixed in Git commit and requires reviewed PR.
- Fixed redirect manual, 8s timeout, bounded response metadata and no body parsing.
- NEXUS database stores operational status only; privacy classifier excludes visitor/customer data.
- The scheduler is separate from web; failure does not affect source application workflows.
- A 15-minute cron is not high-frequency application monitoring; deeper, continuous metrics still require private provider tokens/adapters.
- Test with mocks and isolated PostgreSQL 18 before deploy.
