import Icon from '../../../components/icons';
import Status from '../../../components/status';
import {isBootstrapConfigured} from '../../../lib/auth.js';
import {databaseConfigured,dbReady} from '../../../lib/db.js';
export const dynamic='force-dynamic';
export default async function Settings({searchParams}){
 const params=await searchParams;
 const persistent=databaseConfigured() && await dbReady();
 const github=!!process.env.NEXUS_GITHUB_READ_TOKEN;
 const railway=!!process.env.NEXUS_RAILWAY_READ_TOKEN;
 const rows=[
 ['دخول المدير الأول',isBootstrapConfigured(),'تكوين NEXUS_ADMIN_EMAIL + NEXUS_ADMIN_PASSWORD_HASH + NEXUS_SESSION_SECRET'],
 ['GitHub قراءة فقط',github,'NEXUS_GITHUB_READ_TOKEN — رمز خاص بـ NEXUS وبصلاحيات محدودة'],
 ['Railway قراءة فقط',railway,'NEXUS_RAILWAY_READ_TOKEN — رمز خاص بـ NEXUS وبصلاحيات محدودة'],
 ['قاعدة بيانات NEXUS',persistent,'PostgreSQL تشغيلية منفصلة؛ لا تمنح اتصالاً بقواعد بيانات التطبيقات'],
 ['OpenAI / Claude',false,'مراجعة سياسة الخصوصية قبل تمكين AI'],
 ['استرجاع بيانات الإنتاج',false,'مقفل حتى تتوفر الموافقات ونسخ الاسترجاع المختبرة']
 ];
 return <><div className="page-header"><div><div className="eyebrow"><span className="eyebrow-line"/> PLATFORM SETTINGS · 009</div><h1>إعداد <span className="gradient-text">المنصة</span></h1><p className="subtitle">ما هو مجهّز وما هو مطلوب لتفعيل المراقبة الفعلية — دون الكشف عن قيمة أي متغير سري.</p></div></div>
 <section className="panel"><div className="panel-head"><div><span className="section-eyebrow">CONFIGURATION INVENTORY</span><h3>جاهزية الربط</h3></div><Icon name="settings" size={22}/></div>
 {rows.map(([title,configured,desc])=><div className="setting-row" key={title}><div><strong>{title}</strong><small dir="auto">{desc}</small></div><Status state={configured?'connected':'not_connected'} label={configured?'مجهّز':'غير مفعّل'}/></div>)}
 </section>
 {persistent&&<section className="panel" style={{padding:'24px',marginTop:'20px'}}><div className="section-eyebrow">OWNER ACCESS</div><h3>تغيير كلمة مرور المالك</h3><p className="muted">غيّر كلمة المرور مباشرة من NEXUS. تُخزّن القيمة المشفّرة في قاعدة NEXUS، وتُلغى صلاحية جميع الجلسات السابقة الأخرى.</p>{params?.password==='changed'&&<p style={{color:'#52efca'}}>تم تغيير كلمة المرور بنجاح. كلمة المرور القديمة لم تعد مقبولة.</p>}{params?.password==='invalid'&&<p style={{color:'#ffb1b1'}}>تعذر التغيير: تحقق من كلمة المرور الحالية وتطابق الجديدة وطولها.</p>}<form method="POST" action="/api/auth/change-password" className="login-form" style={{maxWidth:'460px'}}><label>كلمة المرور الحالية<input type="password" name="currentPassword" required autoComplete="current-password" dir="ltr"/></label><label>كلمة المرور الجديدة<input type="password" name="newPassword" required minLength={16} maxLength={256} autoComplete="new-password" dir="ltr"/></label><label>تأكيد كلمة المرور الجديدة<input type="password" name="confirmPassword" required minLength={16} maxLength={256} autoComplete="new-password" dir="ltr"/></label><button type="submit" className="btn primary">تغيير كلمة المرور</button></form></section>}
 <div className="notice-strip"><Icon name="shield" size={19}/><div><strong>لا تدخل مفاتيح API في المحادثات أو GitHub.</strong><p>أضفها كمتغيرات خاصة بالخدمة في Railway. يعرض NEXUS حالة وجود المتغير فقط، ولا يعرض قيمته.</p></div></div>
 </>;
}
