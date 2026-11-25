import {knowledge,validateKnowledge} from './knowledge.js';
import {TASKS,readTask} from './knowledge-tasks.js';
import {dbQuery,withTransaction,databaseConfigured} from './db.js';

const keys=['app_id','id','kind','title','status','evidence','observed_on','source_revision','source_path'];
const payload=row=>Object.fromEntries(keys.map(k=>[k,row[k]]));
const inputPayload=row=>{
 if(!row||typeof row!=='object'||Object.keys(row).some(k=>!keys.includes(k)&&k!=='identity'&&k!=='source_url'))throw new Error('invalid_knowledge_record');
 return payload(row);
};

// Call inside a transaction. A repeated source identity is a no-op only when
// its content is identical; conflicting content rolls the whole import back.
export async function importKnowledge(client,records=knowledge){
 const validated=validateKnowledge({schema_version:1,classification:'redacted_public_index',records:records.map(inputPayload)});
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
  // A freshly retrieved stale provider response must not supersede newer source data.
  if(updated){
   const valid=await client.query('SELECT max(source_updated_at) AS newest FROM nexus_task_observation_history WHERE repository=$1 AND resource_kind=$2 AND resource_number=$3',ref);
   const newest=valid.rows[0]?.newest;
   if(newest&&Date.parse(updated)<new Date(newest).getTime())continue;
  }
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

// A sync that is still `running` after this lease is treated as abandoned (process killed after the
// history commit but before its receipt was closed): never shown as running indefinitely (#31 review).
export const RECEIPT_LEASE_MINUTES=30;
const SYNC_KIND='knowledge_public_sync';
const query=(client,sql,params)=>client?client.query(sql,params):dbQuery(sql,params);

/** Close orphaned `running` receipts as `unknown` (reason recorded), then open a new one. */
export async function startSyncReceipt(client){
 const orphans=await query(client,`UPDATE nexus_job_receipts SET state='unknown',completed_at=now(),info=info||jsonb_build_object('reason','orphaned_running','lease_minutes',$2::int)
   WHERE job_kind=$1 AND state='running' AND started_at < now()-make_interval(mins=>$2::int) RETURNING id`,[SYNC_KIND,RECEIPT_LEASE_MINUTES]);
 const q=await query(client,"INSERT INTO nexus_job_receipts(job_kind,state) VALUES($1,'running') RETURNING id",[SYNC_KIND]);
 return {id:q.rows[0].id,reclassified:orphans.rowCount};
}

/**
 * Close a receipt ONLY if it is still `running` (#32 review). If it was already classified (e.g.
 * orphaned_running -> unknown by a later run), its state and reason are kept and this late result is
 * appended to info.late_completions instead. Returns true when the receipt was closed normally.
 */
export async function finishSyncReceipt(id,state,result={},client){
 if(!['succeeded','failed','unknown'].includes(state))throw new Error('invalid_receipt_state');
 const done=await query(client,`UPDATE nexus_job_receipts SET state=$2,completed_at=now(),info=info||$3::jsonb WHERE id=$1 AND state='running' RETURNING id`,[id,state,JSON.stringify({result})]);
 if(done.rowCount===1)return true;
 await query(client,`UPDATE nexus_job_receipts SET info=jsonb_set(info,'{late_completions}',coalesce(info->'late_completions','[]'::jsonb)||jsonb_build_array(jsonb_build_object('state',$2::text,'at',now(),'result',$3::jsonb))) WHERE id=$1`,[id,state,JSON.stringify(result)]);
 return false;
}

export async function loadSyncSummary(client){
 const unknown={observations:null,last_state:null,completed_at:null};
 if(!client&&!databaseConfigured())return unknown;
 try{
  const count=await query(client,'SELECT count(*)::int AS count FROM nexus_task_observation_history');
  const last=await query(client,`SELECT state,completed_at,(state='running' AND started_at < now()-make_interval(mins=>$2::int)) AS stale
    FROM nexus_job_receipts WHERE job_kind=$1 ORDER BY started_at DESC,id DESC LIMIT 1`,[SYNC_KIND,RECEIPT_LEASE_MINUTES]);
  const row=last.rows[0];
  return {observations:count.rows[0].count,last_state:row?(row.stale?'stale':row.state):null,completed_at:row?.completed_at?new Date(row.completed_at).toISOString():null};
 }catch{return unknown;}
}

export async function loadRecentTaskHistory(){
 if(!databaseConfigured())return null;
 try{
  const result=await dbQuery(`SELECT repository,resource_kind,resource_number,state,head_sha,source_updated_at,observed_at
   FROM nexus_task_observation_history ORDER BY observed_at DESC,id DESC LIMIT 20`);
  return result.rows.flatMap(row=>{
   const t=TASKS.find(x=>x.repo===row.repository&&x.type===row.resource_kind&&x.number===row.resource_number);
   if(!t)return [];
   return [{app_id:t.app_id,number:t.number,title:t.title,state:row.state,head_sha:row.head_sha??null,
    observed_at:new Date(row.observed_at).toISOString(),source_updated_at:row.source_updated_at?new Date(row.source_updated_at).toISOString():null}];
  });
 }catch{return null;}
}
