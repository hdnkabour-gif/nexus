# 26 — NEXUS Command OS v1 — Implemented UI blueprint
Updated: 2026-11-18. Design implementation branch: feat/command-os-v1-real-dashboard.

## UI principles
- **Operational, not promotional**: a command surface instead of a large marketing hero.
- Data-first and evidence-first. The UI differentiates snapshot, recent HTTP observation, unknown, stale and HTTP error. It **never equates reachable endpoints with application integrity**.
- Legible Arabic RTL and technical Latin labels with deliberate monospaced metadata. High contrast, keyboard access, explicit focus rings, reduced-motion support.
- Calm charcoal surfaces, slender aqua highlights reserved for navigation/status and highlighted data, no artificial green alarms.
- No separate application and no copy of product data. All existing auth, signed CSRF owner forms, NEXUS-only PostgreSQL, HTTP probe cron, API routes and private app databases remain unchanged.

## Files and implementation contract
- `app/command-os.css`: implementation CSS loaded after existing `app/globals.css`, scoped primarily to `.os-shell`. Login/setup UI stays on tested baseline.
- `components/command-os/command-shell.jsx`: top command bar, collapsible rail (mobile menu), read-only system strip, new main workspace, 5-button mobile bottom navigation, the original valid logout CSRF token passed from server to form.
- `components/command-os/command-palette.jsx`: local list search with keyboard Ctrl/⌘K / Escape / Enter, aria dialog; matches real pages and the six discovered app names. **Not a live indexed search of private code or customer content**.
- `components/command-os/signal-card.jsx`: small data/status unit, without invented activity.
- `components/command-os/app-explorer.jsx`: app text filter and coverage filters; no mutation of underlying app data.
- `lib/command-os.js`: pure grouping/recency/coverage; 20-minute expiration, errors attributed by application and environment, no false health.
- `app/console/layout.jsx`: retains getSession, enforced password setup and signed logout CSRF; renders new shell.
- `app/console/page.jsx`: operational overview with four KPIs from snapshot and current stored HTTP signals, knowledge lattice, evidence gaps, application matrix and recent measurements.
- `app/console/apps/page.jsx`: dynamic application catalog, fresh HTTP readouts clearly separated from historical source metadata.
- `app/console/incidents/page.jsx`: honest not-connected empty state; no fake incidents.
- `app/console/ai/page.jsx`: honest not-connected AI state; no claims that OpenAI or Claude is operating.

## Existing routes preserved
`/login`, `/owner/setup`, `/console`, `/console/apps`, `/console/apps/[id]`, `/console/topology`, `/console/observability`, `/console/backups`, `/console/diagnostics`, `/console/integrations`, `/console/security`, `/console/settings`.
Additional read-only routes: `/console/incidents`, `/console/ai`.

## Operational states
- Historical registry is labeled `SNAPSHOT` with source-observed date. The repository SHA is not asserted to equal a deployed SHA.
- Last HTTP observations are from `latestHttpChecks()` stored in isolated NEXUS PostgreSQL. Measurements > 20 minutes, missing target evidence, and failed database calls result in non-healthy/unknown state.
- HTTP 5xx -> HTTP error; 2xx/3xx/4xx -> response recorded, not proof of healthy business operations; DNS/timeout -> unknown.
- Backup verification remains unproven; restore controls remain absent/locked.
- Tech Platform is not given HTTP monitoring without employer authorization.

## Acceptance
1. Review PR diff and run CI (isolated Postgres migrations/tests + Next production build, monitor-core safety and contracts).
2. Confirm runtime deployment main SHA equals tested merge commit, Railway healthcheck `/api/ready` succeeds; services remain Online and CronReady/succeeded.
3. Owner manually validates mobile header, bottom nav, side menu, Ctrl/⌘ K dialog, catalog search, app 360, monitoring, and password changes — browser UI has not been personally exercised by automation.
4. App runtime data failures remain visibly unknown and never silently green.
5. No source apps/services or their databases are changed.

## Planned later work (do not mislabel as complete)
True connectors & credentials; rich provider-deployment/CI data, incident ingestion and operations, verified backup drills, code relationship graph, real AI chat and incident copilot, expanded App 360 cross-tab views, production MFA.
