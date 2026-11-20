# AMANZINE: release plan (#26, order and stock integrity)

**Status: PLAN ONLY. Separate pilot track.** Code approval does not imply go-live. Release gate: NEXUS #24.

| | SHA |
|---|---|
| Deployed (env `Amanzine`, service `balanced-growth`; staging the same) | `4ff08a99d4949a8d543ea8a41528da0331e8dbfb` |
| Candidate | `90d2a07760221bd5c2b729728fd3530c61572170` |
| Schema change | soft, additive columns on `orders`: `stock_committed_at`, `stock_released_at`, `stock_committed_items`. Applied by `migrate()` **at boot**. |

**Deploy behaviour (proven, read-only):** there is **no deploy trigger** on production or staging. `4ff08a9` sat on `main` for more than a day, then was deployed by a manual "patch". ⇒ **Merging #26 does not deploy.**

## 0. Owner decisions
1. Merge #26: yes or no (a merge deploys nothing).
2. **Staging first:** deploy `90d2a07` to the `staging` environment only (today it runs `4ff08a9`), with synthetic data and carriers in test or mock mode.
3. Policy for **orders approved before the migration**: they have no stock snapshot, so a cancel never restocks automatically. Who reviews them, and how?

## 1. Staging acceptance (before production)
- [ ] Deploy `90d2a07` to staging; boot applies the three columns; health OK.
- [ ] Synthetic orders:
  - approve, then edit lines (refused, 409);
  - cancel → restock once;
  - shipment event after a cancel (refused);
  - ship → deliver → no second delivery;
  - a service product with no stock is approved.
- [ ] **Carrier request timeout after acceptance must not create a second shipment**: the code never auto-retries an unknown result. Verify this with a mocked carrier and no real outbound call.
- [ ] No real WhatsApp, SMS, e-mail or carrier message from staging.

## 2. Production deploy (after staging is signed)
1. Deploy `90d2a07` by pinning it, as the previous deploys were done.
2. Watch boot `migrate()` (soft columns); health OK.
3. Verify:
   - recent orders keep their status and totals;
   - stock per product is unchanged by the deploy itself.

## 3. Rollback
- **Code-only rollback to `4ff08a9`** is possible: the new columns are nullable and ignored by old code.
- Orders approved or cancelled *after* the deploy carry snapshots that the old code does not use. After a rollback, their cancels follow the **old** behaviour (restock from lines). Review any such cancel by hand.
- **Stop conditions:**
  - negative stock;
  - an order approved without `stock_committed_items`;
  - a duplicate shipment or delivery;
  - any 5xx on approve, reject, ship or deliver.

## 4. Gap before any real-data go-live: **backups**
- `server/lib/backup.js` writes per-merchant JSON exports to `BACKUP_DIR`, or to a Railway volume.
- **Without one of them, the folder is temporary and wiped on every deploy.** The code says so explicitly.
- There is **no off-site copy and no restore procedure or drill** in the repository, unlike PNEU (`app:backup-restore`) and RENT CAR (`backup-drill`).
- Needed before go-live:
  - a durable off-Railway database backup (e.g. a scheduled `pg_dump` to external storage);
  - a documented restore into a new database;
  - a dated restore drill.
- Historical orders and external carrier reconciliation after the migration (gate item 6).
