// Read-only summary helpers: HTTP reachability must NEVER be presented as app health.
export function scopeHttp(app,checks=[],targets=[],now=Date.now()){
 const known=targets.filter(x=>x.app_id===app.app_id);
 const sources=known.map(target=>{
  const last=checks.find(x=>x.app_id===target.app_id&&x.environment===target.environment&&x.host===target.host);
  const age=last?now-new Date(last.measured_at).getTime():Infinity;
  const recent=last&&Number.isFinite(age)&&age>=-60000&&age<=20*60*1000&&!last.stale;
  return {...target,last:last||null,recent:!!recent};
 });
 const fresh=sources.filter(x=>x.recent);
 const httpErrors=fresh.filter(x=>x.last?.state==='unreachable');
 const responses=fresh.filter(x=>x.last?.state==='reachable');
 let status='unknown',label='لا توجد بيانات حديثة';
 if(httpErrors.length){status='critical';label='خطأ HTTP مسجّل';}
 else if(sources.length&&fresh.length===sources.length&&responses.length===sources.length){status='connected';label='استجابة HTTP موثقة';}
 else if(sources.length&&fresh.length){status='warning';label='تغطية جزئية أو غير مؤكدة';}
 return {app_id:app.app_id,status,label,sources,verified:fresh.length,total:sources.length,httpErrors:httpErrors.length,
  lastAt:fresh.map(x=>new Date(x.last.measured_at).getTime()).sort((a,b)=>b-a)[0]||null};
}
export function summarizeHttpPortfolio(apps=[],checks=[],targets=[],now=Date.now()){
 const appsWithProbes=apps.filter(a=>targets.some(t=>t.app_id===a.app_id)).length;
 const grouped=apps.map(app=>({app,...scopeHttp(app,checks,targets,now)}));
 const fresh=grouped.flatMap(x=>x.sources).filter(x=>x.recent);
 return {grouped,targets:targets.length,appProfiles:apps.length,appsWithProbes,
  freshCount:fresh.length,httpErrors:fresh.filter(x=>x.last.state==='unreachable').length,
  lastAt:fresh.reduce((max,x)=>Math.max(max,new Date(x.last.measured_at).getTime()),0)||null};
}
