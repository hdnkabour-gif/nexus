import index from '../registry/knowledge-index.v1.json' with {type:'json'};
import {relatedApps} from './knowledge-relations.js';

export const APPLICATIONS=Object.freeze({
 'pneu-mouhim':'PNEU MOUHIM','rent-car':'Rent Car','amanzine':'AMANZINE',
 'alloservix':'ALLOSERVIX','nexus':'NEXUS','nexora':'NEXORA','tijara-os':'TIJARA OS',
 'scanflow-pro':'ScanFlow Pro','school-platform':'School platform','fleetdocs-ai':'FleetDocs AI'
});
const kinds=new Set(['feature','idea','decision','risk','evidence','release','handoff','relationship','technology','bug']);
const states=new Set(['HISTORICAL','DESIGNED','IDEA']);
const paths=new Set(['docs/06_FEATURE_CATALOG.md','docs/17_IDEA_LOG.md','docs/28_FEATURE_REGISTRY.md','docs/29_DECISION_REGISTRY.md','docs/30_RISK_GAP_REGISTER.md','docs/27_PORTFOLIO_BASELINE_V1.md']);
const keys=['app_id','id','kind','title','status','evidence','observed_on','source_revision','source_path'];
export function validateKnowledge(data){
 if(!data||data.schema_version!==1||data.classification!=='redacted_public_index'||
    !Array.isArray(data.records)||data.records.length>1000||
    Object.keys(data).some(k=>!['schema_version','classification','records'].includes(k)))throw new Error('invalid_knowledge_index');
 const seen=new Set();
 return Object.freeze(data.records.map(row=>{
  if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).length!==keys.length||
   keys.some(k=>!Object.hasOwn(row,k)||typeof row[k]!=='string')||
   !Object.hasOwn(APPLICATIONS,row.app_id)||!kinds.has(row.kind)||!states.has(row.status)||
   row.evidence!=='HISTORICAL'||!/^[A-Z][A-Z0-9-]{1,39}$/.test(row.id)||
   !row.title.trim()||row.title.length>160||/[\x00-\x1f\x7f<>]/.test(row.title)||
   !/^\d{4}-\d{2}-\d{2}$/.test(row.observed_on)||
   !Number.isFinite(Date.parse(row.observed_on))||new Date(row.observed_on).toISOString().slice(0,10)!==row.observed_on||
   !/^[a-f0-9]{40}$/.test(row.source_revision)||!paths.has(row.source_path))throw new Error('invalid_knowledge_record');
  const identity=row.app_id+':'+row.id;
  if(seen.has(identity))throw new Error('duplicate_knowledge_record');
  seen.add(identity);
  return Object.freeze({...row,identity,source_url:'https://github.com/hdnkabour-gif/nexus/blob/'+row.source_revision+'/'+row.source_path});
 }));
}
export const knowledge=validateKnowledge(index);
const one=v=>typeof v==='string'?v.slice(0,160):'';
export function filterKnowledge(records,{q='',app='',kind='',status=''}={}){
 const term=one(q).trim().toLowerCase(),a=one(app),k=one(kind),s=one(status);
 return records.filter(r=>(!a||r.app_id===a||relatedApps(r).includes(a))&&(!k||r.kind===k)&&(!s||r.status===s)&&
  (!term||[r.id,r.title,r.app_id,APPLICATIONS[r.app_id],r.kind,r.status,...relatedApps(r).map(id=>APPLICATIONS[id])].join(' ').toLowerCase().includes(term)));
}
