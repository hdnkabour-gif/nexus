import {redirect} from 'next/navigation';
import {getSession} from '../../../lib/auth.js';
import {APPLICATIONS,knowledge,filterKnowledge} from '../../../lib/knowledge.js';
import {readKnowledgeTasks} from '../../../lib/knowledge-tasks.js';
import {relationApps,relatedApps} from '../../../lib/knowledge-relations.js';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const metadata={title:'Knowledge Center | NEXUS',robots:{index:false,follow:false}};
const options={feature:'ميزة · Fonction',idea:'فكرة · Idée',decision:'قرار · Décision',risk:'خطر · Risque',evidence:'دليل · Preuve',release:'إصدار · Version',handoff:'تسليم · Relais',relationship:'علاقة · Relation',technology:'تقنية · Technologie',bug:'خلل · Anomalie'};
const statuses={HISTORICAL:'تاريخي · Historique',DESIGNED:'مصمم · Conçu',IDEA:'فكرة · Idée'};
const roleLabels={coordinator:'Coordination · تنسيق',executor:'Claude Code / Executor · تنفيذ','independent-reviewer':'Astra / Reviewer · مراجعة'};
const value=v=>typeof v==='string'?v.slice(0,160):'';
export default async function KnowledgeCenter({searchParams}){
 const session=await getSession();
 if(!session)redirect('/login');
 if(session.must_change_password)redirect('/owner/setup');
 const raw=await searchParams||{};
 const filters={q:value(raw.q),app:value(raw.app),kind:value(raw.kind),status:value(raw.status)};
 const rows=filterKnowledge(knowledge,filters);
 const requested=Number(value(raw.page));
 const pages=Math.max(1,Math.ceil(rows.length/24));
 const current=Number.isSafeInteger(requested)&&requested>0?Math.min(requested,pages):1;
 const visible=rows.slice((current-1)*24,current*24);
 const pageHref=n=>'/console/knowledge?'+new URLSearchParams({...filters,page:String(n)}).toString()+'#knowledge-results';
 const tasks=await readKnowledgeTasks();
 const shownTasks=tasks.filter(t=>!filters.app||t.app_id===filters.app);
 return <>
  <div className="os-page-title"><div><span className="os-kicker"><i/> KNOWLEDGE CENTER / V2</span><h1>ذاكرة <em>المشاريع.</em></h1><p>فهرس المعرفة التقنية المنقّحة، بالمعرفات الأصلية ومصادرها. Centre de connaissances — lecture seule.</p></div><div className="os-page-actions"><span className="os-snapshot">INDEX <strong>HISTORICAL</strong></span></div></div>
  <div className="os-evidence-callout"><div><strong>الفهرس تاريخي؛ حالة المهام من GitHub عند الزيارة.</strong><p>لا بيانات عملاء أو محادثات خام. الفهرس تاريخي؛ حالة مهام GitHub أدناه تُقرأ عند زيارة الصفحة من مصادر عامة محددة. لا مزامنة خاصة أو استيراد دائم بعد.</p></div></div>
  <p><a className="os-panel-link" href="#knowledge-tasks">مهام النماذج ({shownTasks.length}) ↓</a> · <a className="os-panel-link" href="#knowledge-results">سجلات المعرفة ({rows.length}) ↓</a></p>
  <section id="knowledge-results" className="os-map-surface" aria-label="Knowledge filters">
   <form method="GET" action="/console/knowledge" style={{display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'end',marginBottom:'20px'}}>
    <label style={{display:'grid',gap:'6px',flex:'1 1 220px'}}>بحث / Recherche<input name="q" defaultValue={filters.q} maxLength={160} placeholder="OCR, F26, backup…" style={{padding:'10px',borderRadius:'8px'}}/></label>
    <label style={{display:'grid',gap:'6px'}}>المشروع<select name="app" defaultValue={filters.app} style={{padding:'10px',borderRadius:'8px'}}><option value="">الكل / Tous</option>{Object.entries(APPLICATIONS).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <label style={{display:'grid',gap:'6px'}}>النوع<select name="kind" defaultValue={filters.kind} style={{padding:'10px',borderRadius:'8px'}}><option value="">الكل</option>{Object.entries(options).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <label style={{display:'grid',gap:'6px'}}>الحالة<select name="status" defaultValue={filters.status} style={{padding:'10px',borderRadius:'8px'}}><option value="">الكل</option>{Object.entries(statuses).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <button className="os-action-solid" type="submit">بحث</button><a href="/console/knowledge" className="os-panel-link">إعادة الضبط</a>
   </form>
   <p role="status">{rows.length} / {knowledge.length} سجل · Enregistrements</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:'12px',marginTop:'16px'}}>
    {visible.map(r=><article key={r.identity} style={{border:'1px solid currentColor',borderRadius:'12px',padding:'16px',overflowWrap:'anywhere'}}>
     <small dir="ltr">{APPLICATIONS[r.app_id]} · {r.id}</small><h2 style={{fontSize:'1.05rem',margin:'10px 0'}} dir="auto">{r.title}</h2>
     <p>{options[r.kind]} · {statuses[r.status]}</p>
     {r.kind==='relationship'&&<p>إعادة استخدام مقترحة: {relationApps(r.id).map(id=>APPLICATIONS[id]).join(' · ')} — قواعد بيانات مستقلة.</p>}
     {r.kind==='risk'&&relatedApps(r).length>0&&<p>نطاق المراجعة التاريخية: {relatedApps(r).map(id=>APPLICATIONS[id]).join(' · ')}</p>}<p dir="ltr"><small>{r.observed_on} · {r.source_revision.slice(0,7)}</small></p>
     <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="os-panel-link">المصدر / Source ↗</a>
    </article>)}
   </div>
   {!rows.length&&<p>لا توجد نتيجة مطابقة. / Aucun résultat.</p>}
   {pages>1&&<nav aria-label="صفحات المعرفة" style={{display:'flex',gap:'16px',marginTop:'16px',alignItems:'center'}}>{current>1&&<a className="os-panel-link" href={pageHref(current-1)}>السابق</a>}<span dir="ltr">{current} / {pages}</span>{current<pages&&<a className="os-panel-link" href={pageHref(current+1)}>التالي</a>}</nav>}
  </section>
  <section id="knowledge-tasks" className="os-map-surface" aria-label="Agent task tracking" style={{marginTop:'20px'}}>
   <h2>مهام النماذج · Suivi des tâches</h2>
   <p>حالات GitHub العامة، للقراءة فقط. الدور المقترح ليس تعييناً أو إثباتاً بأن نموذجاً يعمل الآن. تحديث عند زيارة الصفحة، بذاكرة مؤقتة 15 دقيقة لكل عملية خادم.</p>
   <p role="status">{shownTasks.length} مهمة · {shownTasks.filter(t=>t.state==='UNKNOWN').length} غير متاحة</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:'12px',marginTop:'16px'}}>
    {shownTasks.map(t=><article key={t.repo+':'+t.type+':'+t.number} style={{border:'1px solid currentColor',borderRadius:'12px',padding:'16px',overflowWrap:'anywhere'}}>
     <small dir="ltr">{APPLICATIONS[t.app_id]} · #{t.number}</small>
     <h3 dir="auto">{t.title}</h3><p>{roleLabels[t.role]}</p>
     <p dir="ltr"><strong>{t.state}</strong>{t.head_sha?' · '+t.head_sha.slice(0,7):''}</p>
     <small dir="ltr">Observed: {t.observed_at}</small>
     {t.updated_at&&<p><small dir="ltr">Source updated: {t.updated_at}</small></p>}
     <p>حالة المهمة لا تثبت نجاح الاختبارات أو النشر.</p>
     <a href={t.source_url} target="_blank" rel="noopener noreferrer" className="os-panel-link">GitHub ↗</a>
    </article>)}
   </div>
   {!shownTasks.length&&<p>لا توجد مهام ضمن المصادر المحددة لهذا المشروع.</p>}
  </section>
 </>;
}
