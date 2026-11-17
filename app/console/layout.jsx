import {redirect} from 'next/navigation';
import {getSession,configuredOwnerDisplayName} from '../../lib/auth.js';
import Sidebar from '../../components/sidebar';
import Icon from '../../components/icons';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export default async function ConsoleLayout({children}){
 const session=await getSession();
 if(!session)redirect('/login');
 if(session.must_change_password)redirect('/owner/setup');
 const ownerName=configuredOwnerDisplayName();
 return <div className="shell">
  <Sidebar/>
  <div className="shell-body">
   <header className="topbar"><div className="topbar-breadcrumb"><span className="topbar-diamond">◆</span> NEXUS <span className="topbar-separator">/</span> CONTROL CENTER <span className="preview-label">PREVIEW</span></div><div className="topbar-tools"><span className="topbar-observe"><span className="green-dot"/> نظام الواجهة يعمل</span><span className="divider-v"/><span className="user-avatar">{ownerName[0]?.toUpperCase()}</span><span className="topbar-user">{ownerName}</span></div></header>
   <main className="workspace">{children}</main>
   <footer className="bottom-bar"><span>© NEXUS Control Plane • نسخة أولية محمية</span><span><Icon name="shield" size={14}/> لا توجد أوامر إنتاج مفعّلة</span></footer>
  </div>
 </div>;
}
