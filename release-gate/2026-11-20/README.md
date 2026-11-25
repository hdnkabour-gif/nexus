# Release gate evidence (2026-11-20, NEXUS #24)

Evidence for two gate items: **(1) what a merge does on Railway** and **(2) an isolated acceptance run of the PNEU release candidate**.
Nothing here merges, deploys, changes Railway or touches a company database. Synthetic data only.

## 1. What a merge into `main` does on Railway

The data was read on 2026-11-20 with **GraphQL queries only**: `deploymentTriggers`, `serviceInstance` and `deployments`. No mutation was sent and no variable values were read. The full data is in `railway-deploy-triggers.json`.

| Service | Deploy trigger | Deployment history (vs `main` commits) | A merge into `main`… | Start command migrates the DB? |
|---|---|---|---|---|
| PNEU app (env `mouhim`) | **`main`, `checkSuites: false`** | `ea55329` pushed 15:53:34Z, deployed 15:53:36Z; `181095a` pushed 15:20:19Z, deployed 15:20:21Z. Both are plain `deploy`, not patches | **deploys immediately, without waiting for CI** | **yes**: `entrypoint.sh web` runs `migrate --force` then `db:seed --force` |
| PNEU worker (env `mouhim`) | **`main`, `checkSuites: false`** | same commit as the app | **deploys immediately** | no (the worker only runs `queue:work`) |
| RENT CAR (env `production`) | none; watch pattern `__railway_manual_approval_required__` | `781ab81` pushed 01:28:17Z → `SKIPPED` 01:28:19Z → manual `patch` deploy 01:29:01Z | does **not** deploy by itself (a manual patch deploy is needed) | **yes**: `start` runs `migrate.js` before the server |
| AMANZINE (`balanced-growth`) | none | `4ff08a9` was on `main` on Nov 16 and deployed by manual `patch` on Nov 18 | does **not** deploy by itself | **yes**: `server/index.js` calls `migrate()` at boot |
| AMANZINE staging | none | `4ff08a9` | does not deploy by itself | yes |
| PNEU staging app / worker | none (feature branches) | app `a2691d7`, worker `6a81189`: **not aligned** | n/a | app yes |

**Consequences**
- **PNEU:** merging #22, then #23, then #24 into `main` produces **three production deploys**. Merging #23 alone (the only PR with a migration) would migrate the live DB with the chain half-done.
  - Every deploy also re-runs the reference seeders.
  - Before any merge, the owner must decide to hold auto-deploy (for example, temporarily disconnect the trigger or pin the deployment), or to merge the chain in one fast-forward and accept a single deploy. This is a Railway change, so it needs explicit owner approval. **Not done here.**
- **RENT CAR, AMANZINE:** merging does not deploy, but any later deploy runs the new migrations at boot (`0020` / `stock_committed_items`).
- `canRollback: true` on Railway only means the previous *image* can be redeployed. It says nothing about the database or files (see §2.3).

## 2. PNEU release candidate in an isolated environment

### 2.1 Candidate and provenance
- `main` = `ea55329` = merge-base of the chain = the deployed commit. The chain #22 → #23 → #24 is therefore a fast-forward, and the final tree after the merges **is** `162fe2441266c8443d205ad2acc3b1d03e001bed`. RENT CAR (`781ab81` → `a651681`) and AMANZINE (`4ff08a9` → `90d2a07`) are in the same situation.
- The image was built from `git archive 162fe24` with the **production `Dockerfile`**. It has the label `org.opencontainers.image.revision=162fe24…` and the file `/app/REVISION` with the same SHA. **Web and worker run the same image.**
- Local build-environment differences, not in the image's app layers:
  - the `composer` binary came from a local copy, because Docker Hub rate-limited the `composer:2` pull;
  - the sandbox proxy CA was trusted during the build and **removed in the last layer**.
  - The app source, `composer.lock` and the entrypoint are unchanged.

### 2.2 Isolation
- PostgreSQL 18 runs in a fresh container. Web and worker are attached **only to an internal Docker network with no route outside**, so no mail, payment, carrier or backup call can leave.
- The configuration is generated fresh and synthetic (random app key, `example.test` owner). Mail goes to the log, the scheduler is off and the backup disk is local.
- The real entrypoint ran: migrate, reference seed, owner from the `OWNER_*` variables, then the server. Login page: 200.

### 2.3 Results
**Acceptance on `162fe24`** (`pneu/acceptance.php` → `pneu/acceptance-result-162fe24.json`): **14/14 PASS**

