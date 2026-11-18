import Link from 'next/link';
import {portfolio,snapshotAt} from '../../../lib/data.js';
import Icon from '../../../components/icons';
export default function Topology(){
 const projects=new Set(portfolio.flatMap(x=>x.railway_projects.map(y=>y.id)));
 return <>
  <div className="os-page-title"><div><span className="os-kicker"><i/> SOURCE TO RUNTIME / 003</span><h1>خريطة <em>الاعتماديات.</em></h1><p>اربط التطبيق بمستودعه ومشروعات الاستضافة التي عُرفت خلال الجرد؛ المسارات الداخلية والخدمات غير المتحققة لا تُرسم كعلاقات مؤكدة.</p></div><div className="os-page-actions"><span className="os-snapshot">DISCOVERY DATE <strong>{snapshotAt}</strong></span></div></div>
  <div className="os-topology-legend"><span><i/> {portfolio.length} ملفات تطبيقات</span><span><i/> {projects.size} مشروعات Railway معروفة</span><span>كل علاقة أدناه من الجرد التاريخي</span></div>
  <section className="os-topology-canvas"><div className="os-panel-head"><div><span className="os-panel-overline">KNOWLEDGE GRAPH / VERIFIED SNAPSHOT RELATIONS</span><h2>تطبيق ← مستودع ← مشروع استضافة</h2></div><span className="os-count-chip">DISCOVERY ONLY</span></div>
   <div className="os-topology-apps">{portfolio.map(app=><div className="os-topology-chain" key={app.app_id}>
    <Link href={'/console/apps/'+app.app_id} className="os-topology-app"><span className={'os-explorer-glyph '+app.accent}>{app.icon}</span><span><strong>{app.name}</strong><small>{app.label}</small></span><Icon name="arrow" size={17}/></Link>
    <div className="os-topology-edge" aria-hidden="true"><i/><span>REPO IN INVENTORY</span><i/></div>
    <div className="os-topology-repo"><Icon name="code" size={17}/><div><strong dir="ltr">{app.repository}</strong><small>main SHA من الجرد · لا تطابق نشر مؤكداً</small></div></div>
    <div className="os-topology-edge" aria-hidden="true"><i/><span>HOSTING INVENTORY</span><i/></div>
    <div className="os-topology-projects">{app.railway_projects.map(p=><span key={p.id} className={p.shared?'os-shared':''}><b>R</b>{p.name}<small>{p.shared?'مشترك':'محدد بالجرد'}</small></span>)}</div>
   </div>)}</div>
   <div className="os-panel-foot"><span>الربط مع الخدمات الفردية وQueues وVolumes يحتاج التحقق من موصل Railway الحقيقي.</span></div>
  </section>
 </>;
}