import Link from 'next/link';
import Icon from '../../../components/icons';
export default function Assistant(){
 return <><div className="os-page-title"><div><span className="os-kicker"><i/> INTELLIGENCE LAYER / 009</span><h1>مساعد <em>NEXUS.</em></h1><p>المساعد المستقبلي سيكون مبنياً على الأدلة ومحدود الصلاحيات. لن نعرض نافذة محادثة شكلية توحي بأن OpenAI أو Claude متصلان.</p></div><div className="os-page-actions"><span className="os-snapshot">MODEL ACCESS <strong>NOT CONNECTED</strong></span></div></div>
  <section className="os-empty-workspace"><span className="os-empty-icon"><Icon name="brain" size={30}/></span><span className="os-panel-overline">EVIDENCE-GROUNDED ASSISTANCE</span><h2>المحرك الذكي غير مفعّل بعد.</h2><p>الربط يتطلب مفتاح API مستقل، سياسة لتنقية المعلومات، حدود تكلفة ومراجعة أمنية قبل مشاركة أي ملاحظة تشغيلية. بيانات المرضى وبيئة صاحب العمل تبقى خارج النظام إلا بتفويض صريح.</p><div className="os-empty-actions"><Link className="os-action-solid" href="/console/integrations">استعراض التكاملات <Icon name="arrow" size={17}/></Link><Link className="os-action-outline" href="/console/diagnostics">خطط التشخيص</Link></div></section>
 </>;
}