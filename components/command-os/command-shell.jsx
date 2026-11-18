'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import Icon from '../icons';
import CommandPalette from './command-palette';
const primary=[
 {href:'/console',icon:'grid',title:'القيادة',short:'الرئيسية'},
 {href:'/console/apps',icon:'layers',title:'التطبيقات',short:'التطبيقات'},
 {href:'/console/topology',icon:'nodes',title:'العلاقات',short:'الخريطة'},
 {href:'/console/observability',icon:'pulse',title:'المراقبة',short:'المراقبة'},
 {href:'/console/backups',icon:'database',title:'الاسترجاع',short:'النسخ'},
 {href:'/console/incidents',icon:'alert',title:'الحوادث',short:'الحوادث'}
];
const secondary=[
 {href:'/console/diagnostics',icon:'brain',title:'التشخيص'},
 {href:'/console/ai',icon:'bot',title:'مساعد NEXUS'},
 {href:'/console/integrations',icon:'plug',title:'الاتصالات'},
 {href:'/console/security',icon:'shield',title:'الأمان'},
 {href:'/console/settings',icon:'settings',title:'الإعدادات'}
];
function active(path,href){return href==='/console'?path==='/console':path===href||path.startsWith(href+'/');}
function NavLink({item,path,onNavigate}){
 return <Link className={'os-nav-link'+(active(path,item.href)?' is-active':'')} href={item.href} title={item.title} aria-current={active(path,item.href)?'page':undefined} onClick={onNavigate}><Icon name={item.icon} size={20}/><span>{item.title}</span></Link>;
}
export default function CommandShell({children,ownerName,logoutCsrf,apps}){
 const [palette,setPalette]=useState(false),[menu,setMenu]=useState(false);
 const pathname=usePathname();
 const current=[...primary,...secondary].find(x=>active(pathname,x.href));
 useEffect(()=>{const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPalette(v=>!v);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 useEffect(()=>{setMenu(false);setPalette(false);},[pathname]);
 return <div className="os-shell" dir="rtl">
  {menu&&<button className="os-menu-shade" type="button" aria-label="إغلاق القائمة" onClick={()=>setMenu(false)}/>}
  <aside className={'os-rail'+(menu?' is-open':'')} aria-label="التنقل الرئيسي">
   <Link href="/console" className="os-brand" aria-label="NEXUS — الرئيسية" onClick={()=>setMenu(false)}><span className="os-mark"><i/><i/><i/><i/></span><span className="os-brand-word">NEXUS<small>COMMAND / OS</small></span></Link>
   <div className="os-rail-caption">01 / WORKSPACE</div>
   <nav className="os-nav-group">{primary.map(item=><NavLink key={item.href} item={item} path={pathname} onNavigate={()=>setMenu(false)}/>)}</nav>
   <div className="os-rail-caption">02 / INTELLIGENCE</div>
   <nav className="os-nav-group">{secondary.map(item=><NavLink key={item.href} item={item} path={pathname} onNavigate={()=>setMenu(false)}/>)}</nav>
   <div className="os-rail-bottom"><span className="os-readonly"><Icon name="lock" size={15}/> OBSERVE ONLY</span><form action="/api/auth/logout" method="POST"><input type="hidden" name="csrf" value={logoutCsrf}/><button type="submit" className="os-logout"><Icon name="logout" size={18}/><span>تسجيل الخروج</span></button></form></div>
  </aside>
  <div className="os-body">
   <header className="os-header">
    <div className="os-header-identity"><span className="os-brand-mini">N<span>✦</span></span><span className="os-header-segment">CONTROL SURFACE</span><span className="os-sep">/</span><strong>{current?.title||'NEXUS'}</strong></div>
    <div className="os-header-actions"><button className="os-search-trigger" type="button" onClick={()=>setPalette(true)}><Icon name="search" size={17}/><span>بحث عن تطبيق، خدمة، أو صفحة</span><kbd>⌘ K</kbd></button><span className="os-mode"><i/> READ-ONLY</span><span className="os-account" title={ownerName}>{ownerName[0]?.toUpperCase()}</span></div>
   </header>
   <div className="os-system-strip"><span className="os-strip-head">NEXUS / CONTROL PLANE <span>↗</span></span><span>مصدر المعرفة: جرد + فحوص HTTP العامة</span><span>سلامة بيانات الأعمال: غير متحققة</span><Link href="/console/security">ضوابط الأمان <Icon name="arrow" size={13}/></Link></div>
   <main className="os-workspace" id="os-main">{children}</main>
   <footer className="os-footer"><span>NEXUS COMMAND OS · EARLY RELEASE</span><span>كل حالة تتطلب دليلاً ووقت قياس · أوامر الإنتاج معطلة</span></footer>
  </div>
  <nav className="os-mobile-bar" aria-label="تنقل الهاتف">
   {primary.slice(0,2).map(item=><Link key={item.href} href={item.href} className={active(pathname,item.href)?'is-active':''} aria-label={item.title}><Icon name={item.icon} size={21}/><span>{item.short}</span></Link>)}
   <Link href="/console/observability" className={active(pathname,'/console/observability')?'is-active':''}><Icon name="pulse" size={21}/><span>المراقبة</span></Link>
   <Link href="/console/incidents" className={active(pathname,'/console/incidents')?'is-active':''}><Icon name="alert" size={21}/><span>الحوادث</span></Link>
   <button type="button" aria-label="المزيد من الصفحات" aria-expanded={menu} onClick={()=>setMenu(v=>!v)}><Icon name="grid" size={21}/><span>المزيد</span></button>
  </nav>
  <CommandPalette open={palette} onClose={()=>setPalette(false)} apps={apps}/>
 </div>;
}