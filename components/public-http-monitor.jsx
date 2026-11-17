'use client';
import {useEffect,useState} from 'react';
export default function PublicHttpMonitor(){
 const [state,setState]=useState({loading:true,checks:[],targets:[],error:null});
 async function load(method='GET'){
  setState(old=>({...old,loading:true,error:null}));
  try{
   const r=await fetch('/api/v1/http-checks',{method,cache:'no-store',credentials:'same-origin'});
   if(!r.ok)throw new Error('request_failed');
   const data=await r.json();
   setState(old=>({...old,loading:false,checks:data.checks||[],targets:data.targets||old.targets,error:null}));
  }catch{setState(old=>({...old,loading:false,error:'تعذر إحضار الفحوص الآن؛ الحالة غير مؤكدة.'}));}
 }
 useEffect(()=>{load();},[]);
 const current=(t)=>state.checks.find(x=>x.app_id===t.app_id&&x.environment===t.environment&&x.host===t.host);
 const readable=(o)=>!o?'لم يتم الفحص':o.stale?'نتيجة قديمة':o.state==='reachable'?'ردّ HTTP':o.state==='unreachable'?'خطأ HTTP':'تعذر الفحص';
 const tone=(o)=>!o||o.stale||o.state==='unknown'?'status-unknown':o.state==='reachable'?'status-connected':'status-critical';
 return <section className="panel" style={{padding:'18px',marginTop:'18px'}}>
  <div className="panel-head"><div><span className="section-eyebrow">PUBLIC HTTP REACHABILITY</span><h3>الوصول الفعلي للمواقع المعروفة</h3></div>
   <button className="btn small" disabled={state.loading} onClick={()=>load('POST')}>{state.loading?'جارٍ التحقق…':'تحديث الفحص الآن'}</button></div>
  <p className="muted">الفحوص لا تحتاج إلى مفاتيح GitHub أو Railway. تؤكد فقط أن الخادم يُجيب عبر HTTPS؛ لا تثبت صحة البيع أو الحسابات أو OCR أو النسخ الاحتياطية. النتائج القديمة تصبح غير مؤكدة.</p>
  {state.error&&<div className="warning-note">{state.error}</div>}
  {state.targets.map(t=>{const o=current(t);return <div className="backup-row" key={t.app_id+'/'+t.environment+'/'+t.host}>
    <div className="backup-name"><strong>{t.label}</strong><small dir="ltr">{t.host}</small></div>
    <span className={'status-pill '+tone(o)}>{readable(o)}</span>
    <span className="backup-time">{o?('HTTP '+(o.status_code??'—')+' · '+new Date(o.measured_at).toLocaleString('ar-MA')):'لا توجد نتيجة بعد'}</span>
   </div>;})}
  {!state.loading&&!state.targets.length&&<div className="empty-state"><p>لا توجد وجهات معتمدة للفحص.</p></div>}
  <p className="muted">AMANZINE و2M TECH PLATFORM غير مدرجين في هذا الفحص: لم يُتحقق من نطاق الأول، ويحتاج الثاني إلى موافقة الجهة المالكة.</p>
 </section>;
}
