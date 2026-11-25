# Final GO / NO-GO checklists — 2026-11-25 (feature freeze)

**Status: NOT APPROVED.** This is a checklist, not an authorization. Each 🔒 step needs the owner's
separate approval: merge, deploy, paid resource, production variable, live migration. Secret values are
never written here or in any repository. Generate them on a trusted machine and store them as Railway
variables (and in the owner's password manager where noted).

Decisions already taken by the owner (not to be asked again):
- PNEU: Path A (new clean environment) + Cloudflare R2.
- ALLOSERVIX: Push notifications.
- NEXUS: isolated verification before any production migration.

| Project | Frozen candidate | Verified evidence (reused, not re-run) |
|---|---|---|
| PNEU MOUHIM | Pneumatiques-MOUHIM PR #34 `5dae30e194865310985105e11487784adc25d530` | CI run 45657101337: 462 passed, 1 skipped (pre-existing). Gates on image `local/pneu-rc:5dae30e`: clean-install 20/20, drill 15/15, rehearse 20/20, topology 21/21 (`release-gate/2026-11-20/pneu/results/*-5dae30e.json`) |
| RENT CAR | rent-car-app PR #41 `4e953c7b6e3380d3f1e92a93287a476fa7194ae1` | CI run 45523148571. #39 approved technically by Astra. Isolated drill and clean-install on `a651681`; no migration change since |
| ALLOSERVIX | Alloservix PR #36 `205c0c21686421dd664a3e7c912be818fd7c03c2` (contains candidate #35 `9f90eda`) | CI runs 45659299318 and 45659299505. Locally 244/244; isolated browser checks 10/10 and 5/5; Web Push with a mock push service 4/4 |
| NEXUS | nexus PR #34 `9c3bc0ea182c120f1c21c8d7fc90f5a4949cfa63` | CI runs 45659830950, 45659831255 and 45659831222. Isolated verification on PostgreSQL 18: 20/20 (`release-gate/2026-11-25/nexus/results/v3-isolated-9c3bc0e.json`) |

Rule for every project: the candidate SHA that is deployed must be exactly the one above. Any code change
means new CI on the new SHA, and the gates that the change affects must be run again.

---

## 1. PNEU MOUHIM — candidate `5dae30e`

### 1.1 Railway preparation (Path A: new clean environment, nothing copied from demo)
1. 🔒 Create a **new environment** (or a new project) in EU West. Keep the current demo environment untouched.
2. 🔒 Add **PostgreSQL 18** (managed by Railway; the image's client is pg 18).
3. Create the services from the same repository and the same Dockerfile (`railway.json`: healthcheck `/up`, timeout 120 s):
   - `web`: start command `web` (the default CMD).
   - `worker`: start command `worker` (`queue:work`). **No volume.**
   - Scheduler: either `RUN_SCHEDULER=true` on `web`, or a separate `scheduler` service (command `scheduler`) with `RUN_SCHEDULER=false` on `web`. Do **not** do both.
4. 🔒 Add **one volume on `web` mounted at `/app/storage/app`** (not `/app/storage/app/public`). Railway then sets `RAILWAY_VOLUME_MOUNT_PATH=/app/storage/app` and `RAILWAY_ENVIRONMENT_NAME`.
5. **Deploy trigger.** The new environment must deploy the **release branch / SHA `5dae30e`**, not `main`. Note: the *demo* environment has an automatic trigger on `main` (`checkSuites:false`). Merging into `main` deploys the demo.
   - On the demo (public-only volume, old public receipts), the new code **refuses to start** (proven by topology A). The `/up` healthcheck then fails and Railway keeps the previous demo deployment.
   - Decide this trigger before any merge into `main`.
6. 🔒 Cloudflare R2:
   - a private bucket, with no public access;
   - an API token scoped to that one bucket (Object Read & Write);
   - a lifecycle rule of ≥ 30 days (or rely on `BACKUP_KEEP_DAYS`).

### 1.2 Environment variables (names only)
**Shared by `web` and `worker`:**

| Group | Variables |
|---|---|
| App | `APP_NAME`, `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, `APP_LOCALE=fr`, `APP_FALLBACK_LOCALE`, `APP_KEY` (secret; `php artisan key:generate --show`) |
| Database | `DB_CONNECTION=pgsql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (Railway references to the PostgreSQL service) |
| Runtime | `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`, `CACHE_STORE=database`, `FILESYSTEM_DISK=local`, `LOG_CHANNEL=stderr`, `LOG_LEVEL=warning` |
| Mail (backup alerts) | `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` (secret), `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, `BACKUP_NOTIFY_EMAIL` |
| Backups to R2 | `BACKUP_DISK=backups`, `BACKUP_S3_ENDPOINT` (`https://<account>.r2.cloudflarestorage.com`), `BACKUP_S3_REGION=auto`, `BACKUP_S3_BUCKET`, `BACKUP_S3_KEY` (secret), `BACKUP_S3_SECRET` (secret), `BACKUP_S3_PATH_STYLE=true`, `BACKUP_S3_ROOT` (optional prefix), `BACKUP_KEEP_DAYS=30`, `BACKUP_ARCHIVE_PASSWORD` (secret, **also kept in the owner's password manager**; without it the archives cannot be read) |
| First owner (first boot only) | `OWNER_NAME`, `OWNER_EMAIL`, `OWNER_PASSWORD` (secret). Remove `OWNER_PASSWORD` after the first login. |
| Optional, existing features | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (secret), `VAPID_SUBJECT`, `EVENING_SUMMARY_AT`, `RUN_SCHEDULER` |
| Set by Railway (do not set) | `PORT`, `RAILWAY_VOLUME_MOUNT_PATH`, `RAILWAY_ENVIRONMENT_NAME` |

**Never set in production:** `DemoSeeder` or `app:staging-demo-data`. Both are refused in production; the clean-install gate proved it.

### 1.3 Storage and backup checks (after the first deploy, before any real data)
- [ ] The `web` log contains `SECURE_RECEIPTS status=… exposed=0 safe=yes`, and the service is healthy.
- [ ] `php artisan app:go-live-audit --strict` shows `Private documents storage: PASS`. Until §1.5 it must also show `Invoice numbering approval: FAIL`.
- [ ] `php artisan backup:run`, then `php artisan backup:list`: an archive exists in R2 (size > 0, name and date recorded).
- [ ] The backup-failure alert reaches `BACKUP_NOTIFY_EMAIL`. Test it once, for example with a temporarily wrong bucket name in a test environment, never in production.

### 1.4 Isolated restore from R2 (plan `docs/plan-stockage-durable-documents.md` §6)
- [ ] Download the archive from R2 with a **read-only** key.
- [ ] Restore it on an isolated Docker network: `app:backup-restore <archive> --into=<new db> --files-to=… --documents-to=…`.
- [ ] `stock:verify` OK, `app:receipts-inventory` checksums identical, balances reconciled, `go-live-audit` run on the copy.
- [ ] Record only: the image SHA, the archive name and size, PASS/FAIL. Then destroy the copy.

### 1.5 Business acceptance
- [ ] The owner provides the **real last paper invoice number**, sets the D-58 format and the next number, and approves on **Paramètres › Numérotation**. The window shows the exact first number.
- [ ] `go-live-audit --strict` = `GO_LIVE_CLEAN_BASE_VERIFIED` with both PASS lines.
- [ ] Shop acceptance with the owner:
  - a sale in under 1 minute;
  - the first invoice carries the approved number;
  - a credit note;
  - cash close;
  - a transfer between sites;
  - an expense with a receipt (private; another site gets 403);
  - FR and AR;
  - phone and tablet.

### 1.6 Rollback
- Before go-live: nothing to roll back. The demo is untouched and the new environment can simply be stopped.
- After go-live: Railway **Redeploy the previous deployment** of the new environment. Migrations are additive; no down migration is needed for this release. Data: `app:backup-restore` from R2 **into a new database** (`--into`), then switch `DB_*`. Never use `--replace-current` without the owner present.
- Receipts are never deleted before a verified private copy exists, so a code rollback cannot lose them.

**GO** = every box in §1.3–§1.5 ticked + the owner's written approval. **NO-GO** if any of these happens: `safe=no`, a strict audit FAIL, no R2 archive, the restore not proven, or the first number not approved.

---

## 2. RENT CAR — candidate `4e953c7`

### 2.1 Railway preparation (Staging first, then production)
1. 🔒 A **separate Staging** environment (or project) from the same repository. Use the existing `.railway/railway.ts` definition: one app service plus PostgreSQL.
2. Build: `npm ci --include=dev && npm run build`. Start: `npm run start -w server`. **preDeploy:** `node server/dist/src/scripts/migrate.js` (forward-only, idempotent). Healthcheck: `/api/health/db` (timeout 30 s).
3. 🔒 A volume mounted at **`/data`**, with Railway volume backups DAILY + WEEKLY (as declared in `railway.ts`).
4. Generate the public domain, then set `APP_ORIGINS` to that exact `https://` origin.

### 2.2 Environment variables (names only)

| Group | Variables |
|---|---|
| Runtime | `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT` (Railway), `DATABASE_URL` (reference to the PostgreSQL service), `APP_ORIGINS`, `COOKIE_SECURE=true`, `TRUST_PROXY=true`, `WEB_DIST_DIR=../web/dist`, `LOG_LEVEL` |
| Files | `STORAGE_DIR=/data/files`, `MAX_UPLOAD_MB` |
| Sessions and security (defaults are fine) | `SESSION_IDLE_MINUTES`, `SESSION_ABSOLUTE_HOURS`, `LOGIN_RATE_LIMIT_MAX`, `LOGIN_RATE_LIMIT_WINDOW_MINUTES`, `ACCOUNT_LOCKOUT_THRESHOLD`, `ACCOUNT_LOCKOUT_MINUTES` |
| First manager | `FLEETORA_MANAGER_EMAIL`, `FLEETORA_MANAGER_NAME`, `FLEETORA_MANAGER_PASSWORD` (secret; remove after the first login) |
| OCR | `FLEETORA_OCR_ENABLED=false` (no external OCR without a privacy review, per `CLAUDE.md`) |
| App backups (company host / off-site) | `BACKUP_DIR`, `BACKUP_PASSPHRASE` (secret, ≥ 12 characters, password manager), `OFFSITE_KIND` (`s3` or `dir`), `OFFSITE_REQUIRED`, and for `s3`: `OFFSITE_S3_ENDPOINT`, `OFFSITE_S3_REGION`, `OFFSITE_S3_BUCKET`, `OFFSITE_S3_PREFIX`, `OFFSITE_S3_FORCE_PATH_STYLE`, `OFFSITE_S3_ACCESS_KEY_ID`, `OFFSITE_S3_SECRET_ACCESS_KEY` (secret) |

Do **not** set `FLEETORA_DEMO_DATABASE` / `FLEETORA_DEMO_SEED` in Staging or production (demo seed only).

### 2.3 Storage and backup checks
- [ ] After a redeploy, an uploaded test document is still there: `npm run check-files -w server` reports no missing file.
- [ ] Railway PostgreSQL backups and `/data` volume backups are enabled.
- [ ] App backup: `npm run backup -w server`, then `verify-backup` (exit 0), then `restore-backup` into a **new empty** database. Same row counts and checksums. (Known limitation: off-site backup is not yet proven with the owner's real provider; `BACKUP_RESTORE.md` §“Not yet proven”.)

### 2.4 Acceptance
- [ ] The manager runs `docs/ACCEPTANCE_TEST_PLAN_AR.md` **§7**: 20 steps (money, documents, permissions, restore) on Staging, with synthetic data only.
- [ ] Any ❌ in money or permissions = **NO-GO** until fixed and CI re-run.
- [ ] The P2 display thread on #37 is closed by #39 (Astra technical approval recorded).

### 2.5 Rollback
- Code: redeploy the previous Railway deployment. `main` is currently at `aaa6e62`, which the candidate contains.
- Data: migrations are forward-only. Restore with `restore-backup` into a new database, plus the Railway volume backup for `/data`.

**GO** = §2.3 + §2.4 passed on Staging + the owner's approval of the #41 merge, then a production environment prepared the same way.

---

## 3. ALLOSERVIX — candidate `205c0c2` (#36, which contains #35)

### 3.1 Railway preparation
1. Only the `production` environment exists today, running `main` `2c1272b` with intake **off** (`/api/public/requests/config` → `enabled:false`).
2. 🔒 Create a **Staging** environment (same repository, a volume at `/data`). Test Push and intake there first.
3. Persistent storage: a volume at `/data` with `DATA_DIR=/data`. It holds the SQLite database, the notification log and the push subscriptions.

### 3.2 Environment variables (names only)

| Group | Variables |
|---|---|
| Runtime | `NODE_ENV=production`, `PORT` (Railway), `DATA_DIR=/data`, `PUBLIC_DOMAINS` |
| Admin | `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (secret; `npm run admin:setup`), `ADMIN_TOTP_SECRET` (secret); optional `ADMIN_REAUTH_SECONDS`, `ADMIN_TOTP_WINDOW`, `ADMIN_RATE_SCALE`, `ADMIN_FORCE_ENV_LOGIN` |
| Encryption | `ALLO_DATA_KEY` (secret, 64 hex characters, **password manager**; changing it makes the encrypted requests unreadable) |
| Intake switch | `ENABLE_REQUESTS` (`false` until GO, then `true`), `ENABLE_INQUIRIES`, `INQUIRY_RETENTION_DAYS`, `ENABLE_ANALYTICS` |
| **Push (owner decision)** | `NOTIFY_TRANSPORT=webpush`, `PUSH_VAPID_PUBLIC_KEY`, `PUSH_VAPID_PRIVATE_KEY` (secret), `PUSH_VAPID_SUBJECT` (`mailto:` address). Generate the keys with `node scripts/vapid-keys.js`. Without the keys, start-up is refused by design. |
| AI (unchanged, optional) | `ENABLE_AI`, `AI_PROVIDER_ORDER`, `AI_DAILY_LIMIT`, provider keys `OPENAI_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` / `DEEPSEEK_API_KEY` (secret) + model names |
| **Never in production** | `PUSH_TEST_ALLOW_HOST` (test only; ignored unless `NODE_ENV=test`) |

### 3.3 Storage and backup checks
- [ ] After a redeploy, `/data` persists: requests, notification log and subscriptions are still there.
- [ ] The admin's encrypted snapshot (monitor snapshot, export, verify-restore) succeeds. The `ALLO_DATA_KEY` backup is confirmed by the owner.

### 3.4 Acceptance (Staging, then a production switch)
- [ ] Owner or manager: in the ops console, **🔔 Alertes sur cet appareil**, on a real **Android (Chrome)** device and a real **iPhone** (Safari web app added to the home screen).
- [ ] One synthetic request from a phone → exactly **one** notice on each subscribed device. The delivery log shows `delivered`, attempts = 1.
- [ ] The retry case: a reload after a lost response → one request, one alert.
- [ ] A device that unsubscribes is deactivated on 410. With no device, the alert is `failed: NoSubscribers` (visible in the log).
- [ ] The QR codes `/?src=carte|flyer|enveloppe` set `campaign_source`. Consent version and date are recorded. FR / AR / Darija.
- [ ] Privacy: the notice text contains no client data. The confirmation page shows no contact details.

### 3.5 Rollback
- Code: redeploy the previous deployment (`2c1272b`). The new tables and columns are additive.
- Intake can be stopped instantly with `ENABLE_REQUESTS=false` (a production variable, 🔒). Push can be stopped with `NOTIFY_TRANSPORT=none`.

**GO** = §3.3 + §3.4 on Staging + the owner's approval, then 🔒 deploy, then 🔒 `ENABLE_REQUESTS=true`. **NO-GO** if no real device received the alert. Flyers must not advertise online requests before that.

---

## 4. NEXUS — candidate `9c3bc0e` (V3)

### 4.1 Railway preparation
1. Current state: `main` `080be1f` (V2) is live. `nexus-web` has `preDeployCommand = node scripts/migrate.mjs`. A cron service runs `npm run probe:public` every 15 minutes.
2. 🔒 Before any deploy of V3 (which also runs its migration through preDeploy):
   - take a manual PostgreSQL backup / snapshot of the NEXUS database;
   - restore it in isolation and run `release-gate/2026-11-25/nexus/v3-isolated.sh` against a copy of the **real** schema (synthetic proof done: 20/20).
3. 🔒 Create a **least-privilege runtime role** (the migration/owner role stays separate), with the grants proven in the isolated run:
   - `SELECT, INSERT` on `nexus_task_observation_history`, `nexus_knowledge_revisions`, `nexus_audit`, `nexus_observations`;
   - `SELECT, INSERT, UPDATE` on `nexus_job_receipts`, `nexus_github_budget`;
   - `SELECT, INSERT, UPDATE, DELETE` on `nexus_sessions`, `nexus_owner_credentials`, `nexus_connections`.

   Point `nexus-web` and the cron services at this role. The migration (preDeploy) must run with the owner role, through a separate URL **only for preDeploy**, or by a manual 🔒 migration.
4. 🔒 Only after V3 is accepted: add a cron service `npm run knowledge:sync`, hourly. Its anonymous GitHub budget is shared with the console (50/h).

### 4.2 Environment variables (names only)

| Group | Variables |
|---|---|
| Runtime | `NODE_ENV=production`, `NEXUS_PUBLIC_ORIGIN`, `NEXUS_SESSION_SECRET` (secret) |
| Owner | `NEXUS_ADMIN_USERNAME`, `NEXUS_ADMIN_EMAIL`, `NEXUS_ADMIN_NAME`, `NEXUS_ADMIN_PASSWORD_HASH` (secret) |
| Database | `NEXUS_DATABASE_URL`: the **runtime role** for web and cron; the owner role only for the migration |
| Read-only providers (#11, optional, not enabled) | `NEXUS_GITHUB_READ_TOKEN`, `NEXUS_RAILWAY_READ_TOKEN` (secret, read-only scopes) |

### 4.3 Checks
- [ ] `npm run db:check-privileges` with the **runtime** URL → exit 0. With the owner URL → exit 1 (expected).
- [ ] After the migration, `/console/knowledge` shows `PERSISTED`. Revisions = the imported index.
- [ ] The first `knowledge:sync` run: the receipt is `succeeded`; no `budget` UNKNOWN; `rate_limit_recorded:true`.
- [ ] A stale or late receipt is never shown as `running` forever (proven by test).

### 4.4 Rollback
- V2 code runs on the V3 schema (proven: 35 + 29 tests). A code rollback is a plain redeploy of `080be1f`; no schema rollback is needed (all changes are additive).
- Data: restore the pre-migration snapshot into a new database, then switch `NEXUS_DATABASE_URL`.

**GO** = §4.1 steps 2–3 done + §4.3 + the owner's approval. The cron is enabled last, separately.

---

```yaml
schema_version: 1
app_id: "portfolio"
task_id: "GO-NO-GO-20261125"
agent_role: "executor"
state: "review_requested"
scope: "Final GO/NO-GO checklists for four frozen release candidates; no code change"
source_refs:
  - "hdnkabour-gif/Pneumatiques-MOUHIM#34 @5dae30e194865310985105e11487784adc25d530"
  - "hdnkabour-gif/rent-car-app#41 @4e953c7b6e3380d3f1e92a93287a476fa7194ae1"
  - "hdnkabour-gif/Alloservix#36 @205c0c21686421dd664a3e7c912be818fd7c03c2"
  - "hdnkabour-gif/nexus#34 @9c3bc0ea182c120f1c21c8d7fc90f5a4949cfa63"
reused_evidence: ["CI and gate runs listed in the table above; no code changed since"]
not_verified:
  - "PNEU: R2 archive, offsite restore from R2, real first invoice number, shop acceptance"
  - "RENT CAR: Staging, manager acceptance, real offsite backup"
  - "ALLOSERVIX: real-device Web Push (Android/iPhone), Staging"
  - "NEXUS: privileges of the real runtime role, isolated run on a copy of the real database, cron"
next_action: "Owner: approve the 🔒 Railway preparation steps per project (no paid resource is created without approval)"
release: "NOT_APPROVED"
```
