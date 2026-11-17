import {redirect} from 'next/navigation';
import {getSession} from '../../../lib/auth.js';
import Icon from '../../../components/icons';
import {createCsrfToken,pageCsrfNonce} from '../../../lib/csrf.js';
export const dynamic='force-dynamic';
export default async function OwnerSetup({searchParams}){
 const session=await getSession();
 if(!session)redirect('/login');
 if(!session.must_change_password)redirect('/console');
 const nonce=await pageCsrfNonce();
 if(!nonce)redirect('/api/auth/prepare?next=setup');
 const csrf=createCsrfToken('enroll',nonce);
 const params=await searchParams;
 return <main className="login-page"><section className="login-card">
  <div className="login-heading"><span className="eyebrow">OWNER SECURITY ACTIVATION</span><h1>NEXUS</h1><p>إنشاء كلمة مرورك الخاصة قبل فتح لوحة التحكم.</p></div>
  <div className="login-notice"><Icon name="shield" size={22}/><div><strong>الدخول الأول يتطلب تغيير كلمة المرور</strong><p>أدخل كلمة مرور جديدة لا تقل عن 16 حرفاً. ستُخزن بصيغة scrypt داخل قاعدة NEXUS المنفصلة، ولن تُرسل إلى GitHub أو تظهر في السجلات.</p></div></div>
  {params?.error&&<div className="login-error">تعذر حفظ كلمة المرور. تحقق من تطابقها وطولها ثم أعد المحاولة.</div>}
  <form method="POST" action="/api/auth/enroll" className="login-form">
   <input type="hidden" name="csrf" value={csrf}/>
   <label>كلمة المرور الجديدة <input type="password" name="newPassword" required minLength={16} maxLength={256} autoComplete="new-password" dir="ltr"/></label>
   <label>تأكيد كلمة المرور <input type="password" name="confirmPassword" required minLength={16} maxLength={256} autoComplete="new-password" dir="ltr"/></label>
   <button className="primary-button" type="submit"><Icon name="lock" size={18}/> حفظ كلمة المرور وفتح المنصة</button>
  </form>
  <p className="muted">لتغيير الحساب الحالي لاحقاً، افتح الإعدادات. لا تشارك رمز الدخول المؤقت مع أي شخص.</p>
 </section></main>;
}
