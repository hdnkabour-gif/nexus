# 31 — Evidence Index (Portfolio Baseline V1)

Every claim in docs 27–30 traces to one of these references. **All observed on 2026-11-20 (UTC)** unless another date is stated. Re-verify before reuse: entries go stale as soon as a repo or deployment changes.

## E1 — Repository HEADs (git clone of default branch)
| Repo | Branch | HEAD SHA | Commit time | Visibility |
|---|---|---|---|---|
| hdnkabour-gif/nexus | main | `bc8e6d1393748b2e47cee34cd6ab69d5bb06dac3` | 2026-11-18T17:29:25Z | private |
| hdnkabour-gif/tijara-os | main | `e5e2b26d33be67b992e955824cfbf2bf0c100a28` | 2026-11-20T02:11:51Z | private |
| hdnkabour-gif/Alloservix | main | `781c982f2b69d56af364cda8466998e6c20ef182` | 2026-11-20T01:31:03Z | private |
| hdnkabour-gif/rent-car-app | main | `781ab81386c36eb17af5a55119e6f86909603f81` | 2026-11-20T01:28:17Z | private |
| hdnkabour-gif/Pneumatiques-MOUHIM | main | `ea55329fa3cf77ee5f4343ed627b1e8b9aa187a2` | 2026-11-17T15:53:34Z | private |
| hdnkabour-gif/Nexora | main | `aed95a384acd102cbb0e8d52dc70b8a9c47068a2` | 2026-11-15T14:36:57Z | private |
| hdnkabour-gif/Tech-Platform- | main | `924aa502d9b60dbee3114dbb16100290c10dfb1b` | 2026-09-27T10:47:49Z | private |
| hdnkabour-gif/amanzine2 | main | `4ff08a99d4949a8d543ea8a41528da0331e8dbfb` | 2026-11-16T21:17:28Z | public |
| hdnkabour-gif/AMANZINE | main | `ecd4f5ce1288bb6d465fc74aa496c7e99437238f` | 2026-07-21T18:55:43Z | public |
| abdellatifhadana-byte/Scanflowpro | main | `5ad13e25736ba8c48ac3acbbddb7eb9ec4351199` | 2026-10-30T14:22:33Z | public |
| abdellatifhadana-byte/scan-Flow-pro | main | `69b39b242e90ebd1b6f3f735183738ab98378b7a` | 2025-11-27T07:54:38Z | public |
| abdellatifhadana-byte/AMANZINE | main | `16bf7220f748f05335707f16a74dac543680b834` | 2026-07-08T13:15:39Z | public |
| abdellatifhadana-byte/SAHARSHOP2026 | main | `0911b248b5e1f381362226375d7c12a6603c2caf` | 2026-07-08T12:39:53Z | public |
| abdellatifhadana-byte/sahar-shop2026 | main | `a183e418d372fd788893b6a08b1166b2a2585317` | 2026-06-08T18:55:11Z | public |
| abdellatifhadana-byte/sahar-shop | main | `96dc14ee868b7f5976023117adf723192598ed57` | 2026-05-23T19:25:02Z | public |
| abdellatifhadana-byte/saharshop2025 | main | `3c3ccc858218597687239f216282a26106e839c9` | 2026-05-23T20:01:07Z | public |
| abdellatifhadana-byte/SAHARSHOP | main | `95afcc04ad6b99b65f7762fd107a811eba7589e5` | 2026-05-23T17:42:13Z | public |
| abdellatifhadana-byte/sahar2026 | main | `3c6e411252afaa657a7648d3709a9b39dbf9095a` | 2026-10-30T13:32:59Z | public |
| abdellatifhadana-byte/tech | — | empty repository | — | public |

Similarity method (docs/27 AMANZINE table, R-001): `git ls-files -s` path+blob-hash sets compared with `comm`; "identical" = same path and same blob SHA.

