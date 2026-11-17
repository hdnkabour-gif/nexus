import Icon from '../../../components/icons';
import Status from '../../../components/status';
export default function Security(){
 const policies=[['الوصول إلى المنصة','مدير واحد مؤقت، جلسات موقّعة ومشفرة من جهة النقل','مفعّل للنسخة الأولى'],['MFA / OIDC','مصادقة متعددة العوامل للمشرفين والموافقات','مطلوب قبل التحكم بالإنتاج'],['البيانات الشخصية','عدم نسخ الزبناء أو ملفات المرضى إلى NEXUS','مبدأ معماري'],['إجراءات الاسترجاع','موافقتان مستقلتان واختبار معزول قبل أي استبدال إنتاج','كل الأوامر معطلة'],['الصلاحيات عبر التطبيقات','RBAC + ABAC لكل تطبيق وبيئة ونوع إجراء','قيد التطوير']];
 return <><div className="page-header"><div><div className="eyebrow"><span className="eyebrow-line"/> SECURITY & TRUST · 008</div><h1>الأمان <span className="gradient-text">والصلاحيات</span></h1><p className="subtitle">فصل واضح بين القدرة على القراءة والقدرة على التأثير في بيانات التطبيقات.</p></div></div>
 <div className="security-hero panel"><span className="security-shield"><Icon name="shield" size={36}/></span><div><span className="section-eyebrow">PROTECTED PREVIEW</span><h2>حماية الوصول إلى البيانات التشغيلية</h2><p>لوحة التحكم لا تُعرض للزوار غير المسجلين، ولا تملك حالياً أوامر مباشرة لتعديل قواعد بيانات التطبيقات.</p></div></div>
 <section className="panel"><div className="panel-head"><div><span className="section-eyebrow">ACCESS POLICY</span><h3>مصفوفة الحماية</h3></div><Icon name="lock" size={20}/></div>
 {policies.map(([name,desc,state])=><div className="policy-row" key={name}><div><strong>{name}</strong><small>{desc}</small></div><span className="policy-state">{state}</span></div>)}
 </section>
 <div className="notice-strip"><Icon name="alert" size={19}/><div><strong>هذه نسخة دخول أولية وليست نظام هوية مؤسسياً.</strong><p>لا يتم تفعيل إدارة المستخدمين الحساسة أو استرجاع قواعد الإنتاج قبل OIDC/MFA وتدقيق الصلاحيات والتخزين الآمن للأسرار.</p></div></div>
 </>;
}
