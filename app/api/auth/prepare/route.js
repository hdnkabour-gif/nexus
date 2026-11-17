import {authRedirect} from '../../../../lib/auth.js';
import {createCsrfNonce,csrfCookieHeader} from '../../../../lib/csrf.js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const destinations=new Map([['login','/login'],['setup','/owner/setup'],['console','/console'],['settings','/console/settings']]);
export async function GET(request){
 const key=new URL(request.url).searchParams.get('next')||'login';
 const dest=destinations.get(key);
 if(!dest)return new Response('Invalid destination',{status:400});
 if(typeof process.env.NEXUS_SESSION_SECRET!=='string'||process.env.NEXUS_SESSION_SECRET.length<32){
  return new Response('Authentication temporarily unavailable',{status:503});
 }
 const nonce=createCsrfNonce();
 const response=new Response(null,{status:303,headers:{
  Location:authRedirect(dest,request).toString(),
  'Cache-Control':'no-store',
  'X-Robots-Tag':'noindex'
 }});
 response.headers.append('Set-Cookie',csrfCookieHeader(nonce));
 return response;
}
