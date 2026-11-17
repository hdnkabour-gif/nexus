import {portfolio} from '../../../lib/data.js';
import Icon from '../../../components/icons';
import Status from '../../../components/status';
export default function Backups(){
 return <><div className="page-header"><div><div className="eyebrow"><span className="eyebrow-line"/> RESILIENCE · 005</div><h1>النسخ <span className="gradient-text">والاسترجاع</span></h1><p className="subtitle">لا نعتبر النسخ سليمة حتى نثبت سلامة الملفات وقاعدة البيانات ونجاح اختبار الاسترجاع.</p></div><span className="info-chip"><Icon name="lock" size={16}/> Production Restore Locked</span></div>
 <div className="backup-hero panel"><div className="backup-circle"><Icon name="database" size={38}/></div><div><span className="section-eyebrow">RECOVERY ASSURANCE</span><h2>الحماية تبدأ بالدليل، لا بالافتراض</h2><p>ستشمل لوحة الاسترجاع لاحقاً تواريخ النسخ وسلامة الأرشيف وR2/S3 وVolume واختبارات الاسترجاع المعزولة. لن تُشغّل استعادة الإنتاج دون موافقات متعددة.</p></div></div>
 <div className="backup-metrics"><div className="mini-metric"><span>نسخ احتياطية موثقة</span><strong>00</strong></div><div className="mini-metric"><span>اختبارات Restore مثبتة</span><strong>00</strong></div><div className="mini-metric"><span>حالة البيانات</span><strong className="mini-unknown">UNKNOWN</strong></div></div>
 <section className="panel"><div className="panel-head"><div><span className="section-eyebrow">BACKUP STATUS BY APPLICATION</span><h3>سجل التحقق من النسخ</h3></div><span className="dim-label">لا توجد تقارير تشغيل فعلية</span></div>
 {portfolio.map(app=><div className="backup-row" key={app.app_id}><span className={'app-symbol '+app.accent}>{app.icon}</span><div className="backup-name"><strong>{app.name}</strong><small>DB + Files + Offsite + Isolated Restore</small></div><Status state="unknown" label="غير مؤكدة"/><span className="backup-time">لم يُسجّل اختبار</span></div>)}
 </section>
 <div className="notice-strip restore-notice"><Icon name="shield" size={20}/><div><strong>سياسة استرجاع الإنتاج</strong><p>تحديد النسخة والمخاطر، تجربة الاسترجاع في بيئة معزولة، التحقق من الملفات والأرصدة، ثم الموافقة المستقلة. جميع أوامر الاسترجاع معطّلة حالياً.</p></div></div>
 </>;
}
