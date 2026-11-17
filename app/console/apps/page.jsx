import Link from 'next/link';
import {portfolio,snapshotAt} from '../../../lib/data.js';
import Icon from '../../../components/icons';
import Status from '../../../components/status';
export default function Apps(){
 return <><div className="page-header"><div><div className="eyebrow"><span className="eyebrow-line"/> APP REGISTRY · 002</div><h1>جميع <span className="gradient-text">التطبيقات</span></h1><p className="subtitle">بطاقة تعريف واضحة لكل مشروع ومصدره وبيئات التشغيل المرتبطة به.</p></div><span className="info-chip"><Icon name="clock" size={16}/> آخر جرد {snapshotAt}</span></div>
  <div className="notice-strip"><Icon name="eye" size={18}/><div><strong>المصدر: بيانات جرد موثقة، وليست مراقبة حية.</strong><p>اضغط على أي تطبيق لمراجعة المستودع والبيئات وتنفيذ فحص الاتصال عند توفر الاعتمادات.</p></div></div>
  <div className="apps-grid">{portfolio.map(app=><Link href={'/console/apps/'+app.app_id} className="app-card panel" key={app.app_id}>
   <div className="app-card-top"><span className={'app-card-icon '+app.accent}>{app.icon}</span><Status state="unknown" label="المراقبة غير مفعّلة"/></div>
   <div className="app-card-name"><span className="card-overline">{app.label}</span><h2>{app.name}</h2><p>{app.description}</p></div>
   <div className="module-tags">{app.modules.map(x=><span key={x}>{x}</span>)}</div>
   <div className="card-footer"><span><Icon name="code" size={15}/> {app.repository.split('/')[1]}</span><Icon name="arrow" size={18}/></div>
  </Link>)}</div>
 </>;
}
