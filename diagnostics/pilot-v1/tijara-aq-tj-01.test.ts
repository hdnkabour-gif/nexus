// NEXUS diagnostic for NEXUS docs/33 AQ-TJ-01. Synthetic data only.
// Stored in NEXUS as evidence; to run it, COPY it into tijara-os/test/ (it uses that repo's test helpers). See RUNBOOK.md.
import { describe, expect, it } from 'vitest';
import { withTenant } from '../src/db.js';
import { reconcile } from '../src/inventory.js';
import { runProduction } from '../src/production.js';
import { createOrder, confirmOrder, weighLine, startPreparation, markReady, payOrder } from '../src/sales.js';
import { balance, cmd, items, newTenant, q, runtime, stock } from './helpers.js';
const kg = (sku: string, price = 0) => ({ sku, name: sku, kind: 'goods' as const, trackQuantity: true, fulfillment: 'stock' as const, baseUom: 'kg', price });
describe('AQ-TJ-01 production then weighed sale', () => {
  it('kafta 3.13 left, waste once, raw -5 once; tenant B sees nothing', async () => {
    const t = await newTenant();
    const ids = await items(t, { beef: kg('BEEF', 130), kafta: kg('KAFTA', 130), grill: { sku: 'GRILL', name: 'Grilling', kind: 'service', trackQuantity: false, fulfillment: 'none', price: 20 } as any });
    await stock(t, ids.beef, 5, 100);
    const pr = await cmd(t.ctx(), (cc) => runProduction(cc, { branchId: t.branchId, type: 'transform', inputs: [{ itemId: ids.beef, qty: 5 }], outputs: [{ itemId: ids.kafta, qty: 4.6 }], waste: [{ qty: 0.4, reason: 'TEST bones' }] }));
    const ctx = t.ctx(t.cashierUserId);
    const { orderId, lineIds } = await cmd(ctx, (cc) => createOrder(cc, { branchId: t.branchId, lines: [{ itemId: ids.kafta, qty: 1.5, prepRequired: true }, { itemId: ids.grill, qty: 1.5 }] }));
    await cmd(ctx, (cc) => confirmOrder(cc, orderId));
    await cmd(ctx, async (cc) => { await weighLine(cc, orderId, lineIds[0], 1.47); await weighLine(cc, orderId, lineIds[1], 1.47); });
    await cmd(ctx, (cc) => startPreparation(cc, orderId));
    await cmd(ctx, (cc) => markReady(cc, orderId));
    const paid = await cmd(ctx, (cc) => payOrder(cc, { orderId, payments: [{ method: 'cash', amount: 220.5 }] }));
    expect(await balance(t, ids.beef)).toMatchObject({ onHand: 0 });
    expect(await balance(t, ids.kafta)).toMatchObject({ onHand: 3.13, reserved: 0 });
    expect(await q(t, `SELECT qty FROM production_lines WHERE production_order_id=$1 AND kind='waste'`, [pr.productionOrderId])).toHaveLength(1);
    const beefMv = await q(t, `SELECT qty_delta FROM stock_movements WHERE item_id=$1 AND qty_delta::numeric < 0`, [ids.beef]);
    expect(beefMv.map((m: any) => Number(m.qty_delta))).toEqual([-5]);
    const kaftaMv = (await q(t, `SELECT qty_delta FROM stock_movements WHERE item_id=$1`, [ids.kafta])).map((m: any) => Number(m.qty_delta)).sort();
    expect(kaftaMv).toEqual([-1.47, 4.6]);
    expect(paid).toMatchObject({ total: 220.5, paid: 220.5, due: 0 });
    expect(await withTenant(runtime, t.ctx(), (c) => reconcile(c))).toEqual([]);
    const other = await newTenant();
    const leak = await q(other, `SELECT count(*)::int AS n FROM stock_movements WHERE item_id=$1`, [ids.kafta]);
    const leakItems = await q(other, `SELECT count(*)::int AS n FROM items WHERE id=$1`, [ids.kafta]);
    console.log('AQ-TJ-01 ISOLATION', JSON.stringify({ movements: leak[0].n, items: leakItems[0].n }));
    expect(leak[0].n).toBe(0); expect(leakItems[0].n).toBe(0);
  });
});
