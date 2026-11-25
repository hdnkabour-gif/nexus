import {syncKnowledgeTasks,startSyncReceipt,finishSyncReceipt} from '../lib/knowledge-store.js';
import {getPool} from '../lib/db.js';
let receipt;
try{
 // Closes receipts left `running` by a killed earlier run (as unknown) before opening this one.
 receipt=(await startSyncReceipt()).id;
 const result=await syncKnowledgeTasks();
 // A GitHub quota that could not be recorded for the other processes is reported, not treated as success.
 const state=result.unknown||result.rate_limit_recorded===false?'unknown':'succeeded';
 // Only a receipt still `running` is closed; a late finish after reclassification is recorded separately.
 await finishSyncReceipt(receipt,state,result);
 process.stdout.write('NEXUS knowledge sync: '+JSON.stringify(result)+'\n');
 if(state!=='succeeded')process.exitCode=1;
}catch{
 if(receipt)await finishSyncReceipt(receipt,'failed',{}).catch(()=>{});
 process.stderr.write('NEXUS knowledge sync failed (details withheld).\n');
 process.exitCode=1;
}finally{try{await getPool().end();}catch{}}
