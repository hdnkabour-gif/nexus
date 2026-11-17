import Icon from '../../../components/icons';
import Status from '../../../components/status';
export default function Observability(){
 const signals=[['الطلبات والأخطاء','OpenTelemetry / HTTP / 5xx'],['النشر وCI','GitHub Actions / Railway'],['الطوابير والمهام','Queue, Cron & Workers'],['الاتصال بالشبكة','DNS, TLS, External APIs'],['سلامة بيانات الأعمال','Source-side integrity probes']];
 return <><div className="page-header"><div><div className="eyebrow"><span className="eyebrow-line"/> OBSERVABILITY · 004</div><h1>المراقبة <span className="gradient-text">والأعطال</span></h1><p className="subtitle">إشارات موثّقة بدلاً من ألوان خضراء بلا دليل. ستظهر هنا الحوادث الحقيقية بعد ربط المصادر.</p></div></div>
  <div className="notice-strip"><Icon name="alert" size={19}/><div><strong>لم تُفعّل اتصالات مراقبة NEXUS بعد.</strong><p>حالة التطبيقات الحقيقية غير معروفة. لا يعني غياب الحوادث هنا غياب الأعطال في التطبيقات.</p></div></div>
  <div className="section-title"><div><span className="section-eyebrow">OBSERVABILITY PILLARS</span><h2>مصادر الإشارات</h2></div></div>
  <div className="signal-grid">{signals.map((s,i)=><section className="panel signal-card" key={s[0]}><div className="signal-head"><span className="signal-index">0{i+1}</span><Status state="not_connected"/></div><Icon name={i===0?'pulse':i===1?'code':i===2?'activity':i===3?'plug':'shield'} size={26}/><strong>{s[0]}</strong><small>{s[1]}</small><p>لا توجد قياسات أو أدلة حية متاحة بعد.</p></section>)}</div>
  <section className="panel"><div className="panel-head"><div><span className="section-eyebrow">INCIDENT TIMELINE</span><h3>سجل الحوادث</h3></div><span className="dim-label">NOT CONNECTED</span></div><div className="empty-state"><span className="empty-icon"><Icon name="pulse" size={30}/></span><h3>في انتظار أول إشارة موثوقة</h3><p>سنربط مصدر الأحداث ووقت التحقق ورقم النشر وسجل الحادث هنا، دون كشف أسرار أو بيانات العملاء.</p></div></section>
 </>;
}
