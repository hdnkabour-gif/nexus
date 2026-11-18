import Link from 'next/link';
import {portfolio,snapshotAt} from '../../lib/data.js';
import {latestHttpChecks,publicProbeTargets} from '../../lib/public-probes.js';
import {summarizeHttpPortfolio} from '../../lib/command-os.js';
import Icon from '../../components/icons';
import Status from '../../components/status';
import SignalCard from '../../components/command-os/signal-card.jsx';
export const dynamic='force-dynamic';
function dateLabel(ms){return ms?new Date(ms).toISOString().slice(0,16).replace('T',' ')+' UTC':'لا توجد قراءة حديثة';}
export default async function Overview(){
 let checks=[],queryFailed=false;
 try{checks=await latestHttpChecks();}catch{queryFailed=true;}
 const summary=summarizeHttpPortfolio(portfolio,checks,publicProbeTargets());
 const measured=[...checks].filter(x=>Number.isFinite(new Date(x.measured_at).getTime()))
  .sort((a,b)=>new Date(b.measured_at).getTime()-new Date(a.measured_at).getTime()).slice(0,5);
 return <>
  <div className="os-page-title">
   <div><span className="os-kicker"><i/> COMMAND SURFACE / 001</span><h1>نظرة <em>تشغيلية</em> على المنظومة.</h1><p>اكتشاف العلاقات، قراءة الإشارات المتاحة، وتحديد ما يحتاج إلى دليل — دون نتائج مفترضة.</p></div>
   <div className="os-page-actions"><span className="os-snapshot">SOURCE SNAPSHOT <strong>{snapshotAt}</strong></span><Link href="/console/observability" className="os-action-solid">مراجعة المراقبة <Icon name="arrow" size={17}/></Link></div>
  </div>
  <div className="os-signal-band" aria-label="مؤشرات المراقبة">
   <SignalCard code="01" label="APP REGISTRY" value={String(summary.appProfiles).padStart(2,'0')} detail="تطبيقات معروفة من جرد تاريخي" icon="layers"/>
   <SignalCard code="02" label="HTTP COVERAGE" value={summary.freshCount+' / '+summary.targets} detail="نقاط لديها قياس حديث خلال 20 دقيقة" icon="pulse" tone={summary.freshCount?'mint':'neutral'}/>
   <SignalCard code="03" label="HTTP 5XX" value={summary.freshCount?String(summary.httpErrors):'—'} detail={summary.freshCount?'أخطاء HTTP موثقة فقط':'لا تكفي البيانات لتحديد الأخطاء'} icon="alert" tone={summary.httpErrors?'critical':'neutral'}/>
   <SignalCard code="04" label="RESTORE PROOF" value="—" detail="لا توجد أدلة استرجاع معزول مثبتة" icon="database"/>
  </div>
  <div className="os-middle-grid">
   <section className="os-map-surface">
    <div className="os-panel-head"><div><span className="os-panel-overline">SYSTEM LATTICE / DISCOVERY MAP</span><h2>شبكة التطبيقات</h2></div><Link href="/console/topology" className="os-panel-link">خريطة العلاقات <Icon name="arrow" size={16}/></Link></div>
    <div className="os-lattice">
     <div className="os-lattice-path" aria-hidden="true"><span/><span/><span/></div>
     <div className="os-lattice-core"><span className="os-core-ticks">CONTROL PLANE</span><div className="os-core-mark"><i/><i/><i/><i/></div><strong>NEXUS</strong><small>OBSERVATION / ONLY</small></div>
     <div className="os-lattice-endpoints">{summary.grouped.map(({app,status,verified,total})=><Link className="os-lattice-node" key={app.app_id} href={'/console/apps/'+app.app_id}><span className={'os-lattice-glyph '+app.accent}>{app.icon}</span><span><strong>{app.name}</strong><small>{total?verified+' / '+total+' HTTP حديث':'بيانات الجرد فقط'}</small></span><span className={'os-node-point '+(status==='critical'?'critical':status==='connected'?'observed':'unverified')}/></Link>)}</div>
    </div>
    <div className="os-panel-foot"><span><span className="os-legend-dot os-dot-cyan"/> مستودع معروف</span><span><span className="os-legend-dot os-dot-amber"/> الاتصال الداخلي غير متحقق</span><span>الروابط هنا تمثل الجرد، لا مسارات الشبكة الحية</span></div>
   </section>
   <section className="os-focus-surface">
    <div className="os-panel-head"><div><span className="os-panel-overline">ACTION QUEUE / EVIDENCE GAPS</span><h2>أولوية التحقق</h2></div><span className="os-count-chip">03 OPEN</span></div>
    <div className="os-focus-row"><span>01</span><div><strong>ربط مصادر GitHub وRailway</strong><p>توجد ملفات جرد، لكن لا توجد مفاتيح NEXUS مخصصة للقراءة الحية.</p></div><Link href="/console/integrations" aria-label="عرض اتصالات GitHub وRailway"><Icon name="arrow" size={16}/></Link></div>
    <div className="os-focus-row"><span>02</span><div><strong>النسخ والاسترجاع</strong><p>لا توجد في NEXUS أدلة كافية لإثبات الاسترجاع المعزول للتطبيقات.</p></div><Link href="/console/backups" aria-label="عرض النسخ الاحتياطية"><Icon name="arrow" size={16}/></Link></div>
    <div className="os-focus-row"><span>03</span><div><strong>تغطية التطبيقات الداخلية</strong><p>الفحص الحالي لروابط HTTPS فقط؛ لا يثبت سلامة المال أو المستندات أو الأعمال.</p></div><Link href="/console/observability" aria-label="عرض المراقبة"><Icon name="arrow" size={16}/></Link></div>
    <div className="os-focus-summary"><Icon name="shield" size={17}/><span>لا أوامر تعديل أو استرجاع إنتاج مفعّلة.</span></div>
   </section>
  </div>
  <div className="os-bottom-grid">
   <section className="os-table-surface"><div className="os-panel-head"><div><span className="os-panel-overline">FLEET / APPLICATION MATRIX</span><h2>حالة التطبيقات</h2></div><Link className="os-panel-link" href="/console/apps">فتح السجل <Icon name="arrow" size={16}/></Link></div>
    <div className="os-table-wrap"><table className="os-matrix"><thead><tr><th>التطبيق</th><th>دليل HTTP</th><th>نسخ احتياطية</th><th>المصدر</th><th></th></tr></thead><tbody>{summary.grouped.map(({app,status,label,verified,total})=><tr key={app.app_id}><td><div className="os-matrix-name"><span className={'os-app-glyph '+app.accent}>{app.icon}</span><span><strong>{app.name}</strong><small dir="ltr">{app.repository.split('/')[1]}</small></span></div></td><td><Status state={status} label={label}/><small className="os-understatus">{verified} من {total} فحوص حديثة</small></td><td><Status state="unknown" label="غير مثبت"/></td><td><span className="os-origin-type">SNAPSHOT</span></td><td><Link href={'/console/apps/'+app.app_id} aria-label={'تفاصيل '+app.name}><Icon name="arrow" size={16}/></Link></td></tr>)}</tbody></table></div>
   </section>
   <aside className="os-stream-surface"><div className="os-panel-head"><div><span className="os-panel-overline">SIGNAL JOURNAL / LATEST MEASURES</span><h2>آخر قياسات HTTP</h2></div><Icon name="activity" size={18}/></div>
    {queryFailed?<div className="os-stream-empty"><Icon name="alert"/><strong>تعذر جلب نتائج المراقبة.</strong><p>تعرض المنصة الحالة غير مؤكدة، وليس سليمة.</p></div>:measured.length?measured.map((x,i)=><div className="os-event-row" key={x.app_id+'-'+x.environment+'-'+x.host}><span className="os-event-index">{String(i+1).padStart(2,'0')}</span><div><strong>{portfolio.find(a=>a.app_id===x.app_id)?.name||x.app_id}</strong><small dir="ltr">{x.environment} · HTTP {x.status_code??'—'}</small></div><span className={'os-event-result '+(x.stale?'is-stale':x.state==='unreachable'?'is-failed':'')}>{x.stale?'قديم':x.state==='reachable'?'استجابة':x.state==='unreachable'?'خطأ':'غير مؤكد'}</span><time>{new Date(x.measured_at).toISOString().slice(11,16)} UTC</time></div>):<div className="os-stream-empty"><Icon name="clock" size={23}/><strong>لا توجد قياسات محفوظة بعد.</strong><p>الفحص المجدول أو التحديث اليدوي سيضيف نتائج موثقة.</p></div>}
    <div className="os-journal-footer"><span>أحدث قياس حديث: {dateLabel(summary.lastAt)}</span><Link href="/console/observability">عرض الأدلة <Icon name="arrow" size={14}/></Link></div>
   </aside>
  </div>
 </>;
}