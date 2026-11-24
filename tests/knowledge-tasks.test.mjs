import test from 'node:test';
import assert from 'node:assert/strict';
import {TASKS,readTask,createTaskReader} from '../lib/knowledge-tasks.js';
import {RELATIONS} from '../lib/knowledge-relations.js';
import {readFileSync} from 'node:fs';
import {APPLICATIONS,knowledge,filterKnowledge} from '../lib/knowledge.js';
const now=()=>Date.parse('2026-11-24T18:00:00Z');
const response=t=>({ok:true,json:async()=>({number:t.number,html_url:'https://github.com/'+t.repo+'/'+(t.type==='pulls'?'pull':'issues')+'/'+t.number,state:'closed',updated_at:'2026-11-24T17:00:00Z',merged:true,head:{sha:'a'.repeat(40)},body:'NEVER_EXPORT',user:{login:'NEVER_EXPORT'}})});
test('allowlisted task reader exposes metadata only and rejects unknown sources',async()=>{
 const t=TASKS.find(t=>t.type==='pulls');
 const r=await readTask(t,{now,fetchImpl:async(url,opts)=>{
  assert.equal(url,'https://api.github.com/repos/'+t.repo+'/pulls/'+t.number);
  assert.equal(opts.method,'GET');assert.equal(opts.redirect,'error');assert.equal(opts.headers.Authorization,undefined);
  return response(t);
 }});
 assert.equal(r.state,'MERGED');assert.equal(r.head_sha,'a'.repeat(40));
 assert.doesNotMatch(JSON.stringify(r),/NEVER_EXPORT/);
 await assert.rejects(readTask({...t},{now,fetchImpl:async()=>{throw new Error('unexpected');}}),/allowlisted/);
});
test('unavailable or invalid provider becomes UNKNOWN',async()=>{
 const t=TASKS[0];
 for(const f of [async()=>({ok:false,status:429}),async()=>{throw new Error('network');},async()=>({ok:true,json:async()=>({number:t.number,state:'open'})})]){
  const r=await readTask(t,{now,fetchImpl:f});assert.equal(r.state,'UNKNOWN');assert.equal(r.updated_at,null);
 }
});
test('single-flight cache avoids repeated requests and refreshes after expiry',async()=>{
 let calls=0,time=now();const reader=createTaskReader({now:()=>time,ttlMs:100,fetchImpl:async(url)=>{calls++;const t=TASKS.find(t=>url.endsWith('/'+t.repo+'/'+t.type+'/'+t.number));return response(t);}});
 const [a,b]=await Promise.all([reader(),reader()]);assert.equal(a,b);assert.equal(calls,TASKS.length);
 await reader();assert.equal(calls,TASKS.length);time+=101;await reader();assert.equal(calls,2*TASKS.length);
});
test('relationships resolve canonical IDs and known project IDs',()=>{
 for(const r of RELATIONS){assert.ok(knowledge.some(x=>x.id===r.id&&x.kind==='relationship'));assert.ok(r.apps.every(a=>Object.hasOwn(APPLICATIONS,a)));assert.equal(new Set(r.apps).size,r.apps.length);}
});

test('project filters include relevant cross-project reuse patterns',()=>{
 const rows=filterKnowledge(knowledge,{app:'rent-car',kind:'relationship'});
 assert.ok(rows.some(x=>x.id==='RU-04'));
 assert.ok(rows.every(x=>RELATIONS.find(r=>r.id===x.id).apps.includes('rent-car')));
 assert.equal(filterKnowledge(knowledge,{app:'nexora',kind:'relationship'}).map(r=>r.id).join(','),'RU-06');
 assert.ok(filterKnowledge(knowledge,{q:'Rent Car',kind:'relationship'}).some(r=>r.id==='RU-04'));
});
test('protected page connects task metadata and relationships after authentication',()=>{
 const source=readFileSync(new URL('../app/console/knowledge/page.jsx',import.meta.url),'utf8');
 assert.ok(source.indexOf("if(!session)redirect('/login')")<source.indexOf('await readKnowledgeTasks()'));
 assert.ok(source.indexOf("if(session.must_change_password)redirect('/owner/setup')")<source.indexOf('await readKnowledgeTasks()'));
 assert.match(source,/shownTasks\.map/);
 assert.match(source,/relationApps\(r.id\)/);
 assert.match(source,/t\.source_url/);
 assert.match(source,/t\.observed_at/);
 assert.match(source,/relationship:/);
 assert.match(source,/technology:/);
});

test('historical risk scope is searchable without rewriting canonical IDs',()=>{
 const rows=filterKnowledge(knowledge,{app:'pneu-mouhim',kind:'risk'});
 assert.deepEqual(rows.map(r=>r.id).sort(),['R-003','R-008']);
 assert.ok(rows.every(r=>r.app_id==='nexus'&&r.status==='HISTORICAL'));
 assert.equal(filterKnowledge(knowledge,{app:'school-platform',kind:'risk'}).length,0);
});
