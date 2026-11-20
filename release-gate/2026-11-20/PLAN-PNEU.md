# PNEU MOUHIM: release plan (#22 → #23 → #24)

**Status: PLAN ONLY.** Nothing below is authorised until the owner signs §0. Release gate: NEXUS #24.

| | SHA |
|---|---|
| Deployed (app **and** worker, env `mouhim`) | `ea55329fa3cf77ee5f4343ed627b1e8b9aa187a2` |
| Candidate (final tree after #22, #23, #24) | `162fe2441266c8443d205ad2acc3b1d03e001bed` |
| Migrations in the release | `2026_11_20_100000_add_idempotency_to_payments` only (additive: two nullable columns plus a unique index) |

## 0. Owner decisions (none taken yet)
1. **Release manager / on-call** and a **business approver**. The owner may be both.
2. **Deploy window**: a quiet time, outside cash-closing hours, with nobody entering sales.
3. **How to avoid three intermediate deploys.** The app and worker have a deploy trigger on `main` with `checkSuites: false`, so every push deploys at once (see `railway-deploy-triggers.json`). Choose one:
   - **A (recommended): one fast-forward push.** Inside the window, push `main` from `ea55329` to `162fe24` in a **single** push: `git push origin 162fe2441266c8443d205ad2acc3b1d03e001bed:main`, with no force, since this is a fast-forward.
     - `main` is exactly the chain's merge-base, so this push is one deploy of the approved tree.
     - GitHub marks #22, #23 and #24 as merged because their commits are now in `main`.
     - Do **not** use the PR merge buttons for this option: each button is its own push, and so its own deploy.
     - Needs the owner's GitHub action, or explicit approval for me to do it.
   - **B:** temporarily **disconnect the `main` trigger** on app and worker (a Railway change that needs explicit approval), merge the three PRs normally, then deploy once by pinning both services to the final `main` SHA, then restore the trigger.
   - Do **not** merge #22, then #23, then #24 one at a time with the trigger active. Merging #23 alone migrates the live DB with the chain half-done.
4. **Invoice numbering:** confirm the next paper invoice number (`FA-{YEAR}-{NUMBER}`, padding 6) on the *Document Numbering* page before any real sale.
5. **Real data stays forbidden** until §5 is complete.

## 1. Before the window (no production change)
- [ ] GitHub: #22, #23 and #24 are still on the approved heads with CI green; `main` is still `ea55329`. If `main` moved, rerun CI on the combined result and repeat the isolated acceptance (`README.md` §2).
- [ ] **Off-Railway backup taken just before the window**, and the restore proven against the **real R2 target** with the procedure of §2.4 (`app:backup-restore --into`, compare figures and `stock:verify`). Record the archive name and SHA-256. (#13)
- [ ] Record the pre-deploy **business baseline** (read-only):
  - cash of the day per site;
  - customer debt totals;
  - stock per site;
  - `stock:verify`;
  - `app:go-live-audit` signature.

## 2. In the window
1. Announce a stop on cash operations for about 10 minutes, so no sale or receipt runs during the deploy.
2. Apply the option chosen in §0.3. Expected result: **one** deployment of `162fe24` for the app **and** the worker.
3. Watch the web start: `migrate --force` must apply exactly `2026_11_20_100000_add_idempotency_to_payments`. The seeders re-run, which is normal (reference data only).

## 3. Verification (go / no-go)
- [ ] Railway shows `162fe24` for the app **and** the worker, both `SUCCESS`.
- [ ] Login page 200; `stock:verify` consistent.
- [ ] Business baseline from §1 unchanged (cash, debt, stock).
- [ ] One synthetic smoke receipt is **not** done in production. Instead, an operator checks the screens (sale, receipt form with its hidden key, cash desk).
- [ ] The worker consumes the queue, with no new failed jobs.

## 4. Rollback
- **Code-only rollback is safe for this release.** The migration is additive, and the rehearsal ran `ea55329` on the migrated schema with identical figures (`README.md` §2.3). Redeploy `ea55329` to app **and** worker. The new columns stay unused; no DB rollback is needed.
- **DB restore** only on proven data damage: restore the pre-window backup **into a new database** first (`--into`), reconcile, and only then decide, as the owner, whether to switch. Never `--replace-current` without the owner.
- **Stop conditions:**
  - any unexplained difference in cash, debt or stock;
  - a migration other than the expected one;
  - app and worker on different SHAs;
  - a failed job;
  - a 5xx on the main screens.

## 5. Before any real customer data (separate decision)
- [ ] §3 passed and recorded (SHAs, deployment IDs, baseline before and after).
- [ ] Off-Railway restore against the real R2 target proven and dated (#13), plus scheduled backup evidence (a daily `backup:run` and a monitor alert).
- [ ] Next invoice number confirmed by the owner (§0.4).
- [ ] Photo access control checked.
- [ ] Operator acceptance on staging or production with synthetic data:
  - sale, credit note, receipt, close;
  - transfers DEP / M01 / M02, including a discrepancy;
  - signed by the owner.
- [ ] `app:go-live-audit --strict` passes after the agreed cleanup, run on a **restored copy** first.
