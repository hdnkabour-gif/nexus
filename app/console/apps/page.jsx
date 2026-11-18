import {portfolio,snapshotAt} from '../../../lib/data.js';
import {latestHttpChecks,publicProbeTargets} from '../../../lib/public-probes.js';
import {summarizeHttpPortfolio} from '../../../lib/command-os.js';
import AppExplorer from '../../../components/command-os/app-explorer.jsx';
import Icon from '../../../components/icons';
export const dynamic='force-dynamic';
export default async function Apps(){
 let checks=[];try{checks=await latestHttpChecks();}catch{}
 const {grouped}=summarizeHttpPortfolio(portfolio,checks,publicProbeTargets());
 return <><div className="os-page-title"><div><span className="os-kicker"><i/> APPLICATION INDEX / 002</span><h1>كل تطبيق. <em>سياقه الكامل.</em></h1><p>ابدأ من المستودع والنطاق والبيئة، ثم انتقل إلى مراقبة الأدلة دون خلط الجرد التاريخي بالحالة الحية.</p></div><div className="os-page-actions"><span className="os-snapshot">DISCOVERED <strong>{snapshotAt}</strong></span></div></div>
  <div className="os-evidence-callout"><Icon name="shield" size={19}/><div><strong>تفاصيل المصدر من الجرد، وقياسات HTTP من NEXUS فقط.</strong><p>حالة HTTP لا تثبت سلامة العمليات أو الكود أو النسخ الاحتياطية. بعض التطبيقات غير مراقبة بموجب قيود الوصول.</p></div></div>
  <AppExplorer applications={grouped}/>
 </>;
}