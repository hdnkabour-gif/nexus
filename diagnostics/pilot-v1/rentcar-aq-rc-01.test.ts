// NEXUS diagnostic AQ-RC-01 / RC-S05 (RC-03). Synthetic data only.
// Stored in NEXUS as evidence; to run it, COPY it into rent-car-app/server/test/ (it imports that repo's ./helpers.js). See RUNBOOK.md.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createUser, CSRF, loginAgent, resetDatabase, setupTestApp, type TestContext } from './helpers.js';
let ctx: TestContext;
beforeAll(async () => { ctx = await setupTestApp(); });
afterAll(async () => { await ctx.pool.end(); });
const at = (days: number, hour = 10) => { const d = new Date(Date.now() + days * 86400_000); return `${d.toISOString().slice(0, 10)}T${String(hour).padStart(2, '0')}:00`; };
describe('AQ-RC-01', () => {
  it('rent 100 + late 20 paid 120, fee waived: expect one refund of 20, net 100, deposit untouched', async () => {
    await resetDatabase(ctx.pool);
    const m = await createUser(ctx.pool, { email: 'm@example.test', role: 'manager', fullName: 'TEST Gérant' });
    const e = await createUser(ctx.pool, { email: 'e@example.test', role: 'employee', fullName: 'TEST Employé' });
    const manager = await loginAgent(ctx.app, m.email, m.password);
    const cas = (await manager.post('/api/branches').set(CSRF).send({ code: 'CAS', name: 'TEST Casablanca', city: 'Casablanca' })).body.id;
    await manager.put(`/api/users/${e.id}/branches`).set(CSRF).send({ branchIds: [cas] }).expect(204);
    const employee = await loginAgent(ctx.app, e.email, e.password);
    const v = (await manager.post('/api/vehicles').set(CSRF).send({ branchId: cas, plate: 'TEST-01-A', make: 'Dacia', model: 'Logan', fuelType: 'diesel', transmission: 'manual', mileageKm: 1000, dailyRateCents: 10000, depositCents: 50000 }).expect(201)).body.id;
    await manager.post(`/api/vehicles/${v}/transitions`).set(CSRF).send({ to: 'available', expectedStatus: 'inspection_pending', mileageKm: 1000, fuelEighths: 8, cleaned: true }).expect(200);
    const client = (await manager.post('/api/customers').set(CSRF).send({ fullName: 'TEST Client 01', phone: '0600000001', birthDate: '1990-01-01', idDocType: 'cin', idDocNumber: 'TEST000001', licenceNumber: 'TEST-L-1', licenceIssueDate: '2015-01-01' }).expect(201)).body.customer.id;
    const r = (await employee.post('/api/reservations').set(CSRF).send({ customerId: client, vehicleId: v, start: at(0, 0), end: at(0, 23) }).expect(201)).body.reservation;
    const k = (await employee.post('/api/contracts/checkout').set(CSRF).send({ reservationId: r.id, kmOut: 1000, fuelOut: 8, washedOut: true, documentsOut: ['Carte grise'], payments: [{ kind: 'deposit_in', method: 'cash', amountCents: 50000 }] }).expect(201)).body.contract;
    await ctx.pool.query(`UPDATE contracts SET out_at = now() - interval '2 days', planned_end_at = now() - interval '2 hours' WHERE id = $1`, [k.id]);
    await employee.post(`/api/contracts/${k.id}/checkin`).set(CSRF).send({ kmIn: 1100, fuelIn: 8 }).expect(200);
    const charged = (await manager.post(`/api/contracts/${k.id}/late-fee`).set(CSRF).send({ decision: 'charge', unit: 'hour', quantity: 1, unitCents: 2000 })).body;
    const paidRes = await manager.post(`/api/contracts/${k.id}/payments`).set(CSRF).send({ kind: 'rental', method: 'cash', amountCents: k.totalCents + 2000 });
    const waive = await manager.post(`/api/contracts/${k.id}/late-fee`).set(CSRF).send({ decision: 'waive', reason: 'TEST geste commercial' });
    const after = (await manager.get(`/api/contracts/${k.id}`).expect(200)).body;
    // Try every plausible way to record ONE partial refund of 2000:
    const tries: Record<string, number> = {};
    for (const kind of ['refund', 'rental_refund', 'rental_out']) tries[kind] = (await manager.post(`/api/contracts/${k.id}/payments`).set(CSRF).send({ kind, method: 'cash', amountCents: 2000, reason: 'TEST' })).status;
    tries['rental negative'] = (await manager.post(`/api/contracts/${k.id}/payments`).set(CSRF).send({ kind: 'rental', method: 'cash', amountCents: -2000 })).status;
    const final = (await manager.get(`/api/contracts/${k.id}`).expect(200)).body;
    console.log('AQ-RC-01 OBSERVED', JSON.stringify({ rentCents: k.totalCents, charge_status: charged?.contract?.late?.status, chargedTotal: charged?.contract?.totalCents, pay_status: paidRes.status, waive_status: waive.status, waive_error: waive.body?.error?.code, total_after_waive: after.contract?.totalCents, balances_after_waive: after.balances, refund_attempt_statuses: tries, payments: final.payments.map((p: any) => ({ kind: p.kind, amountCents: p.amountCents })), deposit: final.balances }));
    // Acceptance (Astra): exactly one refund entry of 2000, net collected = rent, deposit held unchanged.
    // Exact financial invariants (Codex P2 review): amount, balances and deposit must all hold.
    const refunds = final.payments.filter((p: any) => /refund|_out$/.test(p.kind) && p.kind !== 'deposit_out');
    expect(refunds.length).toBe(1);
    expect(refunds[0].amountCents).toBe(2000);
    expect(final.balances.totalCents).toBe(k.totalCents);          // 10000: rent only after the waiver
    expect(final.balances.paidCents - 2000).toBe(k.totalCents);    // net collected 10000
    expect(final.balances.restCents).toBe(0);
    expect(final.balances.depositHeldCents).toBe(50000);           // deposit untouched
    expect(final.balances.depositReturnedCents).toBe(0);
    expect(final.balances.depositKeptCents).toBe(0);
  });
});
