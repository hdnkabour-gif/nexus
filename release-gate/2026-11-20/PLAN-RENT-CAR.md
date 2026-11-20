# RENT CAR: release plan (#37, RC-03 partial rental refund)

**Status: PLAN ONLY.** Nothing below is authorised until the owner signs §0. Release gate: NEXUS #24.

| | SHA |
|---|---|
| Deployed (env `production`, service `rent-car-app`) | `781ab81386c36eb17af5a55119e6f86909603f81` |
| Candidate | `a6516817dcdacd303b766878f3f2c199f4f02a35` |
| Migration | `0020_rental_refunds`: additive (the kind list grows, a nullable `refunds_id`, checks, the permission `payments.refund` for manager only, not grantable). It runs **at boot** (`start` runs `migrate.js`). |

**Deploy behaviour (proven, read-only):**
- **No deploy trigger.** The watch pattern is `__railway_manual_approval_required__`.
- A push to `main` was `SKIPPED`; deploys were manual "patch" deploys.
- ⇒ **Merging #37 does not deploy.** A deploy happens only when someone deploys the new SHA, and that deploy migrates the database.
- The current Railway service is a demo / synthetic environment. It is not a real-client host until the owner says so.

## 0. Owner decisions
1. **D-052** (refund policy: manager only, a reason is required, bounded by the overpaid amount and by what is left on the receipt). Today it is **Proposed**.
2. **Accountant acceptance of the CSV change:** outgoing amounts are negative, including `deposit_out`, and a new `Rubrique` column is added.
3. Merge #37: yes or no. A merge alone deploys nothing.
4. Deploy window and release manager.

## 1. Before deploying
- [ ] `main` is still `781ab81`; otherwise rerun CI on the merge result.
- [ ] **Off-site backup taken and the drill run against the real off-site target** (`npm run backup` then `npm run backup-drill`). The same procedure passed locally on `a651681`, with 10/10 negative checks (`rent-car/drill-report-a651681.json`). (#14)
- [ ] Record the baseline (read-only):
  - cash of the day per branch;
  - per-contract balances, as a sample;
  - the payments CSV for the current month.

## 2. Deploy
1. Deploy `a6516817…` on the service by pinning it, as the previous deploys were done.
2. Watch the start: `migrate.js` must apply exactly `0020_rental_refunds`.

## 3. Verification
- [ ] Railway shows `a651681`, `SUCCESS`; `/api/health` OK.
- [ ] The baseline from §1 is unchanged: cash of each past day, closed days with `changedSince: false`, contract balances.
- [ ] Manager-only check: the employee does not see a refund action, and the API returns 403 (proven in tests).
- [ ] The **new CSV** is downloaded and handed to the accountant (format change).

## 4. Rollback
- **Code-only rollback to `781ab81`** is possible as long as **no `rental_refund` row exists**. The old code does not know that kind, and its balances would ignore such a row.
- Once a refund has been recorded, do not roll back the code. Fix forward, or reverse the refund through the app first (append-only), then roll back.
- **DB restore:** only into a new database first (`restore-backup`), then reconcile; the owner decides any switch.
- **Stop conditions:**
  - any change to a closed day or to past balances;
  - a migration other than `0020`;
  - an employee able to refund.

## 5. Before real customer data
- [ ] D-052 accepted; the accountant has accepted the CSV.
- [ ] An off-site restore against the real target proven and dated (#14), including contracts' documents and attachments, plus access isolation between branches.
- [ ] Operating environment approved by the owner, and acceptance by the company manager.
