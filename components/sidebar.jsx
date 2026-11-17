'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import Icon from './icons';
const groups=[
 {label:'المنصة',items:[
  {href:'/console',title:'لوحة القيادة',icon:'grid'},
  {href:'/console/apps',title:'التطبيقات',icon:'layers'},
  {href:'/console/topology',title:'خريطة العلاقات',icon:'nodes'},
  {href:'/console/observability',title:'المراقبة والأعطال',icon:'pulse'},
  {href:'/console/backups',title:'النسخ والاسترجاع',icon:'database'}
 ]},
 {label:'الذكاء والتحكم',items:[
  {href:'/console/diagnostics',title:'NEXUS Intelligence',icon:'brain'},
  {href:'/console/integrations',title:'الخدمات الخارجية',icon:'plug'},
  {href:'/console/security',title:'الأمان والصلاحيات',icon:'shield'},
  {href:'/console/settings',title:'الإعدادات',icon:'settings'}
 ]}
];
export default function Sidebar({logoutCsrf}){
 const path=usePathname();
 return <aside className="sidebar">
  <Link href="/console" className="brand" aria-label="NEXUS الرئيسية">
   <span className="brand-symbol"><span/><span/><span/><span/></span>
   <span className="brand-type"><strong>NEXUS</strong><small>INTELLIGENCE SYSTEM</small></span>
  </Link>
  <div className="sidebar-workspace">
   <span className="workspace-icon">N</span>
   <span><strong>مركز التطبيقات</strong><small>My Workspace</small></span>
   <span className="workspace-chevron">⌄</span>
  </div>
  <nav className="sidebar-nav">
   {groups.map(group=><section className="nav-group" key={group.label}>
    <p className="nav-label">{group.label}</p>
    {group.items.map(item=>{
     const active=item.href==='/console'?path==='/console':path.startsWith(item.href);
     return <Link key={item.href} href={item.href} className={'nav-item'+(active?' active':'')}>
      <Icon name={item.icon} size={19}/><span>{item.title}</span>{active&&<i className="nav-active-mark"/>}
     </Link>;
    })}
   </section>)}
  </nav>
  <div className="sidebar-footer">
   <div className="security-mini"><Icon name="shield" size={16}/><span>وضع التشغيل الآمن <em>READ ONLY</em></span></div>
   <form action="/api/auth/logout" method="POST"><input type="hidden" name="csrf" value={logoutCsrf}/><button className="logout-btn" type="submit"><Icon name="logout" size={17}/> تسجيل الخروج</button></form>
   <div className="sidebar-version">NEXUS / PREVIEW 0.1</div>
  </div>
 </aside>;
}
