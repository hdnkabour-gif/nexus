'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import Icon from '../icons';
import Status from '../status';
export default function AppExplorer({applications=[]}){
 const [search,setSearch]=useState(''),[filter,setFilter]=useState('all');
 const shown=useMemo(()=>applications.filter(({app,status,total})=>{
  const q=search.trim().toLowerCase();
  return (!q||(app.name+' '+app.repository+' '+app.label+' '+app.app_id).toLowerCase().includes(q))&&(filter==='all'||(filter==='http'&&total>0)||(filter==='not-monitored'&&status==='unknown'));
 }),[applications,search,filter]);
 return <><div className="os-explorer-toolbar">
  <label className="os-explorer-search"><Icon name="search" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث في اسم التطبيق أو المستودع" aria-label="بحث عن تطبيق"/></label>
  <div className="os-explorer-filters" role="group" aria-label="مرشحات التطبيقات"><button type="button" aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>الكل</button><button type="button" aria-pressed={filter==='http'} onClick={()=>setFilter('http')}>له نطاق HTTP</button><button type="button" aria-pressed={filter==='not-monitored'} onClick={()=>setFilter('not-monitored')}>غير مؤكد</button></div>
  <span className="os-explorer-count">{shown.length} / {applications.length}</span>
 </div>
 {shown.length?<div className="os-explorer-grid">{shown.map(({app,status,label,verified,total})=><Link href={'/console/apps/'+app.app_id} key={app.app_id} className="os-explorer-card"><div className="os-explorer-top"><span className={'os-explorer-glyph '+app.accent}>{app.icon}</span><Status state={status} label={label}/></div><span className="os-panel-overline">{app.label}</span><h2>{app.name}</h2><p>{app.description}</p><div className="os-explorer-meta"><span><Icon name="code" size={15}/> <span dir="ltr">{app.repository.split('/')[1]}</span></span><span><Icon name="pulse" size={15}/> {verified} / {total} قياسات حديثة</span></div><div className="os-explorer-open">استكشاف التطبيق <Icon name="arrow" size={17}/></div></Link>)}</div>:<div className="os-empty-result"><Icon name="search" size={25}/><strong>لا توجد تطبيقات مطابقة</strong><p>جرّب اسماً آخر أو أزل أحد المرشحات.</p></div>}
 </>;
}