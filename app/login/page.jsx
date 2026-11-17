import {redirect} from 'next/navigation';
import {getSession,isBootstrapConfigured} from '../../lib/auth.js';
import Icon from '../../components/icons';
export const dynamic='force-dynamic';
export default async function Login({searchParams}){
 if(await getSession())redirect('/console');
 const params=await searchParams;
 const ready=isBootstrapConfigured();
 return <div className="login-page">
  <div className="login-glow glow-one"/><div className="login-glow glow-two"/>
  <section className="login-card">
   <div className="login-mark"><span className="brand-symbol"><span/><span/><span/><span/></span></div>
   <div className="login-heading"><span className="eyebrow">UNIFIED CONTROL CENTER</span><h1>NEXUS</h1><p>قلب المنظومة. رؤية واحدة لكل التطبيقات.</p></div>
   {!ready?<div className="login-notice"><Icon name="lock" size={20}/><div><strong>المنصة قيد الإعداد الآمن</strong><p>يجب إعداد بيانات دخول المالك في Railway قبل فتح لوحة التحكم.</p></div></div>:
   <form method="POST" action="/api/auth/login" className="login-form">
    {params?.error&&<div className="login-error">بيانات الدخول غير صحيحة أو انتهت المحاولة. تأكد من المعلومات.</div>}
    <label>البريد الإلكتروني <input type="email" name="email" autoComplete="username" required maxLength={320} placeholder="admin@example.com" dir="ltr"/></label>
    <label>كلمة المرور <input type="password" name="password" autoComplete="current-password" required maxLength={1024} placeholder="••••••••••••" dir="ltr"/></label>
    <button className="primary-button" type="submit"><Icon name="lock" size={18}/> دخول آمن إلى NEXUS <Icon name="arrow" size={17}/></button>
   </form>}
   <div className="login-bottom"><span className="green-dot"/> PRIVATE · READ-ONLY INITIAL RELEASE</div>
  </section>
  <div className="login-aside"><span>SECURE OPERATIONS</span><h2>افهم كل تطبيق.<br/>اكتشف كل مشكلة.<br/><span>تحكّم بثقة.</span></h2><p>GitHub · Railway · Databases · Backups · Diagnostics</p><div className="login-grid-art" aria-hidden="true"><span>01 / DISCOVER</span><span>02 / MONITOR</span><span>03 / UNDERSTAND</span><span>04 / PROTECT</span></div></div>
 </div>;
}
