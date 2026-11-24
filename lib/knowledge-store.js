import {knowledge,validateKnowledge} from './knowledge.js';
import {TASKS,readTask} from './knowledge-tasks.js';
import {dbQuery,withTransaction,databaseConfigured} from './db.js';

const keys=['app_id','id','kind','title','status','evidence','observed_on','source_revision','source_path'];
const payload=row=>Object.fromEntries(keys.map(k=>[k,row[k]]));

// Call inside a transaction. A repeated source identity is a no-op only when
// its content is identical; conflicting content rolls the whole import back.
export async function importKnowledge(client,records=knowledge){
 const validated=validateKnowledge({schema_version:1,classification:'redacted_public_index',records:records.map(payload)});
 let inserted=0;
 for(const row of validated){
  const args=[row.app_id,row.id,row.source_path,row.source_revision,row.observed_on,JSON.stringify(payload(row))];
  const result=await client.query(`INSERT INTO nexus_knowledge_revisions(app_id,record_id,source_path,source_revision,observed_on,payload)
   VALUES($1,$2,$3,$4,$5,$6::jsonb) ON CONFLICT DO NOTHING RETURNING record_id`,args);
  if(result.rowCount){inserted++;continue;}
  const check=await client.query(`SELECT payload=$5::jsonb AS identical FROM nexus_knowledge_revisions
   WHERE app_id=$1 AND record_id=$2 AND source_path=$3 AND source_revision=$4`,[...args.slice(0,4),args[5]]);
  if(check.rows[0]?.identical!==true)throw new Error('knowledge_revision_conflict');
 }
 return {inserted,reused:validated.length-inserted};
}
export async function loadKnowledge(){
 if(!databaseConfigured())return {records:knowledge,state:'STATIC_FALLBACK',revisions:null,conflicts:null};
 try{
  const result=await dbQuery(`SELECT payload, count(*) OVER(PARTITION BY app_id,record_id) AS latest_count
   FROM nexus_knowledge_revisions r WHERE observed_on=(SELECT max(observed_on) FROM nexus_knowledge_revisions s
   WHERE s.app_id=r.app_id AND s.record_id=r.record_id)
   ORDER BY app_id,record_id,source_path,source_revision`);
  if(!result.rows.length)return {records:knowledge,state:'STATIC_FALLBACK',revisions:0,conflicts:0};
  // Same-day revisions are ambiguous. Do not choose one as authoritative.
  const conflicts=new Set(result.rows.filter(r=>Number(r.latest_count)>1).map(r=>r.payload.app_id+':'+r.payload.id));
  const rows=result.rows.filter(r=>Number(r.latest_count)===1).map(r=>r.payload);
  const records=validateKnowledge({schema_version:1,classification:'redacted_public_index',records:rows});
  const total=await dbQuery('SELECT count(*)::int AS count FROM nexus_knowledge_revisions');
  return {records,state:'PERSISTED',revisions:total.rows[0].count,conflicts:conflicts.size};
 }catch{return {records:knowledge,state:'STATIC_FALLBACK',revisions:null,conflicts:null};}
}
export async function saveTaskHistory(client,rows){
 let inserted=0;
 for(const r of rows){
  const task=TASKS.find(t=>t.repo===r.repo&&t.type===r.type&&t.number===r.number);
  if(!task||!['OPEN','CLOSED','MERGED','UNKNOWN'].includes(r.state))throw new Error('task_not_allowlisted');
  if(typeof r.observed_at!=='string'||!Number.isFinite(Date.parse(r.observed_at)))throw new Error('invalid_observation');
  const head=r.head_sha??null,updated=r.updated_at??null;
  if(head!==null&&!/^[a-f0-9]{40}$/.test(head))throw new Error('invalid_head');
  if(updated!==null&&(typeof updated!=='string'||!Number.isFinite(Date.parse(updated))))throw new Error('invalid_source_time');
  if(r.state==='UNKNOWN'&&(head!==null||updated!==null))throw new Error('invalid_unknown');
  // Serialize observations for one fixed task, avoid repeated unchanged snapshots.
  const ref=[task.repo,task.type,task.number];
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[ref.join(':')]);
  const last=await client.query(`SELECT state,head_sha,source_updated_at,observed_at FROM nexus_task_observation_history
    WHERE repository=$1 AND resource_kind=$2 AND resource_number=$3 ORDER BY observed_at DESC LIMIT 1`,ref);
  const prev=last.rows[0];
  if(prev&&new Date(prev.observed_at).getTime()>=Date.parse(r.observed_at))continue;
  if(prev&&prev.state===r.state&&(prev.head_sha??null)===head&&
   (prev.source_updated_at?new Date(prev.source_updated_at).toISOString():null)===(updated?new Date(updated).toISOString():null))continue;
  const result=await client.query(`INSERT INTO nexus_task_observation_history(repository,resource_kind,resource_number,state,head_sha,source_updated_at,observed_at)
   VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING RETURNING id`,[...ref,r.state,head,updated,r.observed_at]);
  inserted+=result.rowCount;
 }
 return inserted;
}
export async function syncKnowledgeTasks({fetchImpl=fetch,now=()=>Date.now()}={}){
 if(!databaseConfigured())throw new Error('database_required');
 const rows=await Promise.all(TASKS.map(task=>readTask(task,{fetchImpl,now})));
 const inserted=await withTransaction(client=>saveTaskHistory(client,rows));
 return {checked:rows.length,unknown:rows.filter(r=>r.state==='UNKNOWN').length,inserted};
}

export async function loadSyncSummary(){
 const unknown={observations:null,last_state:null,completed_at:null};
 if(!databaseConfigured())return unknown;
 try{
  const count=await dbQuery('SELECT count(*)::int AS count FROM nexus_task_observation_history');
  const last=await dbQuery("SELECT state,completed_at FROM nexus_job_receipts WHERE job_kind='knowledge_public_sync' ORDER BY started_at DESC,id DESC LIMIT 1");
  const row=last.rows[0];
  return {observations:count.rows[0].count,last_state:row?.state??null,completed_at:row?.completed_at?new Date(row.completed_at).toISOString():null};
 }catch{return unknown;}
}
