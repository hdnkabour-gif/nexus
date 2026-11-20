# 30 — Portfolio Risk & Gap Register (V1, verified 2026-11-20)

Verification grade: **A** = observed directly by this session (Railway query, git, GitHub API) at the stated time · **B** = reported in a source issue/PR, not re-executed here · **C** = inferred from code reading · **D** = owner-stated.
Severity: **P0** = possible data exposure/loss or false go-live claim now; **P1** = must close before real users/data; **P2** = quality/maintainability.
Owner actions are listed as recommendations only. **This task made no change to any application, repository visibility or Railway setting.**

## Portfolio-level risks (found in this inventory)
| ID | Sev | Grade | Risk | Evidence (2026-11-20) | Recommended owner action |
|---|---|---|---|---|---|
| R-001 | P0 | A (file identity) / unknown (content sensitivity) | A **public** repository holds a near byte-identical copy of the private TECH PLATFORM repository. **Public visibility is observed; whether confidential information was actually exposed or accessed is NOT proven** (content not assessed) | `abdellatifhadana-byte/sahar2026` @`3c6e4112`: 626/627 files byte-identical to private `Tech-Platform-@924aa502` | Make private or remove after confirming with employer (D-REQ-02); review whether credentials/site data are in history |
| R-002 | P0 | A (file presence) / unknown (content) | Uploaded and generated PDFs committed to a **public** repo. Presence observed; whether they contain personal or confidential data is **unknown** (not opened) | `abdellatifhadana-byte/scan-Flow-pro`: 5 files `backend/uploads/*.pdf`, 192 under `backend/results/codes` | Owner inspects privately; make repo private / purge history if real documents |
| R-003 | P0 | A + B | **Recoverability is not proven for real-data use.** Four evidence classes, kept separate: **(1) Railway volume snapshots:** 0 backups, 0 schedules on 17 volume instances (grade A, snapshot S2 docs/31). **(2) Application/object-storage backups:** code exists in PNEU (spatie → S3-compatible), RENT CAR (`backup.js` + offsite), TIJARA (`backup-job.sh`), ALLOSERVIX (`backup_log`). PNEU production writes encrypted archives to a temporary Railway bucket (#13, grade B). **(3) Isolated restore proof:** PNEU #13 reports 2026-11-17 restore into a new DB with an uploaded-file byte match and a sale-count match (B). RENT CAR #14 reports a synthetic drill in isolated staging, 2026-11-13 (B). TIJARA and NEXUS: CI or local only. **(4) Independent off-Railway (R2) restore:** none evidenced for any app. **Monetary balance reconciliation** after restore is not evidenced either | PNEU #13 (R2 restore, schedule, balances), RENT CAR #14, NEXUS #13, TIJARA backup service | Decide D-REQ-07; complete (4) and balance reconciliation per app before real data; Railway volume snapshots are complementary, not a substitute |
| R-004 | P1 | A | Services named `AMANZINE` and `amanzine2` in the AMANZINE Railway project run **Tech-Platform-** code; mixed projects create mis-operation risk (wrong service restarted/deleted) | Railway `spectacular-victory`: `production/AMANZINE` and `TECH PLATFORM/amanzine2` source `hdnkabour-gif/Tech-Platform-` | Rename/move services (D-REQ-05) |
| R-005 | P1 | A | TECH PLATFORM publicly reachable on 3 Railway domains while NEXUS treats it as "employer authorization required" | domains `tech-platform.up.railway.app`, `amanzine22.up.railway.app`, `tech-platform-ui.up.railway.app` | D-REQ-09 |
| R-006 | P1 | A | Stale preview deployment 164 commits behind `main` still live | `overflowing-vision` @`04e70ae8` `preview/pilote-technique-ui` | retire or update |
| R-007 | P1 | A | ALLOSERVIX custom domain attached before documented launch approval | Railway domains `alloservix.ma`, `www.alloservix.ma`; README step 3; robots `Disallow: /` | D-REQ-06 |
| R-008 | P1 | A | PNEU staging app and worker run different code (queue/job contract drift) | app `a2691d7d` (`fix/go-live-complete-strict-audit`), worker `6a811897` (`staging/integration`, PR #11 closed unmerged) | redeploy both from same SHA |
| R-009 | P1 | A (topology) / unknown (DB binding) | Two products share one Railway project (`lucid-playfulness`): blast radius, unclear DB binding | services `rent-car-app`, `Pneumatiques-MOUHIM`, 2 Postgres; env `mouhim ` | confirm DB bindings; consider separate projects |
| R-010 | P1 | C | SCANFLOW API has no authentication; MongoDB connection and CORS from committed `.env` | `Scanflowpro/backend/server.py`, `backend/.env` (localhost values only) | keep local-only; add auth before any hosting |
| R-011 | P2 | A | Repo hygiene: committed `node_modules`, `.pyc`, model weights, zip | `Scanflowpro` (310 node_modules files), `SAHARSHOP` (zip) | clean in a later app PR |
| R-012 | P2 | A | Portfolio knowledge spread over 8 AMANZINE repos and 2 SCANFLOW repos; risk of editing the wrong one | classification in docs/27 | archive (not delete) after owner decision |
| R-013 | P2 | A | NEXUS registry consumers still read the 2026-11-17 snapshot | `lib/data.js`, `inventory.test.mjs` (asserts 6 apps) | D-REQ-08 |
| R-014 | P2 | B | Private GitHub branch protection unavailable (free plan) – relies on discipline | TIJARA `docs/DEPLOYMENT.md` "Protection du main" | owner policy |

## Open application issues (P0/P1/P2 as labelled or titled in source)
| App | P0 | P1 | P2 / other |
|---|---|---|---|
| PNEU MOUHIM | #20 release gate (protected tables, legacy invoices, complete-file restore); #14 go-live demo-data removal (**not executed**) | #17 cash-day serialization; #18 concurrent credit ceiling; #19 atomic financial insert + activity log; #13 R2 + backup verification + D-58 | PRs #1, #2, #3, #7 open |
| RENT CAR | #14 offsite backup + restore proof (open); #22 Astra independent P0 audit (review-only) | #15 mobile framing/OCR mapping; #16 dev advisories + 2 missing synthetic uploads; #26 RC-03 partial late-charge refund / RC-04 | #30 infractions (MVP merged), #21 coordination |
| TECH PLATFORM | #88 DEMO-GATE (label P0); #170 MAP-NESTED-PLACEMENT-P0 | access-scope series #130, #132–#134, #138–#140; #147 SEC-01 follow-up; #129 sync timeout; #152 security gate mandatory in CI | #81, #87, #89, #96, #105, #106, #122, #123, #148, #151, #154, #155, #158 |
| AMANZINE | UNKNOWN (API not granted) | UNKNOWN | 26 remote branches, many `repair/*` |
| ALLOSERVIX | — (0 open issues) | gaps per README: no password reset, no email notifications, legal pages/contact verification | — |
| NEXORA | — | Gate 0/1 not met (auth, MFA, tenancy) | — |
| TIJARA OS | — (0 issues) | real-data conditions 1–6 unmet (`docs/DEPLOYMENT.md`): scheduled backup + restore from stored copy, email recovery, field encryption, shared rate limit, CNDP review | T25, T16, T24 gaps |
| NEXUS | #10 MFA/OIDC; #11 GitHub/Railway read-only integration | #12 source adapters; #13 offsite backup + restore | #14 AI diagnostics |
| SCANFLOW PRO | UNKNOWN (no API access); R-002, R-010 | no tests | R-011 |

## Gaps by capability (portfolio view)
| Capability | Present | Missing |
|---|---|---|
| Offsite backup + restore proof | code in RENT CAR, TIJARA, PNEU, ALLOSERVIX; PNEU in-Railway stored-copy restore reported (#13); RENT CAR synthetic staging drill (#14) | off-Railway (R2) restore and monetary reconciliation for every app; NEXUS, AMANZINE, NEXORA, TECH, SCANFLOW have no backup evidence at all |
| Deployed-SHA self-report | TIJARA `/ready` | other apps (NEXUS must read Railway instead) |
| MFA | PNEU (owner), ALLOSERVIX (admin TOTP) | NEXUS (#10), RENT CAR, TIJARA, AMANZINE |
| Independent security review | Astra review requested for RENT CAR (#22) | all others |
| Privacy/compliance review (CNDP) | stated as requirement (NEXORA, TIJARA) | none completed |
