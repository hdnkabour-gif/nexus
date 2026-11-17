import Link from 'next/link';
import {portfolio,portfolioStats,snapshotAt} from '../../lib/data.js';
import Icon from '../../components/icons';
import Status from '../../components/status';
const quick=[
 {icon:'layers',title:'استكشاف التطبيقات',desc:'المستودعات والبيئات والعلاقات',href:'/console/apps',tone:'mint'},
 {icon:'nodes',title:'خريطة المنظومة',desc:'الاعتماديات والاتصالات',href:'/console/topology',tone:'blue'},
 {icon:'database',title:'سلامة النسخ',desc:'إثباتات النسخ والاسترجاع',href:'/console/backups',tone:'violet'}
];
export default function Overview(){
 return <>
  <div className="page-header">
   <div><div className="eyebrow"><span className="eyebrow-line"/> MISSION CONTROL · 001</div><h1>مرحباً بك في <span className="gradient-text">NEXUS</span></h1><p className="subtitle">نظرة موحّدة على منظومة تطبيقاتك، من المصدر إلى التشغيل والحماية.</p></div>
   <div className="header-action"><span className="info-chip"><Icon name="clock" size={16}/> آخر جرد: {snapshotAt}</span><Link className="btn outline" href="/console/apps">استكشف التطبيقات <Icon name="arrow" size={16}/></Link></div>
  </div>
  <section className="hero-panel"><div className="hero-copy"><span className="hero-kicker"><span className="pulse-dot"/> NEXUS INTELLIGENCE ENGINE</span><h2>كل تطبيق.<br/><span>صورة واحدة واضحة.</span></h2><p>تعرّف على البنية والأسماء والعلاقات وبيئات Railway والمستودعات، ثم أضف مصادر المراقبة الحية بأمان. لن نعرض حالة خضراء دون دليل.</p><div className="hero-actions"><Link href="/console/topology" className="btn primary">عرض خريطة العلاقات <Icon name="arrow" size={17}/></Link><Link href="/console/integrations" className="btn ghost">إعداد الاتصالات</Link></div></div>
  <div className="hero-visual" aria-hidden="true"><div className="orbit orbit-1"/><div className="orbit orbit-2"/><div className="orbit orbit-3"/><div className="core"><span className="core-diamond">✧</span><strong>N</strong><small>CORE</small></div><span className="satellite s1">P</span><span className="satellite s2">A</span><span className="satellite s3">R</span><span className="satellite s4">N</span><span className="satellite s5">S</span><span className="satellite s6">T</span></div></section>
  <div className="section-title"><div><span className="section-eyebrow">PORTFOLIO PULSE</span><h2>ملخص المنظومة</h2></div><span className="dim-label">بيانات جرد تاريخية · غير حية</span></div>
  <div className="kpi-grid">
   <div className="kpi-card"><div className="kpi-top"><span>التطبيقات المسجلة</span><span className="kpi-icon mint"><Icon name="layers"/></span></div><strong>{portfolioStats.applications.toString().padStart(2,'0')}</strong><p>تطبيقات معروفة في الجرد</p><div className="kpi-foot"><span className="kpi-small-line"/><span>6 Application Profiles</span></div></div>
   <div className="kpi-card"><div className="kpi-top"><span>مشروعات Railway</span><span className="kpi-icon blue"><Icon name="nodes"/></span></div><strong>{portfolioStats.railway_projects.toString().padStart(2,'0')}</strong><p>مشروعات اكتُشفت بالموصل المصرّح به</p><div className="kpi-foot"><span className="kpi-small-line"/><span>Snapshot only</span></div></div>
   <div className="kpi-card"><div className="kpi-top"><span>اتصالات حية موثّقة</span><span className="kpi-icon amber"><Icon name="plug"/></span></div><strong>00</strong><p>تحتاج إلى مفاتيح قراءة مخصصة</p><div className="kpi-foot"><span className="kpi-small-line amber-line"/><span>Pending configuration</span></div></div>
   <div className="kpi-card"><div className="kpi-top"><span>استرجاعات تم التحقق منها</span><span className="kpi-icon violet"><Icon name="database"/></span></div><strong>00</strong><p>لا توجد بعدُ تقارير استرجاع مستقلة</p><div className="kpi-foot"><span className="kpi-small-line violet-line"/><span>Unknown ≠ Healthy</span></div></div>
  </div>
  <div className="content-duo">
   <section className="panel app-table-panel"><div className="panel-head"><div><span className="section-eyebrow">APPLICATION REGISTRY</span><h3>تطبيقات المنظومة</h3></div><Link href="/console/apps" className="text-link">جميع التطبيقات <Icon name="arrow" size={15}/></Link></div><div className="app-table-head"><span>التطبيق</span><span>المجال</span><span>المراقبة</span><span></span></div>
    {portfolio.slice(0,5).map(app=><Link href={'/console/apps/'+app.app_id} key={app.app_id} className="app-table-row"><div className="app-name-cell"><span className={'app-symbol '+app.accent}>{app.icon}</span><div><strong>{app.name}</strong><small>{app.repository}</small></div></div><span className="domain-label">{app.label}</span><Status state="unknown"/><Icon name="chevron" size={17}/></Link>)}
   </section>
   <aside className="overview-aside"><div className="panel attention-panel"><div className="panel-head"><div><span className="section-eyebrow">READINESS STATUS</span><h3>قبل المراقبة المباشرة</h3></div><Icon name="alert" size={22}/></div><div className="attention-item"><span className="attention-number">01</span><div><strong>بيانات اعتماد مستقلة</strong><p>إضافة مفاتيح GitHub وRailway بقراءة فقط.</p></div></div><div className="attention-item"><span className="attention-number">02</span><div><strong>فحوص التطبيق الداخلية</strong><p>Adapter آمن يبدأ من PNEU MOUHIM.</p></div></div><div className="attention-item"><span className="attention-number">03</span><div><strong>اختبارات استرجاع معزولة</strong><p>قبل اعتبار أي نسخة احتياطية سليمة.</p></div></div><Link className="aside-link" href="/console/integrations">عرض خطة الربط <Icon name="arrow" size={15}/></Link></div></aside>
  </div>
  <div className="section-title"><div><span className="section-eyebrow">QUICK ACCESS</span><h2>انطلق من هنا</h2></div></div>
  <div className="quick-grid">{quick.map(x=><Link href={x.href} className="quick-card" key={x.href}><span className={'quick-icon '+x.tone}><Icon name={x.icon} size={24}/></span><strong>{x.title}</strong><p>{x.desc}</p><span className="quick-arrow"><Icon name="arrow" size={17}/></span></Link>)}</div>
 </>;
}
