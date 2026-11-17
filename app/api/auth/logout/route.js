import {sessionCookieName,validateFormOrigin} from '../../../../lib/auth.js';
import {databaseConfigured} from '../../../../lib/db.js';
import {revokeOwnerSession} from '../../../../lib/owner-db.js';
import {cookies} from 'next/headers';
export async function POST(request){
 if(!validateFormOrigin(request))return new Response('Forbidden',{status:403});
 if(databaseConfigured()){
  try{const jar=await cookies();await revokeOwnerSession(jar.get(sessionCookieName())?.value);}catch{return new Response('Logout unavailable',{status:503});}
 }
 const response=Response.redirect(new URL('/login',request.url),303);
 response.headers.append('Set-Cookie',sessionCookieName()+'=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'+(process.env.NODE_ENV==='production'?'; Secure':''));
 response.headers.set('Cache-Control','no-store');
 return response;
}
