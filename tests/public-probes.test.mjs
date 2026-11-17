import test from 'node:test';import assert from 'node:assert/strict';
import {publicProbeTargets,probeHttp} from '../lib/public-probes.js';
test('only verified domains are in bounded allowlist and sensitive targets omitted',()=>{
 const targets=publicProbeTargets();assert.equal(targets.length,5);
 for(const x of targets)assert.match(x.host,/^[a-z0-9.-]+\.up\.railway\.app$/);
 assert.ok(!targets.some(x=>x.app_id==='tech-platform'));
});
test('HTTP probe uses fixed https host, manual redirect, no response body',async()=>{
 const target=publicProbeTargets()[0];let url,opts;
 const r=await probeHttp(target,{fetchImpl:async (u,o)=>{url=u;opts=o;return {status:302};},now:(()=>{let x=1000;return()=>x+=21;})()});
 assert.equal(url,'https://'+target.host+'/');
 assert.equal(opts.method,'GET');assert.equal(opts.redirect,'manual');
 assert.equal(r.state,'reachable');assert.equal(r.status_code,302);
 assert.equal(JSON.stringify(r).includes('Set-Cookie'),false);
});
test('network error stays unknown, 502 is a HTTP failure, 401 proves response only',async()=>{
 const t=publicProbeTargets()[0];
 assert.equal((await probeHttp(t,{fetchImpl:async()=>{throw Error('secret');}})).state,'unknown');
 assert.equal((await probeHttp(t,{fetchImpl:async()=>({status:502})})).state,'unreachable');
 assert.equal((await probeHttp(t,{fetchImpl:async()=>({status:401})})).state,'reachable');
});
test('arbitrary URL SSRF and re-targeting fail closed',async()=>{
 const t=publicProbeTargets()[0];
 await assert.rejects(()=>probeHttp({...t,host:'localhost'}));
 await assert.rejects(()=>probeHttp({...t,host:'169.254.169.254'}));
});