## E2 — Railway (read-only GraphQL queries; no mutation sent; no variable values read)
| Project | Env | Service | Source | Deployed SHA | Branch | Status / time |
|---|---|---|---|---|---|---|
| NEXUS Control Center | production | nexus-web | nexus | `bc8e6d13` | main | SUCCESS 2026-11-18T17:29 |
| NEXUS Control Center | production | nexus-public-probes (cron `*/15`) | nexus | `bc8e6d13` | main | SUCCESS 2026-11-18T17:29 |
| tijara-os-staging | staging | tijara-os | tijara-os | `e5e2b26d` | main | SUCCESS 2026-11-20T02:11 |
| tijara-os-staging | staging | tijara-migrate | tijara-os | `e5e2b26d` | main | SUCCESS 2026-11-20T02:21 |
| ALLOSERVIX Website | production | alloservix-web | Alloservix | `781c982f` | main | SUCCESS 2026-11-20T01:31 |
| lucid-playfulness | production | rent-car-app | rent-car-app | `781ab813` | main | SUCCESS 2026-11-20T01:29 |
| Fleetora OCR Staging | staging | fleetora-ocr-app | rent-car-app | `3a2b28b4` | feat/jmr-raster-brand-20261119 | SUCCESS 2026-11-19T14:09 |
| lucid-playfulness | `mouhim ` | Pneumatiques-MOUHIM | Pneumatiques-MOUHIM | `ea55329f` | main | SUCCESS 2026-11-17T15:53 |
| lucid-playfulness | `mouhim ` | PNEU-MOUHIM-Worker | Pneumatiques-MOUHIM | `ea55329f` | main | SUCCESS 2026-11-17T15:53 |
| PNEU MOUHIM - STAGING | staging | MOUHIM-Staging-App | Pneumatiques-MOUHIM | `a2691d7d` | fix/go-live-complete-strict-audit | SUCCESS 2026-11-17T15:46 |
| PNEU MOUHIM - STAGING | staging | MOUHIM-Staging-Worker | Pneumatiques-MOUHIM | `6a811897` | staging/integration | SUCCESS 2026-11-17T12:10 |
| NEXORA Demo | demo | nexora-web-demo | Nexora | `aed95a38` | main | SUCCESS 2026-11-15T14:37 |
| spectacular-victory | Amanzine | balanced-growth | amanzine2 | `4ff08a99` | main | SUCCESS 2026-11-18T00:37 |
| spectacular-victory | staging | amanzine-staging | amanzine2 | `4ff08a99` | main | SUCCESS 2026-11-16T21:56 |
| spectacular-victory | production | AMANZINE | **Tech-Platform-** | `924aa502` | main | SUCCESS 2026-11-15T15:24 |
| spectacular-victory | TECH PLATFORM | amanzine2 | **Tech-Platform-** | `924aa502` | main | SUCCESS 2026-10-31T21:03 |
| overflowing-vision | production | Tech-Platform- | Tech-Platform- | `04e70ae8` | preview/pilote-technique-ui | SUCCESS 2026-10-31T20:17 |

Ancestry (GitHub compare `main...<sha>`): `a2691d7d` behind 1, `6a811897` behind 6 (PNEU); `3a2b28b4` behind 3 (RENT CAR); `04e70ae8` behind 164 (TECH); all ahead 0.
Backups: `volumeInstanceBackupList` and `volumeInstanceBackupScheduleList` returned empty lists for all 17 volume instances (incl. orphan `/tmp` volume in spectacular-victory). Environment `Tech 2m viewer` has 0 services.

