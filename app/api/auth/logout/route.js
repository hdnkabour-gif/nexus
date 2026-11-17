import {sessionCookieName,authRedirect} from '../../../../lib/auth.js';
import {databaseConfigured} from '../../../../lib/db.js';
import {revokeOwnerSession} from '../../../../lib/owner-db.js';
import {cookies} from 'next/headers';
import {validateCsrfForm} from '../../../../lib/csrf.js';
export async function POST(request){
 let form;try{form=await request.formData();}catch{return new Response('Invalid input',{status:400});}
 if(!validateCsrfForm(request,'logout',form.get('csrf')))return new Response('Invalid security token',{status:403});
 if(databaseConfigured()){
  try{const jar=await cookies();await revokeOwnerSession(jar.get(sessionCookieName())?.value);}catch{return new Response('Logout unavailable',{status:503});}
 }
 // Use mutable headers to expire the cookie; Response.redirect() is immutable.
 const response=new Response(null,{status:303,headers:{Location:authRedirect('/login',request).toString()}});
 response.headers.append('Set-Cookie',sessionCookieName()+'=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'+(process.env.NODE_ENV==='production'?'; Secure':''));
 response.headers.set('Cache-Control','no-store');
 return response;
}