| Check | Result |
|---|---|
| Sale of 2 tyres = 240.00 TTC, paid 100.00 cash | stock 4 → 2 |
| Credit note for 1 tyre (120.00) on account | **cash of the day 100.00, debt 20.00, one tyre net deducted (stock 3)** |
| Same receipt sent twice (same key) | one payment, debt 0 |
| Close of the day | expected 120.00, difference 0; a cash expense after the close is refused; the close is audited |
| Worker container (same image) | consumed a queued job; 0 failed jobs |

**Upgrade rehearsal** (`pneu/rehearse.sh`, fail-closed; result `pneu/results/rehearse-result-ea55329-to-162fe24.json`, **17/17 assertions**):
1. The deployed `ea55329` writes synthetic books: float, cash sale, credit note, a pre-#23 receipt and an expense.
2. The `162fe24` image starts on the same DB. Only `2026_11_20_100000_add_idempotency_to_payments` runs.
3. Code rollback: `ea55329` restarts on the migrated schema.

| Step | Cash expected | Debt | Stock |
|---|---|---|---|
| A: `ea55329` | 155.00 | 10.00 | 3 |
| B: after upgrade to `162fe24` | 155.00 | 10.00 | 3 |
| C: `ea55329` again on the migrated schema | 155.00 | 10.00 | 3 |

