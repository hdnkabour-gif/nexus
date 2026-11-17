# 08 — PNEU MOUHIM first integration discovery

> Snapshot from code/provider review dated **2026-11-16**. This document is **not live telemetry** and must be refreshed against current GitHub/Railway state before any rollout. Proposed checks are not implemented NEXUS features.

## Observed inventory
- Source: hdnkabour-gif/Pneumatiques-MOUHIM (private), main branch reviewed at 2e74384a30fae895cc7aa04fee7af3879bc345e0; PHP / Laravel / Filament, PostgreSQL.
- Product: three independent sites (central warehouse, store 01, store 02); sales, documents, stock, transfers, oil drums, customers, credit, cash and invoices.
- Railway: separate environment named 'mouhim ' under project 'lucid-playfulness'; application service 'Pneumatiques-MOUHIM' and PostgreSQL 18; single app replica in the observed environment.
- Persistent volume: /app/storage/app/public for uploaded files. **Persistent storage does not establish offsite backup.**
- Existing implementation: role permission enum + Spatie permissions; activity_log append-only; stock verifier comparing ledger/cached quantities; scheduled backup clean 01:30, backup run 02:00, monitor 08:00 Africa/Casablanca; underlying restore action and business tests.
- Observed 2026-11-16: services online in Railway environment status; no recent failed deployments in checked window. Do not infer backup health from deployment health.
- As inspected, Railway app service variable names did **not** include required BACKUP_S3_* offsite credentials; Railway tracing and source 'checkSuites' were disabled.
- At that snapshot, security fix PR #8 addressed PostgreSQL 18 client, missing S3 config error, DB_URL restore safety and backup alerts; it was OPEN + DRAFT, not merged into main. Do not represent proposed branch code as deployed.

## Source-only diagnostic checks to surface, no private customer data
| Check ID | Source implementation / target | Result to send |
|---|---|---|
| mouhim.stock.reconcile | StockVerifier / stock:verify | PASS/FAIL/UNKNOWN, counts, site/lot category, code version |
| mouhim.oil_drums.reconcile | oil_drum_movements vs remaining_ml | result/counters only |
| mouhim.used_tyres.reconcile | used tyre movement/status | result/counters only |
| mouhim.stock.reservations | reserved <= available | count of violations |
| mouhim.invoice.sequence | document sequence uniqueness and gaps review | result; never public invoice content |
| mouhim.cash.integrity | cash day aggregate vs recorded transactions | result only; avoid raw amounts if not needed |
| mouhim.transfer.integrity | dispatch/receipt lifecycle per site | count of stuck/invalid transitions |
| mouhim.sales.integrity | sale, payment and credit note invariants | PASS/FAIL/UNKNOWN |
| mouhim.auth.security | MFA owner coverage, lockouts, inactive users | counts or statuses; no credentials |
| mouhim.backup.health | offsite availability, age, archive integrity | status, age, last restore-test proof |
| mouhim.scheduler.health | backup:clean/run/monitor and summaries | last success, lag, failures |
| mouhim.deployment.health | GitHub CI / Railway | commit, deployment timestamp, logs summary |

## Future controlled actions (not yet supported)
- stock.verify.run (R0): run bounded stock verifier, return summarized differences; no mutation.
- user.unlock (R2): via native user management service after local authorization.
- user.send_reset_link (R2): issue one-time expiring reset link, never share new password.
- sessions.revoke (R2): after support case identity verification.
- backup.create (R2/R3): signed, rate-limited start, verify archive and offsite upload.
- backup.restore_test (R3): **only** into isolated disposable database, full integrity evidence.
- feature_flag.set (R3): only if source implements versioned flag and rollback.
- production restore (R4): disabled initially, never reachable from generic command API.

## Dangers and release blockers
1. Do not rely on 'Online' while backup tasks can fail.
2. Offsite cloud storage and validated backup/restore tests are prerequisites before real business data.
3. Source code and production config must be reconciled after any PR merge/deployment.
4. Strictly restrict access to customer/payment/invoice data and owner/manager privileges.
5. Document source app authorization and risk for every proposed command before implementation.
6. No cross-app business data migration to NEXUS.

## Provenance
- GitHub repository README, routes/web.php, routes/console.php, StockVerifier, RoleName and Permission enums, restore test, plus PR #8.
- Railway environment/service descriptions read on 2026-11-16; source/provider checks are snapshots, not historical proof of runtime success.
- Later GitHub/Railway changes must be rediscovered; never assume these values persist.
