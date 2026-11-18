import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getApp,snapshotAt} from '../../../../lib/data.js';
import {latestHttpChecks,publicProbeTargets} from '../../../../lib/public-probes.js';
import {scopeHttp} from '../../../../lib/command-os.js';
import Icon from '../../../../components/icons';
import Status from '../../../../components/status';
import LiveProbe from '../../../../components/live-probe';
export const dynamic='force-dynamic';
export default async function AppDetail({params}){
 const {id}=await params;
 const app=getApp(id);
 if(!app)notFound();
 let checks=[];try{checks=await latestHttpChecks();}catch{}
 const evidence=scopeHttp(app,checks,publicProbeTargets());
 const sections=[['#os-source','المصدر'],['#os-infrastructure','الاستضافة'],['#os-monitoring','الإشارات'],['#os-access','الأمان']];
 return <>
  <div className="os-app-breadcrumb"><Link href="/console/apps">سجل التطبيقات</Link><Icon name="chevron" size={15}/><span>{app.name}</span></div>
  <div className="os-app-intro"><span className={'os-app-identity '+app.accent}>{app.icon}</span><div><span className="os-kicker">APPLICATION PROFILE / 360</span><h1>{app.name}</h1><p>{app.description}</p></div><Status state={evidence.status} label={evidence.label}/></div>
  <div className="os-app-tabs">{sections.map(([href,title])=><a key={href} href={href}>{title}</a>)}</div>
  <div className="os-app-stat-grid">
   <div><span>سجل المستودع</span><strong>01</strong><small>مرجع تاريخي مؤكد</small></div>
   <div><span>مشروعات Railway</span><strong>{String(app.railway_projects.length).padStart(2,'0')}</strong><small>من الجرد المؤرشف</small></div>
   <div><span>فحوص HTTP حديثة</span><strong>{evidence.verified} / {evidence.total}</strong><small>آخر 20 دقيقة</small></div>
   <div><span>استرجاع معزول</span><strong>—</strong><small>لا توجد أدلة تحقق</small></div>
  </div>
  <div className="os-app-detail-grid">
   <div className="os-app-detail-stack">
    <section className="os-detail-panel" id="os-source"><div className="os-panel-head"><div><span className="os-panel-overline">01 / SOURCE CONTROL</span><h2>مستودع الكود</h2></div><Icon name="code" size={20}/></div>
     <div className="os-detail-data"><div><span>REPOSITORY</span><strong dir="ltr">{app.repository}</strong></div><div><span>BRANCH</span><strong dir="ltr">main (snapshot)</strong></div><div><span>RECORDED SHA</span><code dir="ltr">{app.main_sha.slice(0,16)}</code></div><div><span>DEPLOYED COMMIT MATCH</span><Status state="unknown" label="لم يُتحقق"/></div><div><span>OBSERVATION DATE</span><strong dir="ltr">{snapshotAt}</strong></div></div>
     <a className="os-detail-bottom" href={'https://github.com/'+app.repository} target="_blank" rel="noopener noreferrer">المستودع في GitHub <Icon name="external" size={16}/></a>
    </section>
    <section className="os-detail-panel" id="os-infrastructure"><div className="os-panel-head"><div><span className="os-panel-overline">02 / INFRASTRUCTURE</span><h2>مشروعات الاستضافة المكتشفة</h2></div><Icon name="nodes" size={20}/></div>
     {app.railway_projects.map(project=><div className="os-host-row" key={project.id}><span className="os-host-letter">R</span><div><strong>{project.name}</strong><small dir="ltr">{project.id}</small><small>{project.shared?'مشروع مشترك؛ يجب التمييز بين الخدمات':'مشروع معروف من الجرد'}</small></div><Status state="unknown" label="تشغيل غير مؤكد"/></div>)}
     <div className="os-detail-bottom os-data-caption">أسماء المشروعات لا تثبت أن نسخة الإنتاج تطابق المستودع.</div>
    </section>
   </div>
   <div className="os-app-detail-stack">
    <section className="os-detail-panel" id="os-monitoring"><div className="os-panel-head"><div><span className="os-panel-overline">03 / HTTP OBSERVATIONS</span><h2>إشارات متاحة</h2></div><Status state={evidence.status} label={evidence.label}/></div>
     {evidence.sources.length?evidence.sources.map(target=><div className="os-host-row" key={target.host}><Icon name="pulse" size={19}/><div><strong dir="ltr">{target.host}</strong><small>{target.environment}</small><small>{target.last?('HTTP '+(target.last.status_code??'—')+' · '+new Date(target.last.measured_at).toISOString().slice(0,16).replace('T',' ')+' UTC'):'لم يسجل أي فحص'}</small></div><Status state={!target.recent?'unknown':target.last.state==='unreachable'?'critical':target.last.state==='reachable'?'connected':'unknown'} label={!target.recent?'قديم/غير مؤكد':target.last.state==='unreachable'?'خطأ HTTP':target.last.state==='reachable'?'رد HTTP':'غير مؤكد'}/></div>):<div className="os-empty-result">لم يُؤذن بمراقبة HTTP لهذا التطبيق، أو لم يتم التعرف على نطاق معتمد.</div>}
     <div className="os-detail-bottom os-data-caption">استجابة HTTP لا تثبت صحة الفواتير أو العقود أو النسخ أو أي منطق تجاري.</div>
    </section>
    <div id="os-access"><LiveProbe id={app.app_id}/></div>
    <section className="os-detail-panel"><div className="os-panel-head"><div><span className="os-panel-overline">04 / SAFE OPERATIONS</span><h2>صلاحيات التحكم</h2></div><Icon name="lock" size={20}/></div>
     <div className="os-locked-message"><Icon name="shield" size={20}/><div><strong>القراءة فقط · أوامر الإنتاج مغلقة</strong><p>لم تُفعّل بعد مفاتيح موصلات مستقلة أو تفويضات لإصلاح البيانات أو الاسترجاع المباشر.</p></div></div>
     <Link className="os-detail-bottom" href="/console/diagnostics">فتح إجراءات التشخيص <Icon name="arrow" size={16}/></Link>
    </section>
   </div>
  </div>
 </>;
}