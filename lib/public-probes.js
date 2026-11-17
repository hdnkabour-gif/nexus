import registry from '../registry/public-http-targets.v1.json';
import {databaseConfigured,dbQuery} from './db.js';

const ALLOWED_HOSTS=new Set(registry.targets.map(x=>x.host));
function permitted(t) {
 return t&&ALLOWED_HOSTS.has(t.host)&&/^[a-z0-9.-]+\.up\.railway\.app$/.test(t.host)&&
  /^[a-z][a-z0-9-]+$/.test(t.app_id)&&/^[a-z][a-z0-9-]+$/.test(t.environment);
}
export function publicProbeTargets(){
 return registry.targets.map(x=>({app_id:x.app_id,environment:x.environment,host:x.host,label:x.label}));
}
export async function probeHttp(target,{fetchImpl=fetch,now=()=>Date.now()}={}){
 if(!permitted(target))throw new Error('target_not_allowlisted');
 const start=now();
 try{
  const response=await fetchImpl('https://'+target.host+'/',{
   method:'GET',redirect:'manual',cache:'no-store',
   headers:{Accept:'text/html,application/json;q=0.8','User-Agent':'NEXUS-ReadOnlyReachability/0.1'},
   signal:AbortSignal.timeout(8000)
  });
  const status=Number(response?.status);
  if(!Number.isInteger(status)||status<100||status>599)throw new Error('bad_http_response');
  const duration=Math.max(0,Math.round(now()-start));
  return {app_id:target.app_id,environment:target.environment,host:target.host,
   state:status<500?'reachable':'unreachable',status_code:status,duration_ms:Math.min(duration,30000),
   measured_at:new Date().toISOString()};
 }catch{
  return {app_id:target.app_id,environment:target.environment,host:target.host,
   state:'unknown',status_code:null,duration_ms:Math.min(Math.max(0,Math.round(now()-start)),30000),
   measured_at:new Date().toISOString()};
 }
}
export async function saveHttpObservation(observation){
 if(!permitted(observation))throw new Error('target_not_allowlisted');
 if(!['reachable','unreachable','unknown'].includes(observation.state))throw new Error('bad_probe_state');
 const q=await dbQuery(`INSERT INTO nexus_observations(
  app_id,environment,provider,resource_ref,probe_kind,state,observed_at,response_status,latency_ms,evidence
 ) VALUES ($1,$2,'http_public',$3,'http_reachability',$4,$5,$6,$7,$8::jsonb) RETURNING id`,[
 observation.app_id,observation.environment,observation.host,observation.state,
 observation.measured_at,observation.status_code,observation.duration_ms,
 JSON.stringify({scope:'http_reachability_only',automated:true})
 ]);
 return q.rows[0].id;
}
export async function runHttpChecks({fetchImpl=fetch}={}){
 if(!databaseConfigured())throw new Error('database_required');
 const results=await Promise.all(registry.targets.map(async target=>{
  const result=await probeHttp(target,{fetchImpl});
  try{await saveHttpObservation(result);return {...result,persisted:true};}
  catch{return {...result,persisted:false};}
 }));
 return results;
}
export async function latestHttpChecks(){
 if(!databaseConfigured())return [];
 const q=await dbQuery(`SELECT DISTINCT ON (app_id,environment,resource_ref)
 app_id,environment,resource_ref as host,state,response_status as status_code,
 latency_ms as duration_ms,observed_at as measured_at
 FROM nexus_observations WHERE provider='http_public' AND probe_kind='http_reachability'
 ORDER BY app_id,environment,resource_ref,observed_at DESC`);
 const now=Date.now();
 return q.rows.map(x=>({...x,
  measured_at:new Date(x.measured_at).toISOString(),
  stale:now-new Date(x.measured_at).getTime()>20*60*1000
 }));
}
