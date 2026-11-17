import Link from 'next/link';
import {portfolio} from '../../../lib/data.js';
import Icon from '../../../components/icons';
export default function Topology(){
 return <><div className="page-header"><div><div className="eyebrow"><span className="eyebrow-line"/> DEPENDENCY MAP · 003</div><h1>خريطة <span className="gradient-text">العلاقات</span></h1><p className="subtitle">منظور أولي لمصادر التطبيقات وخدماتها. العلاقات التفصيلية قيد الاكتشاف.</p></div><span className="info-chip">GRAPH / DISCOVERY ONLY</span></div>
  <div className="panel topology-panel"><div className="panel-head"><div><span className="section-eyebrow">NEXUS KNOWLEDGE GRAPH</span><h3>من القلب إلى التطبيقات</h3></div><span className="badge-outline">6 nodes · غير حية</span></div>
  <div className="topology-visual"><div className="topo-grid" aria-hidden="true"/><div className="topo-hub"><div className="topo-ring"><div className="topo-center">✧<strong>NEXUS</strong><small>CONTROL PLANE</small></div></div></div><div className="topo-satellites">{portfolio.map((app,i)=><Link key={app.app_id} href={'/console/apps/'+app.app_id} className={'topo-node topo-node-'+(i+1)}><span className={'topo-node-icon '+app.accent}>{app.icon}</span><span><strong>{app.name}</strong><small>{app.label}</small></span></Link>)}</div></div>
  <div className="topology-legend"><span><i className="legend-point teal"/> تطبيق معروف</span><span><i className="legend-point amber"/> الاتصال التشغيلي لم يُتحقق</span><span>العلاقات مع الخدمات الخارجية ستضاف بعد الربط الحقيقي</span></div></div>
  <div className="quick-grid"><div className="panel insight-card"><Icon name="code" size={20}/><strong>Source Graph</strong><p>Routes → Controllers → Services → Models → Tables</p></div><div className="panel insight-card"><Icon name="nodes" size={20}/><strong>Runtime Graph</strong><p>App → Railway → Database → Volume → DNS</p></div><div className="panel insight-card"><Icon name="shield" size={20}/><strong>Risk Graph</strong><p>Incident → Evidence → Runbook → Verification</p></div></div>
 </>;
}
