import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {getPool} from '../lib/db.js';
import {knowledge} from '../lib/knowledge.js';
import {TASKS} from '../lib/knowledge-tasks.js';
import {importKnowledge,saveTaskHistory,loadRecentTaskHistory} from '../lib/knowledge-store.js';
import {createDbBudget,GITHUB_HOURLY_BUDGET} from '../lib/github-budget.js';
import {checkRuntimePrivileges} from '../lib/db-privileges.js';
import {readFile} from 'node:fs/promises';
const isolated=process.env.CI==='true'&&(()=>{try{return new URL(process.env.NEXUS_DATABASE_URL).pathname==='/nexus_test'}catch{return false}})();
async function transactionTest(run){
 const pool=getPool(),client=await pool.connect();
 try{await client.query('BEGIN');await run(client);}
 finally{await client.query('ROLLBACK').catch(()=>{});client.release();}
}
test('migration imports the complete approved index and is idempotent; older revisions remain, conflicts are not overwritten',{skip:!isolated},async()=>{
 await transactionTest(async client=>{
  const count=await client.query('SELECT count(*)::int AS n FROM nexus_knowledge_revisions');
  assert.ok(count.rows[0].n>=knowledge.length);
  const again=await importKnowledge(client);
  assert.equal(again.inserted,0);assert.equal(again.reused,knowledge.length);
  const first=knowledge[0];
  const older={...first,observed_on:'2026-01-01',source_revision:'a'.repeat(40)};
  assert.deepEqual(await importKnowledge(client,[older]),{inserted:1,reused:0});
  assert.deepEqual(await importKnowledge(client,[older]),{inserted:0,reused:1});
  await assert.rejects(importKnowledge(client,[{...older,title:'Changed source identity'}]),/knowledge_revision_conflict/);
  await assert.rejects(importKnowledge(client,[{...older,secret:'disallowed'}]),/invalid_knowledge_record/);
  const saved=await client.query('SELECT payload FROM nexus_knowledge_revisions WHERE app_id=$1 AND record_id=$2 AND source_revision=$3',[first.app_id,first.id,older.source_revision]);
  assert.equal(saved.rows[0].payload.title,first.title);
 });
});
test('task persistence retains distinct observed changes and ignores replays and older arrivals',{skip:!isolated},async()=>{
 // Independent file process; no production data and no external network.
 const pool=getPool(),client=await pool.connect();
 try{
  await client.query('BEGIN');
  const t=TASKS[0];
  const first={...t,state:'OPEN',head_sha:null,updated_at:'2026-11-24T08:00:00Z',observed_at:'2030-01-01T00:00:00Z'};
  assert.equal(await saveTaskHistory(client,[first]),1);
  assert.equal(await saveTaskHistory(client,[first]),0);
  assert.equal(await saveTaskHistory(client,[{...first,observed_at:'2030-01-02T00:00:00Z'}]),0);
  const changed={...first,state:'CLOSED',updated_at:'2026-11-24T09:00:00Z',observed_at:'2030-01-03T00:00:00Z'};
  assert.equal(await saveTaskHistory(client,[changed]),1);
  assert.equal(await saveTaskHistory(client,[{...first,observed_at:'2030-01-02T00:00:00Z'}]),0);
  assert.equal(await saveTaskHistory(client,[{...first,observed_at:'2030-01-04T00:00:00Z'}]),0);
  await assert.rejects(saveTaskHistory(client,[{...changed,repo:'unapproved/repo'}]),/allowlisted/);
 }finally{await client.query('ROLLBACK').catch(()=>{});client.release();}
});
test('persistent storage path checks session first; the worker is not invoked by page rendering',async()=>{
 const src=await readFile(new URL('../app/console/knowledge/page.jsx',import.meta.url),'utf8');
 assert.ok(src.indexOf("if(!session)redirect('/login')")<src.indexOf('await loadKnowledge()'));
 assert.match(src,/snapshot\.state/);assert.match(src,/summary\.last_state/);
 assert.doesNotMatch(src,/syncKnowledgeTasks\(/);
});

after(async()=>{if(isolated)await getPool().end();});

test('DB budget is shared: two processes (console + sync) cannot together exceed the hourly budget',{skip:!isolated},async()=>{
 await transactionTest(async client=>{
  await client.query('DELETE FROM nexus_github_budget');
  const q=(sql,p)=>client.query(sql,p);
  const consoleBudget=createDbBudget({query:q}),syncBudget=createDbBudget({query:q});
  assert.equal(await consoleBudget.reserve(14),true);assert.equal(await syncBudget.reserve(14),true);assert.equal(await consoleBudget.reserve(14),true);
  assert.equal(await syncBudget.reserve(14),false,'56 > 50: refused, nothing counted');
  assert.equal((await client.query('SELECT used FROM nexus_github_budget')).rows[0].used,42);
  await client.query("UPDATE nexus_github_budget SET window_start=now()-interval '61 minutes'");
  assert.equal(await syncBudget.reserve(14),true,'expired window restarts');
  await consoleBudget.observe({remaining:0,reset:Math.floor(Date.now()/1000)+1200});   // GitHub: 0 left, reopens in 20 min
  assert.equal(await syncBudget.reserve(1),false,'closed for every process until GitHub reopens');
  assert.ok((await client.query('SELECT used FROM nexus_github_budget')).rows[0].used<=GITHUB_HOURLY_BUDGET);
 });
});

test('history tables are append-only in the database: UPDATE, DELETE and TRUNCATE are refused',{skip:!isolated},async()=>{
 for(const [table,sql] of [
  ['nexus_task_observation_history','UPDATE nexus_task_observation_history SET state=state'],
  ['nexus_task_observation_history','DELETE FROM nexus_task_observation_history'],
  ['nexus_task_observation_history','TRUNCATE nexus_task_observation_history'],
  ['nexus_knowledge_revisions','UPDATE nexus_knowledge_revisions SET payload=payload'],
  ['nexus_knowledge_revisions','DELETE FROM nexus_knowledge_revisions'],
  ['nexus_knowledge_revisions','TRUNCATE nexus_knowledge_revisions']]){
  await transactionTest(async client=>{
   if(/nexus_task/.test(table))await saveTaskHistory(client,[{...TASKS[0],state:'OPEN',head_sha:null,updated_at:'2026-11-24T08:00:00Z',observed_at:'2031-01-01T00:00:00Z'}]);
   await assert.rejects(client.query(sql),/nexus_history_append_only/,sql);
  });
 }
});

test('privilege attestation: the owner role is reported unsafe; a least-privilege runtime role passes and still cannot rewrite history',{skip:!isolated},async()=>{
 await transactionTest(async client=>{
  const owner=await checkRuntimePrivileges(client);
  assert.equal(owner.ok,false);assert.ok(owner.problems.some(p=>/owned by the runtime role/.test(p)));
  const can=(await client.query("SELECT rolsuper OR rolcreaterole AS ok FROM pg_roles WHERE rolname=current_user")).rows[0].ok;
  if(!can)return;   // CI's service role can create roles; a restricted local role cannot (the owner case above still ran)
  await client.query('CREATE ROLE nexus_runtime_probe NOLOGIN NOSUPERUSER NOBYPASSRLS');
  await client.query('GRANT USAGE ON SCHEMA public TO nexus_runtime_probe');
  await client.query('GRANT SELECT,INSERT ON nexus_task_observation_history,nexus_knowledge_revisions TO nexus_runtime_probe');
  await client.query('GRANT nexus_runtime_probe TO CURRENT_USER');   // PG16+: membership is needed to SET ROLE
  await client.query('SET LOCAL ROLE nexus_runtime_probe');
  const rt=await checkRuntimePrivileges(client);
  assert.equal(rt.ok,true,JSON.stringify(rt.problems));
  await assert.rejects(client.query('DELETE FROM nexus_task_observation_history'),/permission denied|nexus_history_append_only/);
 });
});

test('two different states with the same GitHub timestamp are kept and flagged ambiguous, never ordered by arrival',{skip:!isolated},async()=>{
 await transactionTest(async client=>{
  const t=TASKS[0],u='2026-11-24T08:00:00Z';
  const obs=(state,at)=>({...t,state,head_sha:null,updated_at:u,observed_at:at});
  assert.equal(await saveTaskHistory(client,[obs('OPEN','2032-01-01T00:00:00Z')]),1);
  assert.equal(await saveTaskHistory(client,[obs('CLOSED','2032-01-01T00:01:00Z')]),1);
  const rows=(await loadRecentTaskHistory(client)).filter(h=>h.number===t.number&&h.source_updated_at===new Date(u).toISOString());
  assert.equal(rows.length,2);
  assert.ok(rows.every(h=>h.ambiguous===true),'both flagged: arrival order is not provider order');
  const other=TASKS[1];
  await saveTaskHistory(client,[{...other,state:'OPEN',head_sha:null,updated_at:'2026-11-24T09:00:00Z',observed_at:'2032-01-02T00:00:00Z'}]);
  assert.equal((await loadRecentTaskHistory(client)).find(h=>h.number===other.number&&h.app_id===other.app_id).ambiguous,false);
 });
});

test('concurrent reservations from separate connections never exceed the budget; GitHub reset time is honoured in SQL',{skip:!isolated},async()=>{
 const pool=getPool();
 await pool.query('DELETE FROM nexus_github_budget');
 try{
  const budgets=Array.from({length:8},()=>createDbBudget({query:(sql,p)=>pool.query(sql,p)}));
  const granted=(await Promise.all(budgets.map(b=>b.reserve(14)))).filter(Boolean).length;
  assert.equal(granted,3,'50/14 = 3 batches, whatever the interleaving');
  assert.equal((await pool.query('SELECT used FROM nexus_github_budget')).rows[0].used,42);
  await pool.query('DELETE FROM nexus_github_budget');
  const b=budgets[0];
  await b.reserve(14);
  await b.observe({remaining:3,reset:Math.floor(Date.now()/1000)+600});   // GitHub: 3 left, reopens in 10 min
  assert.equal(await b.reserve(1),false,'below the safety margin until GitHub reopens');
  await pool.query("UPDATE nexus_github_budget SET gh_reset_at=now()-interval '1 second'");
  assert.equal(await b.reserve(14),true,'reopened at the reset time');
 }finally{await pool.query('DELETE FROM nexus_github_budget');}
});
