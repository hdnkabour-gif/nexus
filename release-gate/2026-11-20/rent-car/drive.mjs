// Drives the candidate RENT CAR server (127.0.0.1 only) to write synthetic books for the drill.
import { readFileSync } from 'node:fs';
import pg from 'pg';
const BASE = process.env.BASE, DB = process.env.DATABASE_URL;
const pw = readFileSync(process.env.SEED_OUT, 'utf8').split('\n').find((l) => l.includes('manager@example.test')).match(/password:\s*(\S+)/)[1];
let cookie = '';
async function api(method, path, body, headers = {}) {
  const isBuf = Buffer.isBuffer(body);
  const r = await fetch(BASE + path, { method, headers: { 'X-Requested-With': 'fleetora', ...(isBuf ? {} : { 'content-type': 'application/json' }), cookie, ...headers }, body: body === undefined ? undefined : isBuf ? body : JSON.stringify(body) });
  const sc = r.headers.getSetCookie?.() ?? []; if (sc.length) cookie = sc.map((c) => c.split(';')[0]).join('; ');
  const j = await r.json().catch(() => ({})); if (r.status >= 400) throw new Error(`${method} ${path} -> ${r.status} ${JSON.stringify(j)}`); return j;
}
const at = (days, hour) => { const d = new Date(Date.now() + days * 86400000); return `${d.toISOString().slice(0, 10)}T${String(hour).padStart(2, '0')}:00`; };
await api('POST', '/api/auth/login', { email: 'manager@example.test', password: pw });
const branches = await api('GET', '/api/branches'); const cas = (branches.items ?? branches).find((b) => b.code === 'CAS').id;
const vehicles = await api('GET', `/api/vehicles?branchId=${cas}`); const v = (vehicles.items ?? vehicles).find((x) => x.status === 'available');
const client = (await api('POST', '/api/customers', { fullName: 'TEST Client Drill', phone: '0600000077', birthDate: '1990-01-01', idDocType: 'cin', idDocNumber: 'TEST000077', licenceNumber: 'TEST-L-77', licenceIssueDate: '2015-01-01' })).customer.id;
const r = (await api('POST', '/api/reservations', { customerId: client, vehicleId: v.id, start: at(0, 0), end: at(0, 23) })).reservation;
const k = (await api('POST', '/api/contracts/checkout', { reservationId: r.id, kmOut: v.mileageKm, fuelOut: 8, washedOut: true, documentsOut: ['Carte grise'], payments: [{ kind: 'deposit_in', method: 'cash', amountCents: 50000 }] })).contract;
const pool = new pg.Pool({ connectionString: DB, max: 1 });
await pool.query(`UPDATE contracts SET out_at = now() - interval '2 days', planned_end_at = now() - interval '2 hours' WHERE id = $1`, [k.id]);
await api('POST', `/api/contracts/${k.id}/checkin`, { kmIn: v.mileageKm + 100, fuelIn: 8 });
await api('POST', `/api/contracts/${k.id}/late-fee`, { decision: 'charge', unit: 'hour', quantity: 1, unitCents: 2000 });
await api('POST', `/api/contracts/${k.id}/payments`, { kind: 'rental', method: 'cash', amountCents: k.totalCents + 2000 });
await api('POST', `/api/contracts/${k.id}/late-fee`, { decision: 'waive', reason: 'TEST geste commercial' });
const receipt = (await api('GET', `/api/contracts/${k.id}`)).payments.find((p) => p.kind === 'rental');
await api('POST', `/api/contracts/${k.id}/payments/${receipt.id}/refund`, { amountCents: 2000, method: 'cash', reason: 'TEST pénalité annulée' });
const refund = (await api('GET', `/api/contracts/${k.id}`)).payments.find((p) => p.kind === 'rental_refund');
await api('POST', `/api/contracts/${k.id}/payments/${refund.id}/reverse`, { reason: 'TEST saisi par erreur' });
await api('POST', `/api/contracts/${k.id}/payments`, { kind: 'deposit_out', method: 'cash', amountCents: 50000 });
const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 10 10]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
const f = await api('POST', '/api/cash/expenses/receipt', pdf, { 'content-type': 'application/pdf', 'x-file-name': 'test-ticket.pdf' });
await api('POST', '/api/cash/expenses', { branchId: cas, category: 'office', amountCents: 700, method: 'cash', receiptFileId: f.fileId });
const detail = await api('GET', `/api/contracts/${k.id}`);
console.log(JSON.stringify({ contract: k.number, balances: detail.balances, kinds: detail.payments.map((p) => p.kind) }));
await pool.end();
