# 19 — Discovered application/repository/Railway inventory

> **Historical snapshot (2026-11-17), kept unchanged.** Current state as of 2026-11-20 — 9 apps incl. TIJARA OS and SCANFLOW PRO, updated SHAs, deployed SHAs and the resolved AMANZINE/Tech-Platform service mapping — is in [27_PORTFOLIO_BASELINE_V1.md](27_PORTFOLIO_BASELINE_V1.md) and `registry/portfolio-baseline.v1.json`.

**Observed 2026-11-17 through user-authorized connected GitHub and Railway tools.** These observations are documented snapshots, not real-time NEXUS signals and not evidence that a NEXUS agent or API is connected. Verified SHA means GitHub's `main` ref was read at this time; it does not mean the same SHA is deployed.

Machine-readable record: [registry/portfolio-discovery.v1.json](../registry/portfolio-discovery.v1.json)

| Application | GitHub source (main SHA prefix) | Railway project(s) | Known concern |
|---|---|---|---|
| PNEU MOUHIM | `hdnkabour-gif/Pneumatiques-MOUHIM` (`181095a7`) | lucid-playfulness; PNEU MOUHIM - STAGING | main Railway project shared with RENT CAR; staging has separate app+worker+PG |
| RENT CAR / Fleetora | `hdnkabour-gif/rent-car-app` (`1e934d36`) | lucid-playfulness; Fleetora OCR Staging | mapping of env/services to product must be approved |
| AMANZINE | `hdnkabour-gif/amanzine2` (`4ff08a99`) | spectacular-victory | extra `hdnkabour-gif/AMANZINE` repo requires classification; Railway multi-env |
| ALLOSERVIX | `hdnkabour-gif/Alloservix` (`188b928d`) | ALLOSERVIX Website | status/readiness not verified |
| NEXORA | `hdnkabour-gif/Nexora` (`aed95a38`) | NEXORA Demo | clinical data entirely outside NEXUS |
| 2M TECH PLATFORM | `hdnkabour-gif/Tech-Platform-` (`924aa502`) | overflowing-vision | employer authorization and network boundaries required |

**Additional Railway service list observed** (not proof of mapping):
- PNEU MOUHIM - STAGING: MOUHIM-Staging-Worker, MOUHIM-Staging-App, Postgres.
- lucid-playfulness: PNEU-MOUHIM-Worker, Postgres-ekYj, Pneumatiques-MOUHIM, Postgres, rent-car-app.
- Fleetora OCR Staging: fleetora-ocr-app, Postgres.
- NEXORA Demo: nexora-web-demo.
- ALLOSERVIX Website: alloservix-web.
- overflowing-vision: Postgres, Tech-Platform-.
- spectacular-victory: Postgres-E8M4, amanzine-staging, Postgres-rqCO, amanzine2, balanced-growth, Postgres, AMANZINE.

## Current confidence
- CONFIRMED: repository names and main ref SHA observed; Railway project/service names observed by listing.
- PARTIAL: exact service ↔ app ↔ environment mapping for projects shared across products.
- UNKNOWN: live connector permissions, active deployment HEAD, backup existence, offsite restore success, app runtime health, internal route/schema truth.
- NOT CONNECTED: all NEXUS source adapters, model APIs, backup execution and action handlers.

## Before live onboarding
Approve app ownership; select which repository is canonical; bind services to correct app/environment IDs (especially multi-tenant/multi-app Railway project); decide dev/staging/pilot/production separation; grant read-only GitHub App/Railway integration; verify static code inventory, runbook and backup tests. Security/privacy review for medical data and employer-owned systems.