## E3 — GitHub Actions (latest `main` runs)
| Repo | Run ID | Workflow | SHA | Conclusion |
|---|---|---|---|---|
| tijara-os | 44659052532 | ci | `e5e2b26d` | success |
| Alloservix | 44654188238 / 44654187998 | Alloservix checks / Railway production smoke | `781c982f` | success |
| rent-car-app | 44653856509 | CI | `781ab813` | success |
| nexus | 44359246728 / …977 / …791 | console build+auth / monitor core / contracts | `bc8e6d13` | success |
| Pneumatiques-MOUHIM | 44119512301 | tests | `ea55329f` | success |
| Nexora | 43725326675 | Foundation checks | `aed95a38` | success |
| Tech-Platform- | 36313684531 / 36313684542 | Vérification 2M TECH / Phase 24 | `924aa502` | success (2026-09-27) |
| amanzine2, abdellatifhadana-byte/* | — | — | — | UNKNOWN (no API access) |

Historical CI cited from NEXUS issue #5 (2026-11-18 comment): rent-car #44208272485 SUCCESS (310 server, 81 web, 50 OCR tests) at `9eff0273`.

## E4 — Issues and PRs (GitHub REST)
- NEXUS: #5 (coordination, open), #10–#14 open; PRs #1–#4, #6–#9, #15–#17 merged.
- PNEU: open issues #13, #14, #17, #18, #19, #20; open PRs #1, #2, #3, #7; merged incl. #8, #12, #15, #16; closed unmerged #9, #10, #11.
- RENT CAR: open #14, #15, #16, #21, #22, #26, #30; merged PRs #18–#20, #23–#25, #27–#29, #31–#36.
- TECH PLATFORM: 25 open issues (#81 … #170), 97 merged PRs.
- TIJARA OS: PR #1 merged; 0 open issues.
- ALLOSERVIX: 27 merged PRs; 0 open issues. NEXORA: 3 merged PRs; 0 open issues.
- Issue #5 cross-references recorded (metadata only): rent-car #14, #15, #16, #21, #22, #23–#28, #26; PNEU #13, #14, #17–#20.

## E5 — Files cited (path @ SHA from E1)
- PNEU: `README.md`, `docs/decisions.md` (D-01…D-58), `docs/CHANGELOG.md`, `app/Enums/RoleName.php`, `app/Filament/Resources/`, `database/migrations/` (73 `Schema::create`), `config/backup.php`.
- RENT CAR: `README.md`, `FEATURE_TRACKER.md`, `DECISIONS.md`, `BACKUP_RESTORE.md`, `ARCHITECTURE.md:8`, `server/migrations/0001…0019`, `server/src/ocr/`, `ops/backup-nightly.{sh,ps1}`.
- TIJARA OS: `README.md`, `docs/TEST_STATUS.md`, `docs/DEPLOYMENT.md`, `db/migrations/001…004`, `test/*.test.ts`.
- ALLOSERVIX: `README.md`, `robots.txt`, `server.js`, `docs/*_V1x.md`, `services/*.html`.
- NEXORA: `README.md`, `docs/roadmap.md`, `docs/decisions/ADR-000{1,2,3}`, `apps/api/prisma/schema.prisma`.
- AMANZINE: `README.md`, `AUDIT/CONSOLIDATION_STATUS.md`, `PRODUCTION_READINESS.md`, `.github/workflows/ci.yml`, `server/routes/`, `docs/adr/`, `docs/IDEAS_BACKLOG.md`, `REPORTS/ARCHITECTURE_DECISIONS.md`.
- TECH PLATFORM (metadata only): `ARCHITECTURE-DESIGN.md:3`, `INTEGRATION-STATUS.md`, `package.json`.
- SCANFLOW: `Scanflowpro/backend/server.py` (routes lines 76–843), `backend/engines/`, `backend/requirements.txt`, `backend/.env` (key names only), `scan-Flow-pro/.emergent/`, `test_result.md`.
- NEXUS: `docs/17`, `docs/18`, `docs/19`, `docs/13`, `registry/*.json`, `lib/data.js`, `packages/monitor-core/test/inventory.test.mjs`.

## E6 — Public HTTP
- `https://alloservix.ma/robots.txt` returned `User-agent: * / Disallow: /` (same as repo `robots.txt`) on 2026-11-20.

## Not used as evidence
Chat history, agent claims, CI success as proof of production health, Railway SUCCESS as proof of functionality or recoverability.