- Asserted: the only migration applied is `2026_11_20_100000_add_idempotency_to_payments`.
- Asserted: **no table changed** outside an explicit allowlist of the two boot-reseeded reference catalogues (`oil_catalogue_references`, `tyre_catalogue_references`), and those two are **identical once `created_at`/`updated_at` are left out**.
- **The migration is additive. The rollback rehearsal proves schema compatibility only, not financial safety.** `ea55329` lacks the cash-close, credit-ceiling and receipt-idempotency fixes. If it is ever rolled back to, financial writes must stop until a forward fix or an owner-authorised procedure.
- This is **not** a database or file restore; that still requires the off-Railway restore proof (PNEU #13).

### 2.4 Stock transfers, then backup → restore drill (`pneu/books.php`, `pneu/drill.sh`; result `pneu/results/drill-result-162fe24.json`, **14/14 assertions**)
Run on `162fe24`, web and worker from the same image, isolated as in §2.2, with backup disk `backups_local` and a synthetic archive password.

**Transfers** (and the sale, refund, receipt and expense with a photo):
- 30 tyres in at DEP.
- DEP → M01: 10 sent, 10 received.
- DEP → M02: 5 sent, **4 received**; the missing one is recorded with its reason.
- At M01: 2 sold and 1 returned.
- Resulting stock: **DEP 15 · M01 9 · M02 4**. `stock:verify`: *Stock cohérent* (no gap between the ledger and the levels).

**Backup:** the application's real `backup:run`. The archive holds the DB dump, `.gitignore` and the photo, all **encrypted**; the 4th entry is an empty directory record.

**Restore:** `app:backup-restore --into=mouhim_restored --files-to=<private folder>`. The command confirms that the current database and the live files were not changed.

**Result:**

| Check | Source | Restored copy |
|---|---|---|
| Tables, compared over every column (application tables, queue/cache/session excluded) | 74 | **74 identical, 0 different** |
| Stock DEP / M01 / M02 | 15 / 9 / 4 | 15 / 9 / 4 |
| M01 cash expected / debt | 155.00 / 10.00 | 155.00 / 10.00 |
| Expense photo SHA-256 | `ea774032…` (live disk) | `ea774032…` (read **from the `--files-to` restore folder**) |
| `stock:verify` | consistent | consistent |

Both hashes, the restore location, the archive's files-encrypted count (3/3) and the audit's real exit code are in the result file. An earlier version of this PR committed a restored-figures file with `photo_sha256: null` (it read the live disk) and cited a log the repo's `*.log` ignore rule kept out of the PR; both are replaced by the result file.

**`app:go-live-audit --strict` on the restored copy:** exit code 1 with `GO_LIVE_NOT_READY`, **asserted as the expected outcome** (synthetic operational rows remain).
- It shows the **current technical configuration** `FA-{YEAR}-{NUMBER}`, padding 6. This is **not approved** and may not match the company's paper series; #13 mentions a paper-style example such as `219/26`.
- The owner or accountant must give the **exact format and the last issued paper number**. The next number is then set on the *Document Numbering* page (D-49; going backwards is refused). Existing invoices are never rewritten.
- `GO_LIVE_NOT_READY` stays until that is reconciled.

### 2.5 Not covered here (still open on the gate)
- The same drill against the **real off-Railway R2 target** with the owner's credentials (#13). The procedure above is identical; only the disk changes.
- Scheduled backup evidence on the live service.
- Photo access control.
- Operator and owner sign-off.
- PNEU **staging** on Railway is still not aligned (app and worker on different branches).

## 3. RENT CAR candidate `a651681`: off-site backup → restore drill (`rent-car/`)
The setup is entirely local, with no Railway and no cloud storage:
- server built from `a651681`, on a fresh local PostgreSQL database;
- migrations `0001`–`0020` applied, synthetic company from the repo's guarded `seed-dev`;
- the candidate server bound to `127.0.0.1`, driven by `rent-car/drive.mjs` to write the books.

**The books:**
- deposit in 500.00;
- rental payment including a 20.00 late fee, then the fee waived;
- **`rental_refund` 20.00, then its reversal**;
- deposit out 500.00;
- an expense with an uploaded receipt (PDF).

**Backup:** the app's own `backup` script, encrypted, with the off-site target **simulated** as a separate local directory (`OFFSITE_KIND=dir`). 59 tables, 714 rows, 1 file; the off-site copy was verified.

The seeded vehicle has a daily rate of 0, so this run is **not a revenue acceptance scenario**. It proves backup integrity only; the revenue and refund reconciliation is covered by the RENT CAR test suite (#37).

**Drill:** the app's own `backup-drill`, reading from the off-site copy. Report: `rent-car/drill-report-a651681.json`, **`ok: true`**.
- Steps:
  - every object matched its size and SHA-256;
  - restored into a **new** database created only for the drill;
  - row counts, migrations and every file checksum equal the manifest;
  - the restored file was re-hashed and is identical.
- **10/10 negative checks:**
  - wrong passphrase refused;
  - truncated dump detected;
  - missing file detected;
  - damaged file detected;
  - altered manifest detected;
  - an interrupted upload is never restored;
  - network resets are retried;
  - a lasting failure is reported with nothing half-restored;
  - an unencrypted backup is never copied off-site;
  - restore into a non-empty DB is refused.
- The drill database was dropped afterwards.

**What this does NOT prove (#14 stays open):**
- a real cloud or off-Railway target with real credentials;
- the backup schedule and retention on the live service;
- branch-level access control on documents;
- D-052, and the accountant's acceptance of the signed CSV.

## 4. Clean install: a new customer starts with NO business data (`pneu/clean-install.sh`, `rent-car/clean-install.sh`)
Both scripts are fail-closed and run on a brand-new database with the candidate's real production start.

**PNEU `162fe24`**: `pneu/results/clean-install-result-162fe24.json`, **18/18**
- After the entrypoint (migrate, reference seed, owner from env), all 17 business tables have 0 rows: customers, vehicles, products, stock, lots, sales, invoices, payments, allocations, cash days, expenses, transfers, approvals and opening balances.
- The **only user is the owner** (with the owner role), and the sites are DEP, M01 and M02.
- Reference data is present: 5 roles, 38 permissions, 33 categories, 120 tyre catalogue entries.
- `app:go-live-audit --strict` **passes** (exit 0).
- `DemoSeeder` and `app:staging-demo-data --force` are **refused** by their production and staging-project guards (the refusal reasons are asserted), and nothing is written.
- A **redeploy** (restart: migrate + seed again) adds no row; the reference counts are unchanged.

**RENT CAR `a651681`**: `rent-car/results/clean-install-result-a651681.json`, **10/10**
- Production start (`migrate.js` then the server; `NODE_ENV=production`, `COOKIE_SECURE=true`) on a new database, then `create-manager` from env.
- **No business table holds rows.** The only non-empty tables are the allowlisted reference and setup tables: roles, permissions, migrations, the vehicle catalogue, one contract template, company settings, the manager, and one audit entry for creating that manager.
- `seed:dev` and `seed:demo` are refused.
- A redeploy applies no migration and adds no row. The database is dropped after the run.

**What this does not cover:** the existing Railway databases. Whether they already hold demo or synthetic rows must be checked **read-only** (for example `app:go-live-audit` on a restored copy) before handing a service to a customer. A clean customer environment should be a **new** database, not a cleanup of the demo one; nothing is deleted without approval and a backup.

## 4b. Final PNEU candidate `98b9715` (= #22 + #23 + #24 + #25 + #28 private receipts), 2026-11-23
The image was built from `git archive 98b9715` (label and `/app/REVISION` checked by every run). `storage/app` is a **named volume**, modelling the Railway volume, so files survive a version switch.

| Run | Result | Receipt-specific assertions |
|---|---|---|
| `drill.sh` → `pneu/results/drill-result-98b9715.json` | **15/15** | the source receipt is on the **private `documents` disk**, not `/storage`; restored with `--documents-to` into a private folder, same SHA-256 |
| `rehearse.sh` `ea55329` → `98b9715` → `pneu/results/rehearse-result-ea55329-to-98b9715.json` | **20/20** | migrations exactly `…add_idempotency_to_payments` and `…move_expense_receipts_to_private_disk`; a receipt written by the deployed version is **only on the public disk** before, **only on the private disk with the same SHA-256** after; after a code rollback it is **kept** on the private disk (not lost, but the old link cannot serve it) |
| `clean-install.sh` → `pneu/results/clean-install-result-98b9715.json` | **18/18** | no business rows; only the owner; demo seeds refused; a redeploy adds nothing |

PNEU CI on `98b9715`: `pest` ✅. Full suite locally: 433 passed, 1 skipped.

## 4c. Final PNEU candidate `6ec778e` (= `98b9715` + #30 atomic, idempotent opening balance, #19), 2026-11-23
Same image procedure and checks (label and `/app/REVISION`; `storage/app` as a persistent volume).

| Run | Result |
|---|---|
| `drill.sh` → `pneu/results/drill-result-6ec778e.json` | **15/15** (private receipt restored with the same SHA-256; 74/74 tables identical) |
| `rehearse.sh` `ea55329` → `6ec778e` → `pneu/results/rehearse-result-ea55329-to-6ec778e.json` | **20/20**, migrations exactly `…add_idempotency_to_payments`, `…move_expense_receipts_to_private_disk`, `…add_idempotency_to_customer_opening_balances`; receipt public → private, same SHA-256; figures unchanged |
| `clean-install.sh` → `pneu/results/clean-install-result-6ec778e.json` | **18/18** |

PNEU CI on `6ec778e`: `pest` ✅. Full suite locally: 437 passed, 1 skipped.

**Clean business DB and D-58:** the D-58 migration only applies to an installation that already has users, so a **new clean database starts with the generic `FA-{YEAR}-{NUMBER}`**. Set `{PREFIX}{NUMBER}/{YY}`, padding 1, empty invoice prefix and the real next paper number on *Document Numbering* before the first invoice, and confirm with `app:go-live-audit`.

## 5. Release plans
- `PLAN-PNEU.md`
- `PLAN-RENT-CAR.md`
- `PLAN-AMANZINE.md`

Each one names the deployed SHA, the candidate, how to avoid an unwanted deploy, the verification and rollback steps, the stop conditions, and the owner decisions still required.

## Reproduce
The scripts are **fail-closed** (`pneu/lib.sh`):
- `set -Eeuo pipefail` and an error trap naming the failing command;
- bounded readiness checks;
- a work directory created per run (`WORK`, default `mktemp -d`) with **generated** synthetic env files;
- the success verdict comes from explicit assertions written to a JSON result file, never from a log.

Checked negative cases, with `docker` failing:
- the previous `rehearse.sh` (`5d3166c`) **exited 0** and printed `tables compared: 0`;
- the new `rehearse.sh` and `drill.sh` exit 1, naming the failed command.

With a missing image, `drill.sh` exits 1.

```
IMG=local/pneu-rc:162fe24 pneu/drill.sh pneu/results/drill-result-162fe24.json
IMG_OLD=local/pneu-rc:ea55329 IMG_NEW=local/pneu-rc:162fe24 pneu/rehearse.sh pneu/results/rehearse-result-ea55329-to-162fe24.json
```

The images:
1. Build the image from `git archive <sha>` with the production Dockerfile (in a sandbox, add the proxy CA only during the build).
2. `drill.sh` and `rehearse.sh` do the rest themselves: an internal network, a fresh `postgres:18` container, generated env files, and web + worker from the same image. The PHP scripts refuse any database other than host `pneu-rc-db` / database `mouhim_rc`.
3. `acceptance.php` (§2.3) is run by hand in the web container of such an environment; its result is `pneu/acceptance-result-162fe24.json`.
