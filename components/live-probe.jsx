'use client';
import {useState} from 'react';
import Icon from './icons';
import Status from './status';
export default function LiveProbe({id}){
 const [loading,setLoading]=useState(false);
 const [result,setResult]=useState(null);
 const [error,setError]=useState('');
 async function check(){
  setLoading(true);setError('');
  try{
   const response=await fetch('/api/v1/check?app='+encodeURIComponent(id),{cache:'no-store',credentials:'same-origin'});
   if(!response.ok)throw new Error('HTTP '+response.status);
   setResult(await response.json());
  }catch{setError('تعذر إجراء الفحص الآن. لا توجد نتيجة مؤكدة.');}
  finally{setLoading(false);}
 }
 return <section className="panel live-probe">
  <div className="panel-head"><div><div className="section-eyebrow">PROVIDER CONNECTIVITY</div><h3>التحقق من الاتصال</h3></div><button onClick={check} disabled={loading} className="btn small"><Icon name="refresh" size={16}/>{loading?'جارٍ الفحص…':'فحص الآن'}</button></div>
  <p className="muted">قراءة بيانات وصفية فقط. لا يثبت هذا الفحص سلامة التطبيق أو النسخ الاحتياطية.</p>
  {error&&<div className="warning-note">{error}</div>}
  {result?<div className="probe-results">
    {[['GitHub',result.github],['Railway',result.railway]].map(([name,item])=><div className="probe-row" key={name}><strong>{name}</strong><Status state={item.status}/><small>{item.status==='connected'?('تُحقّق: '+new Date(item.checked_at).toLocaleString('ar-MA')):item.message}</small></div>)}
  </div>:<div className="empty-mini"><Icon name="eye" size={18}/> لا توجد نتائج اتصال حية حتى الآن</div>}
 </section>;
}
