import {redirect} from 'next/navigation';
import {getSession} from '../../../lib/auth.js';
import {APPLICATIONS,knowledge,filterKnowledge} from '../../../lib/knowledge.js';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const metadata={title:'Knowledge Center | NEXUS',robots:{index:false,follow:false}};
const options={feature:'ميزة · Fonction',idea:'فكرة · Idée',decision:'قرار · Décision',risk:'خطر · Risque',evidence:'دليل · Preuve',release:'إصدار · Version',handoff:'تسليم · Relais'};
const statuses={HISTORICAL:'تاريخي · Historique',DESIGNED:'مصمم · Conçu',IDEA:'فكرة · Idée'};
const value=v=>typeof v==='string'?v.slice(0,160):'';
export default async function KnowledgeCenter({searchParams}){
 const session=await getSession();
 if(!session)redirect('/login');
 if(session.must_change_password)redirect('/owner/setup');
 const raw=await searchParams||{};
 const filters={q:value(raw.q),app:value(raw.app),kind:value(raw.kind),status:value(raw.status)};
 const rows=filterKnowledge(knowledge,filters);
 return <>
  <div className="os-page-title"><div><span className="os-kicker"><i/> KNOWLEDGE CENTER / V1</span><h1>ذاكرة <em>المشاريع.</em></h1><p>فهرس المعرفة التقنية المنقّحة، بالمعرفات الأصلية ومصادرها. Centre de connaissances — lecture seule.</p></div><div className="os-page-actions"><span className="os-snapshot">INDEX <strong>HISTORICAL</strong></span></div></div>
  <div className="os-evidence-callout"><div><strong>لقطة موثقة وليست مزامنة حية.</strong><p>لا بيانات عملاء أو محادثات خام. لا تعني حالة تاريخية نجاح الإصدار الحالي. الاستيراد الحي ومراجعة التعارضات لم يفعّلا بعد.</p></div></div>
  <section className="os-map-surface" aria-label="Knowledge filters">
   <form method="GET" action="/console/knowledge" style={{display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'end',marginBottom:'20px'}}>
    <label style={{display:'grid',gap:'6px',flex:'1 1 220px'}}>بحث / Recherche<input name="q" defaultValue={filters.q} maxLength={160} placeholder="OCR, F26, backup…" style={{padding:'10px',borderRadius:'8px'}}/></label>
    <label style={{display:'grid',gap:'6px'}}>المشروع<select name="app" defaultValue={filters.app} style={{padding:'10px',borderRadius:'8px'}}><option value="">الكل / Tous</option>{Object.entries(APPLICATIONS).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <label style={{display:'grid',gap:'6px'}}>النوع<select name="kind" defaultValue={filters.kind} style={{padding:'10px',borderRadius:'8px'}}><option value="">الكل</option>{Object.entries(options).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <label style={{display:'grid',gap:'6px'}}>الحالة<select name="status" defaultValue={filters.status} style={{padding:'10px',borderRadius:'8px'}}><option value="">الكل</option>{Object.entries(statuses).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <button className="os-action-solid" type="submit">بحث</button><a href="/console/knowledge" className="os-panel-link">إعادة الضبط</a>
   </form>
   <p role="status">{rows.length} / {knowledge.length} سجل · Enregistrements</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:'12px',marginTop:'16px'}}>
    {rows.map(r=><article key={r.identity} style={{border:'1px solid currentColor',borderRadius:'12px',padding:'16px',overflowWrap:'anywhere'}}>
     <small dir="ltr">{APPLICATIONS[r.app_id]} · {r.id}</small><h2 style={{fontSize:'1.05rem',margin:'10px 0'}} dir="auto">{r.title}</h2>
     <p>{options[r.kind]} · {statuses[r.status]}</p><p dir="ltr"><small>{r.observed_on} · {r.source_revision.slice(0,7)}</small></p>
     <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="os-panel-link">المصدر / Source ↗</a>
    </article>)}
   </div>
   {!rows.length&&<p>لا توجد نتيجة مطابقة. / Aucun résultat.</p>}
  </section>
 </>;
}
