import Link from 'next/link';
import Icon from '../../../components/icons';
export default function Incidents(){
 return <><div className="os-page-title"><div><span className="os-kicker"><i/> INCIDENT OPERATIONS / 006</span><h1>سجل <em>الحوادث.</em></h1><p>مساحة لتجميع أدلة الحوادث وربطها بالتغييرات التشغيلية. لن تُنشأ حوادث اصطناعية أو توصف المراقبة غير المكتملة بأنها سليمة.</p></div><div className="os-page-actions"><span className="os-snapshot">STATE <strong>NOT CONNECTED</strong></span></div></div>
  <div className="os-empty-workspace"><span className="os-empty-icon"><Icon name="alert" size={28}/></span><span className="os-panel-overline">INCIDENT PIPELINE / NOT ACTIVATED</span><h2>لا يوجد حتى الآن مصدر حوادث مهيأ.</h2><p>لا تعني هذه الرسالة عدم وقوع أعطال؛ تعني أن NEXUS لم يربط بعد سجلات أحداث التطبيقات وCI ومزودي التشغيل. ستظهر هنا الحوادث المؤكدة فقط، مع وقتها وأدلتها وخطة المعالجة.</p><div className="os-empty-actions"><Link href="/console/observability" className="os-action-solid">عرض القياسات الحالية <Icon name="arrow" size={16}/></Link><Link href="/console/integrations" className="os-action-outline">إعداد المصادر</Link></div></div>
 </>;
}