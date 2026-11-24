'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import Icon from '../icons';
const sections=[
 {href:'/console/knowledge',name:'مركز المعرفة',detail:'Knowledge Center · Historical source index',icon:'brain',keywords:'knowledge mémoire ideas evidence release'},
 {href:'/console',name:'مركز القيادة',detail:'Overview · Command surface',icon:'grid',keywords:'home dashboard'},
 {href:'/console/apps',name:'التطبيقات',detail:'Application registry · App 360',icon:'layers',keywords:'app repository repo'},
 {href:'/console/topology',name:'خريطة العلاقات',detail:'Topology · Service relationships',icon:'nodes',keywords:'map graph'},
 {href:'/console/observability',name:'المراقبة وقياسات HTTP',detail:'Signals · Live evidence',icon:'pulse',keywords:'monitoring status http'},
 {href:'/console/backups',name:'النسخ والاسترجاع',detail:'Backup evidence · Restore locked',icon:'database',keywords:'restore recovery'},
 {href:'/console/incidents',name:'الحوادث',detail:'Incident workspace · Pending integration',icon:'alert',keywords:'error incidents'},
 {href:'/console/diagnostics',name:'التشخيص',detail:'Diagnostics · Runbooks',icon:'brain',keywords:'AI code'},
 {href:'/console/ai',name:'مساعد NEXUS',detail:'AI integration · Not connected',icon:'bot',keywords:'OpenAI Claude'},
 {href:'/console/integrations',name:'الاتصالات',detail:'GitHub · Railway · Providers',icon:'plug',keywords:'connection'},
 {href:'/console/security',name:'الأمان',detail:'Access policies',icon:'shield',keywords:'authentication'},
 {href:'/console/settings',name:'الإعدادات',detail:'Account · Configuration',icon:'settings',keywords:'profile'}
];
export default function CommandPalette({open,onClose,apps=[]}){
 const [query,setQuery]=useState('');
 const router=useRouter();
 const field=useRef(null);
 useEffect(()=>{if(open){setQuery('');const t=setTimeout(()=>field.current?.focus(),0);return ()=>clearTimeout(t);}},[open]);
 useEffect(()=>{if(!open)return;const escape=e=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[open,onClose]);
 const items=useMemo(()=>[...sections,...apps.map(a=>({href:'/console/apps/'+a.app_id,name:a.name,detail:a.repository,icon:'layers',keywords:a.app_id}))],[apps]);
 const shown=useMemo(()=>{const q=query.trim().toLowerCase();return q?items.filter(x=>(x.name+' '+x.detail+' '+x.keywords).toLowerCase().includes(q)).slice(0,12):items.slice(0,12);},[items,query]);
 if(!open)return null;
 const go=path=>{onClose();router.push(path);};
 return <div className="os-command-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <section className="os-command" role="dialog" aria-modal="true" aria-labelledby="os-search-title" dir="rtl">
   <div className="os-command-search"><Icon name="search" size={21}/><input ref={field} id="os-search-title" aria-label="بحث في NEXUS" autoComplete="off" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&shown[0])go(shown[0].href);}} placeholder="ابحث عن تطبيق أو صفحة أو خدمة…"/><button type="button" className="os-command-close" onClick={onClose} aria-label="إغلاق البحث">ESC</button></div>
   <div className="os-command-caption">الصفحات والتطبيقات المكتشفة · لا يبحث في بيانات العملاء أو الأسرار</div>
   <div className="os-command-results">{shown.length?shown.map(x=><button type="button" key={x.href} onClick={()=>go(x.href)} className="os-command-result"><span className="os-command-symbol"><Icon name={x.icon} size={18}/></span><span><strong>{x.name}</strong><small dir="auto">{x.detail}</small></span><Icon name="arrow" size={16}/></button>):<div className="os-command-empty">لا توجد نتيجة مطابقة في الفهرس الحالي.</div>}</div>
   <div className="os-command-footer"><span><kbd>Enter</kbd> للفتح</span><span><kbd>Esc</kbd> للإغلاق</span><span>فهرس محلي · ليست نتائج حيّة من المستودعات</span></div>
  </section>
 </div>;
}