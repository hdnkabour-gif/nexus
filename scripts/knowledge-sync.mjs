import {syncKnowledgeTasks} from '../lib/knowledge-store.js';
import {getPool,dbQuery} from '../lib/db.js';
let receipt;
try{
 const q=await dbQuery("INSERT INTO nexus_job_receipts(job_kind,state) VALUES('knowledge_public_sync','running') RETURNING id");
 receipt=q.rows[0].id;
 const result=await syncKnowledgeTasks();
 // A GitHub quota that could not be recorded for the other processes is reported, not treated as success.
 const state=result.unknown||result.rate_limit_recorded===false?'unknown':'succeeded';
 await dbQuery("UPDATE nexus_job_receipts SET state=$2,completed_at=now(),info=$3::jsonb WHERE id=$1",[receipt,state,JSON.stringify(result)]);
 process.stdout.write('NEXUS knowledge sync: '+JSON.stringify(result)+'\n');
 if(state!=='succeeded')process.exitCode=1;
}catch{
 if(receipt)await dbQuery("UPDATE nexus_job_receipts SET state='failed',completed_at=now() WHERE id=$1",[receipt]).catch(()=>{});
 process.stderr.write('NEXUS knowledge sync failed (details withheld).\n');
 process.exitCode=1;
}finally{try{await getPool().end();}catch{}}
