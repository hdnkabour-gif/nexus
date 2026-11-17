import {getPool} from '../lib/db.js';
import {runHttpChecks} from '../lib/public-probes.js';
async function main(){
 try{
  const results=await runHttpChecks();
  const saved=results.filter(x=>x.persisted).length;
  process.stdout.write('NEXUS HTTP public probes completed. Saved '+saved+' of '+results.length+' observations.\n');
  if(saved!==results.length)process.exitCode=1;
 }catch{
  process.stderr.write('NEXUS public probe task failed. No secrets exposed.\n');
  process.exitCode=1;
 }finally{await getPool().end().catch(()=>{});}
}
await main();
