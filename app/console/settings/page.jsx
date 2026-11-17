import Icon from '../../../components/icons';
import Status from '../../../components/status';
import {isBootstrapConfigured} from '../../../lib/auth.js';
export const dynamic='force-dynamic';
export default function Settings(){
 const github=!!process.env.NEXUS_GITHUB_READ_TOKEN;
 const railway=!!process.env.NEXUS_RAILWAY_READ_TOKEN;
 const rows=[
 ['دخول المدير الأول',isBootstrapConfigured(),'تكوين NEXUS_ADMIN_EMAIL + NEXUS_ADMIN_PASSWORD_HASH + NEXUS_SESSION_SECRET'],
 ['GitHub قراءة فقط',github,'NEXUS_GITHUB_READ_TOKEN — رمز خاص بـ NEXUS وبصلاحيات محدودة'],
 ['Railway قراءة فقط',railway,'NEXUS_RAILWAY_READ_TOKEN — رمز خاص بـ NEXUS وبصلاحيات محدودة'],
 ['قاعدة بيانات NEXUS',false,'PostgreSQL + migrations + RBAC (مرحلة التنفيذ التالية)'],
 ['OpenAI / Claude',false,'مراجعة سياسة الخصوصية قبل تمكين AI'],
 ['استرجاع بيانات الإنتاج',false,'مقفل حتى تتوفر الموافقات ونسخ الاسترجاع المختبرة']
 ];
 return <><div className="page-header"><div><div className="eyebrow"><span className="eyebrow-line"/> PLATFORM SETTINGS · 009</div><h1>إعداد <span className="gradient-text">المنصة</span></h1><p className="subtitle">ما هو مجهّز وما هو مطلوب لتفعيل المراقبة الفعلية — دون الكشف عن قيمة أي متغير سري.</p></div></div>
 <section className="panel"><div className="panel-head"><div><span className="section-eyebrow">CONFIGURATION INVENTORY</span><h3>جاهزية الربط</h3></div><Icon name="settings" size={22}/></div>
 {rows.map(([title,configured,desc])=><div className="setting-row" key={title}><div><strong>{title}</strong><small dir="auto">{desc}</small></div><Status state={configured?'connected':'not_connected'} label={configured?'مجهّز':'غير مفعّل'}/></div>)}
 </section>
 <div className="notice-strip"><Icon name="shield" size={19}/><div><strong>لا تدخل مفاتيح API في المحادثات أو GitHub.</strong><p>أضفها كمتغيرات خاصة بالخدمة في Railway. يعرض NEXUS حالة وجود المتغير فقط، ولا يعرض قيمته.</p></div></div>
 </>;
}
