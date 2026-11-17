# 16 — Backups, point-in-time recovery, isolated restoration and governance

**Recorded 2026-11-17. This is an operational specification, not a deployed backup service or a successful restore report.**

## What must be protected independently
A complete product recovery can need ALL of the following: production PostgreSQL data and WAL/PITR, uploaded documents/images, storage object versions, app version/commit/image, database schema/migrations, secrets and encryption-key recovery (managed securely, not exported into NEXUS), DNS/integration configuration, background queue reconciliation, and external-service transactional outcomes. Never claim database-only backup protects invoice attachments, legal documents, OCR images or session files.

## Supported backup families
| Family | Advantage | Important limitation |
|---|---|---|
| Logical PostgreSQL (pg_dump custom-format) | portable, restore to fresh DB after validation | client/server versions, consistency, DB roles/extensions, large DB time |
| Volume snapshots (Railway) | fast volume-level recovery | restore same project+environment, staged mount switch; not sufficient for separate disaster copy |
| Object-storage archive (S3/R2) | offsite DB dumps and file archives, checksum and retention | failed upload/keys/permissions can silently break, integrity test needed |
| PostgreSQL WAL / PITR | point-in-time recovery with RPO windows | platform-dependent; Railway PITR restores a **new sibling service**, manual cutover |
| Encrypted configuration backup | reconstruct app config and dependencies | never store plaintext live keys in NEXUS |
| Source/IaC repository | reprovision services and schema, with immutable commit | not a substitute for data or uploaded files |

## Evidence model (read-only first)
`backup_policies`: app/env, data scope, required frequencies, RPO/RTO, encryption, offsite requirement, max_restore_test_age, approver policy.
`backup_observations`: run state, finished_at, object ref/token-safe pointer, checksum status, offsite state, db/files scope, evidence id/source version.
`restore_drills`: backup_id, target_type='isolated', started_at, completed_at, data checks, file hash checks, schema checks, result, reviewer.
`recovery_requests`: app/env, selected backup, intended target, impact/risk, actor, approvals, preflight digest, status.
`recovery_approvals`: independent named reviewers, MFA freshness, expiry, evidence hash.
`recovery_receipts`: signed target execution ID, outcome and separately independently verified postconditions.

## Live dashboard
For each app show:
- last **successful** backup, not just last scheduled start;
- last **offsite-confirmed** DB and files copy;
- archive encryption/remote checksum and freshness;
- isolated restore-test success/time and covered tables/files/keys;
- backup health classification HEALTHY / WARNING / CRITICAL / UNKNOWN;
- runtime product deployment vs backup source SHA/time, recovery constraints;
- explicit RPO/RTO estimates and lack of evidence.

## Safe restore flow
1. User selects one application + environment + named backup version. NEXUS displays DB/file scope, age, last checksum, compatibility, estimated downtime and risks.
2. **Read-only validation:** existence, checksum, malware scan if needed, encryption key availability, DB server/client compatibility, retention, file inventory and available target capacity.
3. Create **new isolated destination** or approved Railway PITR sibling; never replace the current DB as a test. For a Railway *volume snapshot* restore, the provider stages a same-environment volume swap: keep it a **separately acknowledged, higher risk operation**, not a sandbox drill.
4. Replay into isolated DB using product-controlled adapter and dedicated temporary credentials. Reconstruct reference files and application version. Protect staging from emails, WhatsApp, payment/shipping webhooks and real user traffic.
5. Verify integrity: FK counts, sequences, hash/sample file coverage, migration version, stock ledger invariants, invoice numbering, money/credit balancing, secrets not inadvertently used, synthetic smoke workflow.
6. Generate signed restoration report: evidence, outcomes, UNKNOWN fields, elapsed time, recovery point and RPO/RTO.
7. To **promote to production**, create distinct high-risk request, incident and outage plan, obtain independent 2-person approval plus business-owner authorization, capture current-state backup, define rollback and maintenance window.
8. Human-controlled cutover, explicitly reconcile queued third-party effects, verify postconditions and audit. Never auto-run based on AI recommendation.

## Railways specifics verified 2026-11-17
- Volume backup schedules can be daily/weekly/monthly; restore stages a new volume and unmounts the prior volume after review and deployment. Restore restricted to the same project and environment.
- PostgreSQL PITR restoration creates a new sibling database service; moving application connections is a manual cutover.
- Both mechanisms require separate verification of application files, externally stored content, transactions and environment state.
References: https://docs.railway.com/volumes/backups and https://docs.railway.com/volumes/point-in-time-recovery .

## Product onboarding evidence (start with PNEU MOUHIM)
- Cross-check its backup scripts, actual Railway service variables, db_major, archive inventory, file volume and restore test.
- The 2026-11-16 discovery identified no BACKUP_S3_* variable names on the inspected app service and a pending draft PR #8 fixing backup/restore defects. This is not evidence of successful backups and must be refreshed before any action.
- Never execute a restore into the product's live PostgreSQL, never delete a volume or wipe app data from NEXUS at this stage.

## Failure modes
No offsite backup: CRITICAL/UNKNOWN, not green.
Backup succeeded but integrity untested: WARNING/UNKNOWN.
Restore drill older than policy: WARNING.
Missing uploaded files even with a DB backup: CRITICAL.
Provider API unreachable: UNKNOWN/stale (retain last seen timestamp), not PASS.
Partial/ambiguous restore: FAIL and isolated destination is quarantined; original remains untouched.
