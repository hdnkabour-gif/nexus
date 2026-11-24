// Public, explicitly allowlisted engineering metadata. No tokens, bodies, author
// identities, comments, business data or user-controlled URLs are collected.
const definitions=[
 ['nexus','hdnkabour-gif/nexus','issues',5,'Cross-session coordination','coordinator'],
 ['nexus','hdnkabour-gif/nexus','issues',10,'Authentication review','independent-reviewer'],
 ['nexus','hdnkabour-gif/nexus','issues',11,'Read-only provider integration','executor'],
 ['nexus','hdnkabour-gif/nexus','issues',13,'Recovery evidence','executor'],
 ['nexus','hdnkabour-gif/nexus','pulls',29,'Knowledge Center V1','executor'],
 ['pneu-mouhim','hdnkabour-gif/Pneumatiques-MOUHIM','pulls',27,'Unified release candidate','independent-reviewer'],
 ['rent-car','hdnkabour-gif/rent-car-app','pulls',37,'Release review','independent-reviewer'],
 ['tijara-os','hdnkabour-gif/tijara-os','pulls',23,'Independent privacy review','independent-reviewer']
];
export const TASKS=Object.freeze(definitions.map(([app_id,repo,type,number,title,role])=>Object.freeze({app_id,repo,type,number,title,role})));
const sha=v=>typeof v==='string'&&/^[a-f0-9]{40}$/.test(v)?v:null;
const stamp=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))?new Date(v).toISOString():null;
const link=t=>'https://github.com/'+t.repo+'/'+(t.type==='pulls'?'pull':'issues')+'/'+t.number;
function unknown(task,at){return Object.freeze({...task,source_url:link(task),state:'UNKNOWN',observed_at:at,updated_at:null,head_sha:null,merged:null});}
export async function readTask(task,{fetchImpl=fetch,now=()=>Date.now()}={}){
 const at=new Date(now()).toISOString();
 // Identity must come from the static allowlist; never accept arbitrary objects.
 if(!TASKS.includes(task))throw new Error('task_not_allowlisted');
 try{
  const r=await fetchImpl('https://api.github.com/repos/'+task.repo+'/'+task.type+'/'+task.number,{
   method:'GET',redirect:'error',cache:'no-store',
   headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},
   signal:AbortSignal.timeout(5000)
  });
  if(!r.ok)return unknown(task,at);
  const raw=await r.json();
  if(raw?.number!==task.number||raw.html_url!==link(task)||!['open','closed'].includes(raw.state)||!stamp(raw.updated_at))return unknown(task,at);
  if(task.type==='pulls'&&(typeof raw.merged!=='boolean'||!sha(raw.head?.sha)))return unknown(task,at);
  return Object.freeze({...task,source_url:link(task),
   state:task.type==='pulls'&&raw.merged?'MERGED':raw.state.toUpperCase(),
   observed_at:at,updated_at:stamp(raw.updated_at),
   head_sha:task.type==='pulls'?sha(raw.head?.sha):null,
   merged:task.type==='pulls'?raw.merged:null
  });
 }catch{return unknown(task,at);}
}
// Single-flight, bounded per-process cache. Refreshes on authorized page access,
// not a background scheduler. UNKNOWN also cached to avoid retry storms.
export function createTaskReader({fetchImpl=fetch,now=()=>Date.now(),ttlMs=15*60*1000}={}){
 let cache=null,expires=0,pending=null;
 return async function read(){
  if(cache&&now()<expires)return cache;
  if(pending)return pending;
  pending=Promise.all(TASKS.map(t=>readTask(t,{fetchImpl,now}))).then(rows=>{
   cache=Object.freeze(rows);expires=now()+ttlMs;return cache;
  }).finally(()=>{pending=null;});
  return pending;
 };
}
export const readKnowledgeTasks=createTaskReader();
