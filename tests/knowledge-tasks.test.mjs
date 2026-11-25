import test from 'node:test';
import assert from 'node:assert/strict';
import {TASKS,readTask,createTaskReader,readTasksWithinBudget} from '../lib/knowledge-tasks.js';
import {createMemoryBudget,GITHUB_HOURLY_BUDGET,GITHUB_HOURLY_LIMIT} from '../lib/github-budget.js';
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
 let calls=0,time=now();const mb=createMemoryBudget({now:()=>time});const reader=createTaskReader({now:()=>time,ttlMs:100,budget:()=>mb,fetchImpl:async(url)=>{calls++;const t=TASKS.find(t=>url.endsWith('/'+t.repo+'/'+t.type+'/'+t.number));return response(t);}});
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

const byUrl=url=>TASKS.find(t=>url.endsWith('/'+t.repo+'/'+t.type+'/'+t.number));
test('console and sync share ONE hourly GitHub budget below the anonymous limit; a batch that does not fit makes no request',async()=>{
 assert.ok(GITHUB_HOURLY_BUDGET<GITHUB_HOURLY_LIMIT);
 let time=now(),calls=0;const shared=createMemoryBudget({now:()=>time});
 const f=async url=>{calls++;return response(byUrl(url));};
 const console1=await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});   // page refresh
 const sync1=await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});      // hourly sync
 const console2=await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});
 assert.equal(calls,3*TASKS.length);assert.ok(console1.every(r=>r.state!=='UNKNOWN')&&sync1.every(r=>r.state!=='UNKNOWN')&&console2.length===TASKS.length);
 const refused=await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});   // 4*14=56 > 50
 assert.equal(calls,3*TASKS.length,'no request beyond the budget');
 assert.ok(refused.every(r=>r.state==='UNKNOWN'&&r.reason==='budget'),'UNKNOWN, not success or failure');
 time+=3600_000;
 await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});
 assert.equal(calls,4*TASKS.length,'a new hour opens a new window');
});
test('GitHub reporting 0 remaining closes the shared budget until its reset; an unavailable budget store makes no request',async()=>{
 const time=now();const shared=createMemoryBudget({now:()=>time});let calls=0;
 const f=async url=>{calls++;return {...response(byUrl(url)),headers:new Headers({'x-ratelimit-remaining':'0','x-ratelimit-reset':String(Math.floor(time/1000)+3600)})};};
 await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});
 const next=await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});
 assert.equal(calls,TASKS.length);assert.ok(next.every(r=>r.reason==='budget'));
 const broken={reserve:async()=>{throw new Error('db down');},observe:async()=>{}};
 const rows=await readTasksWithinBudget(TASKS,{fetchImpl:async()=>{throw new Error('must not be called');},now:()=>time,budget:broken});
 assert.ok(rows.every(r=>r.state==='UNKNOWN'&&r.reason==='budget'));
});

test('the budget follows GitHub\'s real reset time: refused while GitHub\'s own remaining is too low, reopened exactly at x-ratelimit-reset',async()=>{
 let time=now(),calls=0;const shared=createMemoryBudget({now:()=>time});
 const reset=Math.floor(time/1000)+40*60;   // GitHub window reopens in 40 minutes
 const f=async url=>{calls++;return {...response(byUrl(url)),headers:new Headers({'x-ratelimit-remaining':'12','x-ratelimit-reset':String(reset)})};};
 await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});   // our count 14, GitHub says 12 left
 time+=30*60_000;
 const early=await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});
 assert.equal(calls,TASKS.length,'12 left at GitHub < 14 needed: no request');assert.ok(early.every(r=>r.reason==='budget'));
 time=reset*1000+1000;
 await readTasksWithinBudget(TASKS,{fetchImpl:f,now:()=>time,budget:shared});
 assert.equal(calls,2*TASKS.length,'reopened at GitHub\'s reset time, not at our own window end');
});
