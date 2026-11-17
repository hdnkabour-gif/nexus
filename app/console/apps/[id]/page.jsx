import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getApp,snapshotAt} from '../../../../lib/data.js';
import Icon from '../../../../components/icons';
import Status from '../../../../components/status';
import LiveProbe from '../../../../components/live-probe';
export default async function AppDetail({params}){
 const {id}=await params;
 const app=getApp(id);
 if(!app)notFound();
 return <><div className="detail-breadcrumb"><Link href="/console/apps">التطبيقات</Link><Icon name="chevron" size={15}/><strong>{app.name}</strong></div>
 <div className="detail-hero panel"><span className={'detail-icon '+app.accent}>{app.icon}</span><div className="detail-main"><span className="eyebrow">{app.label}</span><h1>{app.name}</h1><p>{app.description}</p><div className="detail-tags">{app.modules.map(x=><span key={x}>{x}</span>)}</div></div><div className="detail-status"><Status state="unknown" label="الحالة الفعلية غير معروفة"/><small>فحص آخر جرد: {snapshotAt}</small></div></div>
 <div className="detail-metrics"><div className="mini-metric"><span>مستودعات أساسية</span><strong>01</strong></div><div className="mini-metric"><span>مشروعات استضافة معروفة</span><strong>{app.railway_projects.length.toString().padStart(2,'0')}</strong></div><div className="mini-metric"><span>حالة النسخ الاحتياطية</span><strong className="mini-unknown">UNKNOWN</strong></div><div className="mini-metric"><span>الأوامر المفعلة</span><strong>00</strong></div></div>
 <div className="content-duo detail-duo"><div className="detail-stack">
  <section className="panel"><div className="panel-head"><div><span className="section-eyebrow">SOURCE CONTROL</span><h3>الكود والمصدر</h3></div><Icon name="code" size={20}/></div>
   <div className="info-table"><div><span>Repository</span><strong dir="ltr">{app.repository}</strong></div><div><span>Branch</span><strong>main</strong></div><div><span>SHA المؤرشف</span><code dir="ltr">{app.main_sha.slice(0,12)}</code></div><div><span>مطابقة نسخة الإنتاج</span><Status state="unknown" label="لم يُتحقق"/></div></div>
   <a className="panel-bottom-link" href={'https://github.com/'+app.repository} target="_blank" rel="noopener noreferrer">فتح المستودع على GitHub <Icon name="external" size={16}/></a>
  </section>
  <section className="panel"><div className="panel-head"><div><span className="section-eyebrow">INFRASTRUCTURE</span><h3>الاستضافة والبيئات</h3></div><Icon name="nodes" size={20}/></div>
   {app.railway_projects.map(project=><div className="project-row" key={project.id}><span className="project-icon">R</span><div><strong>{project.name}</strong><small>{project.shared?'مشروع مشترك مع تطبيق آخر':'مشروع مخصص حسب الجرد'}</small></div><Status state="unknown" label="لم يتم التحقق حياً"/></div>)}
  </section>
 </div><div className="detail-stack">
  <LiveProbe id={app.app_id}/>
  <section className="panel"><div className="panel-head"><div><span className="section-eyebrow">SAFE ACTIONS</span><h3>تشخيص وتحكم</h3></div><Icon name="shield" size={20}/></div><div className="notice-inline"><Icon name="lock" size={19}/><div><strong>الأوامر الإنتاجية مقفلة</strong><p>لم تُنشأ بعدُ Adapters أو موافقات تسمح بتغيير بيانات التطبيقات. أول ربط سيكون للقراءة فقط.</p></div></div><Link href="/console/diagnostics" className="panel-bottom-link">مراجعة خطة التشخيص <Icon name="arrow" size={15}/></Link></section>
 </div></div>
 </>;
}
