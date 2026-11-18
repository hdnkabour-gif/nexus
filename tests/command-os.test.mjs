import test from 'node:test';
import assert from 'node:assert/strict';
import {scopeHttp,summarizeHttpPortfolio} from '../lib/command-os.js';
const appA={app_id:'pneu-mouhim'},appB={app_id:'tech-platform'},appC={app_id:'amanzine'};
const known=[
 {app_id:'pneu-mouhim',environment:'production',host:'pneu.example.invalid'},
 {app_id:'pneu-mouhim',environment:'staging',host:'pneu-staging.example.invalid'},
 {app_id:'amanzine',environment:'staging',host:'amanzine-staging.example.invalid'}
];
const now=Date.parse('2026-11-18T12:00:00Z');
const observation=(app_id,environment,host,state,minutes=1)=>({app_id,environment,host,state,measured_at:new Date(now-minutes*60_000).toISOString(),stale:false});
test('No static snapshots, no fresh probes means UNKNOWN not healthy',()=>{
 const s=summarizeHttpPortfolio([appA,appB,appC],[],known,now);
 assert.equal(s.appProfiles,3);
 assert.equal(s.appsWithProbes,2);
 assert.equal(s.freshCount,0);
 assert.equal(s.grouped[1].status,'unknown');
 assert.equal(s.grouped[0].status,'unknown');
});
test('A single reachable URL does not imply the whole app is healthy',()=>{
 const x=scopeHttp(appA,[observation('pneu-mouhim','production','pneu.example.invalid','reachable')],known,now);
 assert.equal(x.status,'warning');
 assert.equal(x.verified,1);
 assert.equal(x.total,2);
 assert.notEqual(x.label,'سليم');
});
test('Recent HTTP 5xx must be reported as HTTP error even if another target replies',()=>{
 const checks=[
 observation('pneu-mouhim','production','pneu.example.invalid','reachable'),
 observation('pneu-mouhim','staging','pneu-staging.example.invalid','unreachable')
 ];
 const x=scopeHttp(appA,checks,known,now);
 assert.equal(x.status,'critical');
 assert.equal(x.httpErrors,1);
 assert.equal(summarizeHttpPortfolio([appA],checks,known,now).httpErrors,1);
});
test('Stale evidence is downgraded to unknown, and unmonitored apps stay unknown',()=>{
 const stale=observation('pneu-mouhim','production','pneu.example.invalid','reachable',21);
 const s=scopeHttp(appA,[stale,observation('pneu-mouhim','staging','pneu-staging.example.invalid','reachable',30)],known,now);
 assert.equal(s.status,'unknown');
 assert.equal(s.verified,0);
 assert.equal(scopeHttp(appB,[],known,now).status,'unknown');
});
test('Only fresh, fully covered reachable endpoints get HTTP-response label (not business health)',()=>{
 const x=scopeHttp(appA,[
 observation('pneu-mouhim','production','pneu.example.invalid','reachable'),
 observation('pneu-mouhim','staging','pneu-staging.example.invalid','reachable')
 ],known,now);
 assert.equal(x.status,'connected');
 assert.match(x.label,/HTTP/);
 assert.doesNotMatch(x.label,/سليم|صحي|Healthy/);
});
test('Other application target measurements cannot contaminate an app state',()=>{
 const x=scopeHttp(appA,[observation('amanzine','staging','amanzine-staging.example.invalid','unreachable')],known,now);
 assert.equal(x.status,'unknown');
});
