// Diagnostic for NEXUS docs/33 AM-S04 / AM-S05 (AMANZINE @4ff08a99).
// Synthetic data only. Runs the real server locally with a scrubbed env (no proxy, no provider keys).
// Usage (see diagnostics/pilot-v1/RUNBOOK.md):
//   env -i PATH=... HOME=... [AMZ_DATABASE_URL=...] [NODE_BIN_DIR=...] node amanzine-am-s04-s05.mjs <amanzine2 repo dir> <port>
// The server process gets ONLY the variables below: no proxy, no provider keys (Cloudinary, OpenAI, WhatsApp, delivery).
// A refusal must be a 4xx business error; a 5xx counts as FAIL (a crash is not stock protection).
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [repo, port = '3999'] = process.argv.slice(2);
const BASE = `http://127.0.0.1:${port}`;
const env = {
  PATH: process.env.NODE_BIN_DIR ? `${process.env.NODE_BIN_DIR}:/usr/bin:/bin` : '/usr/local/bin:/usr/bin:/bin', HOME: process.env.AMZ_HOME || '/tmp/amz-home', PORT: port,
  DATABASE_URL: process.env.AMZ_DATABASE_URL || 'postgresql://amz:amz@127.0.0.1:5432/amz', PGSSLMODE: 'disable',
  JWT_SECRET: 'local-test-only-secret-0123456789abcdef', NODE_ENV: 'test',
};
const srv = spawn('node', ['server/index.js'], { cwd: repo, env });
let log = '';
srv.stdout.on('data', d => { log += d; }); srv.stderr.on('data', d => { log += d; });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function req(method, path, body, token, extra = {}) {
  const r = await fetch(BASE + path, {
    method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...extra },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null; try { j = await r.json(); } catch {}
  return { status: r.status, body: j };
}
for (let i = 0; i < 60; i++) { try { const r = await fetch(BASE + '/api/health'); if (r.status < 500) break; } catch {} await sleep(500); }

const stamp = Date.now();
const reg = await req('POST', '/api/auth/register', { name: 'TEST Merchant 01', email: `test.merchant.${stamp}@example.test`, password: 'test-password-123', storeName: 'Démo Vêtements' });
const T = reg.body?.token;
if (!T) { console.log(JSON.stringify({ fatal: 'register failed', reg }, null, 1)); srv.kill(); process.exit(2); }

async function product(stock, name) {
  const r = await req('POST', '/api/products', { name, price: 129.9, cost: 60, stock, status: 'published', category: 'TEST', sizes: ['M'], colors: ['Noir'] }, T);
  return r.body;
}
const stockOf = async id => (await req('GET', `/api/products/${id}`, null, T)).body?.stock;
async function order(p, qty) {
  const r = await req('POST', '/api/orders', { customerName: 'TEST Client 01', customerPhone: '+212600000001', items: [{ productId: p.id, productName: p.name, quantity: qty, price: 129.9 }], total: +(129.9 * qty).toFixed(2) }, T);
  return r;
}
const results = [];
const rec = (id, input, expected, observed, pass, note = '') => results.push({ id, input, expected, observed, result: pass ? 'PASS' : 'FAIL', note });

// A1 oversell: stock 2, order 3, approve
{ const p = await product(2, 'TEST T-shirt A1'); const o = await order(p, 3); const a = await req('PUT', `/api/orders/${o.body?.id}/approve`, {}, T); const s = await stockOf(p.id);
  rec('AM-S04-A1 oversell', 'stock=2; order qty=3; approve', 'approve refused with a 4xx business error (5xx = FAIL); stock stays 2', `create=${o.status}; approve=${a.status}; stock_after=${s}`, a.status >= 400 && a.status < 500 && s === 2); }
// A2 double approve: stock 5, order 2, approve twice
{ const p = await product(5, 'TEST T-shirt A2'); const o = await order(p, 2); const a1 = await req('PUT', `/api/orders/${o.body?.id}/approve`, {}, T); const s1 = await stockOf(p.id); const a2 = await req('PUT', `/api/orders/${o.body?.id}/approve`, {}, T); const s2 = await stockOf(p.id);
  rec('AM-S04-A2 double approve', 'stock=5; order qty=2; approve twice', '1st ok, stock 3; 2nd refused or no-op; stock stays 3', `approve1=${a1.status} stock=${s1}; approve2=${a2.status} stock=${s2}`, s1 === 3 && s2 === 3); }
// A3 reject after approve restores stock
{ const p = await product(5, 'TEST T-shirt A3'); const o = await order(p, 2); await req('PUT', `/api/orders/${o.body?.id}/approve`, {}, T); const s1 = await stockOf(p.id); const r = await req('PUT', `/api/orders/${o.body?.id}/reject`, { reason: 'TEST' }, T); const s2 = await stockOf(p.id);
  rec('AM-S05 reject after approve', 'stock=5; order qty=2; approve then reject', 'stock 3 after approve, back to 5 after reject', `after_approve=${s1}; reject=${r.status}; after_reject=${s2}`, s1 === 3 && s2 === 5); }
// A4 out of stock at order creation (merchant-side order)
{ const p = await product(0, 'TEST T-shirt A4'); const o = await order(p, 1);
  rec('AM-S04-A4 order on zero stock', 'stock=0; create order qty=1', 'refused, or accepted only as pending and refused at approve', `create=${o.status}`, true, 'informational: creation itself may legitimately stay pending');
  const a = await req('PUT', `/api/orders/${o.body?.id}/approve`, {}, T); const s = await stockOf(p.id);
  rec('AM-S04-A4b approve on zero stock', 'stock=0; approve qty=1', 'approve refused with a 4xx business error (5xx = FAIL); stock 0', `approve=${a.status}; stock_after=${s}`, a.status >= 400 && a.status < 500 && s === 0); }
// A5 concurrency: stock 1, two orders qty 1, approve both at once
{ const p = await product(1, 'TEST T-shirt A5'); const o1 = await order(p, 1); const o2 = await order(p, 1);
  const [a1, a2] = await Promise.all([req('PUT', `/api/orders/${o1.body?.id}/approve`, {}, T), req('PUT', `/api/orders/${o2.body?.id}/approve`, {}, T)]);
  const s = await stockOf(p.id); const ok = [a1, a2].filter(x => x.status < 300).length;
  rec('AM-S04-A5 concurrent last unit', 'stock=1; 2 orders qty=1; approve both concurrently', 'exactly one approved; stock 0; never negative', `approve_statuses=${a1.status},${a2.status}; approved=${ok}; stock_after=${s}`, ok === 1 && s === 0); }
rec('AQ-AM-01 last unit of a size', 'stock per size', 'one order wins per size', 'per-size stock does not exist (single products.stock)', false, 'BLOCKED — not executable');
results[results.length - 1].result = 'BLOCKED';

const outbound = (log.match(/(cloudinary|openai|graph\.facebook|promo|amana|whatsapp|smtp|ECONNREFUSED|ENOTFOUND|fetch failed)/gi) || []);
console.log(JSON.stringify({ base: BASE, results, server_log_external_mentions: [...new Set(outbound.map(x => x.toLowerCase()))] }, null, 1));
writeFileSync(process.env.LOG_OUT || '/tmp/amanzine-server.log', log);
srv.kill();
