import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeObservation,summarizeObservations} from '../src/observations.mjs';
const now=new Date('2026-11-17T12:00:00Z');
const good={app_id:'pneu-mouhim',environment:'production',provider:'github',kind:'repository',resource_ref:'hdnkabour-gif/Pneumatiques-MOUHIM',state:'healthy',observed_at:'2026-11-17T11:59:00Z'};
test('explicit allowlist drops provider secrets and personal data',()=>{
 const r=normalizeObservation({...good,auth_token:'NEVER_EXPORT',email:'private@example.com',raw_error:'Sensitive log'},now);
 assert.equal(r.auth_token,undefined);
 assert.equal(r.email,undefined);assert.equal(r.raw_error,undefined);assert.equal(r.stale,false);
});
test('stale but nominally healthy observation becomes UNKNOWN',()=>{
 const r=summarizeObservations([{...good,observed_at:'2026-11-17T09:00:00Z'}],'pneu-mouhim','production',now);
 assert.equal(r.state,'unknown');assert.equal(r.stale_count,1);
});
test('down resource dominates healthy',()=>{
 const r=summarizeObservations([good,{...good,provider:'railway',kind:'service',resource_ref:'app',state:'down'}],'pneu-mouhim','production',now);
 assert.equal(r.state,'down');
});
test('newest provider report wins and duplicates are dropped',()=>{
 const old={...good,observed_at:'2026-11-17T11:58:00Z',state:'down'};
 const r=summarizeObservations([good,old],'pneu-mouhim','production',now);
 assert.equal(r.state,'healthy');assert.equal(r.observed_count,1);
});
test('app and environment scoping cannot leak across products',()=>{
 const r=summarizeObservations([good,{...good,app_id:'amanzine',state:'down'},{...good,environment:'staging',state:'down'}],'pneu-mouhim','production',now);
 assert.equal(r.observed_count,1);assert.equal(r.state,'healthy');
});
test('missing observations are UNKNOWN, never success',()=>assert.equal(summarizeObservations([],'pneu-mouhim','production',now).state,'unknown'));
test('future timestamps and malformed observation rejected',()=>{
 assert.throws(()=>normalizeObservation({...good,observed_at:'2030-01-01T00:00:00Z'},now));
 assert.throws(()=>normalizeObservation({...good,provider:'untrusted_host'},now));
});
