import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {getPool} from '../lib/db.js';
import {knowledge} from '../lib/knowledge.js';
import {TASKS} from '../lib/knowledge-tasks.js';
import {importKnowledge,saveTaskHistory,startSyncReceipt,finishSyncReceipt,loadSyncSummary,RECEIPT_LEASE_MINUTES} from '../lib/knowledge-store.js';
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

test('a receipt left running by a killed sync is shown as stale, then closed as unknown by the next run; a recent one is left alone',{skip:!isolated},async()=>{
 await transactionTest(async client=>{
  await client.query("DELETE FROM nexus_job_receipts WHERE job_kind='knowledge_public_sync'");
  // The process died after the history commit, before closing its receipt.
  await client.query(`INSERT INTO nexus_job_receipts(job_kind,state,started_at) VALUES('knowledge_public_sync','running',now()-make_interval(mins=>$1::int))`,[RECEIPT_LEASE_MINUTES+5]);
  assert.equal((await loadSyncSummary(client)).last_state,'stale','never displayed as running indefinitely');
  const next=await startSyncReceipt(client);
  assert.equal(next.reclassified,1);
  const rows=(await client.query("SELECT id,state,info FROM nexus_job_receipts WHERE job_kind='knowledge_public_sync' ORDER BY id")).rows;
  assert.equal(rows[0].state,'unknown');assert.equal(rows[0].info.reason,'orphaned_running');
  assert.equal(rows[1].state,'running');
  assert.equal((await loadSyncSummary(client)).last_state,'running','a fresh run inside its lease is still running');
  assert.equal((await startSyncReceipt(client)).reclassified,0,'a recent running receipt is not taken over');
 });
});

test('a worker that finishes AFTER its receipt was classified orphaned_running cannot overwrite that classification',{skip:!isolated},async()=>{
 await transactionTest(async client=>{
  await client.query("DELETE FROM nexus_job_receipts WHERE job_kind='knowledge_public_sync'");
  const slow=(await client.query(`INSERT INTO nexus_job_receipts(job_kind,state,started_at) VALUES('knowledge_public_sync','running',now()-make_interval(mins=>$1::int)) RETURNING id`,[RECEIPT_LEASE_MINUTES+5])).rows[0].id;
  const next=await startSyncReceipt(client);                       // next run reclassifies the slow one
  assert.equal(next.reclassified,1);
  // The suspended first worker resumes and reports success, then a failure path also tries.
  assert.equal(await finishSyncReceipt(slow,'succeeded',{checked:14,unknown:0,inserted:2},client),false);
  assert.equal(await finishSyncReceipt(slow,'failed',{},client),false);
  const row=(await client.query('SELECT state,info FROM nexus_job_receipts WHERE id=$1',[slow])).rows[0];
  assert.equal(row.state,'unknown');assert.equal(row.info.reason,'orphaned_running','the expiry trace is kept');
  assert.equal(row.info.late_completions.length,2,'late results are recorded separately');
  assert.equal(row.info.late_completions[0].state,'succeeded');assert.equal(row.info.late_completions[0].result.inserted,2);
  // The current run still closes normally.
  assert.equal(await finishSyncReceipt(next.id,'succeeded',{checked:14,unknown:0,inserted:0},client),true);
  assert.equal((await client.query('SELECT state FROM nexus_job_receipts WHERE id=$1',[next.id])).rows[0].state,'succeeded');
 });
});
