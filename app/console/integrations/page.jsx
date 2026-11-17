import Icon from '../../../components/icons';
import Status from '../../../components/status';
const groups=[
 {heading:'المصدر والاستضافة',icon:'code',services:['GitHub / CI / Pull Requests','Railway / Deployments / Metrics','PostgreSQL / Database health','Redis / Queue / Scheduler']},
 {heading:'النسخ والبنية الخارجية',icon:'database',services:['S3 / Cloudflare R2','Railway Volumes / PITR','DNS / TLS / Domain','Cloudflare CDN / WAF']},
 {heading:'عمليات التطبيقات',icon:'plug',services:['Promo Livraison / Deliveries','Payments / Reconciliation','Mail / SMS / WhatsApp','OCR / Documents pipelines']},
 {heading:'الذكاء والتشخيص',icon:'brain',services:['OpenAI API','Claude API / Claude Code','OpenTelemetry / Logs / Traces','Security Scanning / SBOM']}
];
export default function Integrations(){
 return <><div className="page-header"><div><div className="eyebrow"><span className="eyebrow-line"/> EXTERNAL ECOSYSTEM · 007</div><h1>الخدمات <span className="gradient-text">الخارجية</span></h1><p className="subtitle">عقود ربط قابلة للتوسعة، مخصصة لكل تطبيق وبيئة، مع أقل الصلاحيات اللازمة.</p></div></div>
 <div className="notice-strip"><Icon name="shield" size={19}/><div><strong>لا توجد مفاتيح مزودين مفعلة في NEXUS.</strong><p>الاتصالات الحية ستعمل بعد توفير رموز قراءة مستقلة في Railway، دون نسخ الأسرار إلى GitHub أو واجهة المتصفح.</p></div></div>
 <div className="integration-grid">{groups.map(group=><section className="panel integration-group" key={group.heading}><div className="panel-head"><div className="group-head"><span className="group-head-icon"><Icon name={group.icon} size={21}/></span><h3>{group.heading}</h3></div></div>{group.services.map(s=><div className="integration-row" key={s}><span className="integration-dot"/><span>{s}</span><Status state="not_connected"/></div>)}</section>)}</div>
 <div className="notice-strip"><Icon name="lock" size={19}/><div><strong>روابط التكوين الحساسة</strong><p>كل تكامل يحتاج تحديد الحساب والنطاق والصلاحيات والاختبارات. لا نستخدم حساب ChatGPT أو Claude الشخصي تلقائياً كمفتاح API.</p></div></div>
 </>;
}
