import {redirect} from 'next/navigation';
import {getSession,configuredOwnerDisplayName} from '../../lib/auth.js';
import {createCsrfToken,pageCsrfNonce} from '../../lib/csrf.js';
import {portfolio} from '../../lib/data.js';
import CommandShell from '../../components/command-os/command-shell.jsx';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export default async function ConsoleLayout({children}){
 const session=await getSession();
 if(!session)redirect('/login');
 if(session.must_change_password)redirect('/owner/setup');
 const nonce=await pageCsrfNonce();
 if(!nonce)redirect('/api/auth/prepare?next=console');
 const logoutCsrf=createCsrfToken('logout',nonce);
 const apps=portfolio.map(({app_id,name,repository})=>({app_id,name,repository}));
 return <CommandShell ownerName={configuredOwnerDisplayName()} logoutCsrf={logoutCsrf} apps={apps}>{children}</CommandShell>;
}