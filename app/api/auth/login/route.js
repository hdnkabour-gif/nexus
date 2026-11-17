import {verifyAdminCredentials,newSession,sessionCookieName,validateFormOrigin,isBootstrapConfigured,authRedirect} from '../../../../lib/auth.js';
import {databaseConfigured} from '../../../../lib/db.js';
import {authenticateOwner} from '../../../../lib/owner-db.js';
import {validateCsrfForm} from '../../../../lib/csrf.js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const counters=new Map();
function blocked(key,now){
 if(counters.size>5000)counters.clear();
 const r=counters.get(key)||{count:0,resetAt:now+15*60_000};
 if(now>r.resetAt){r.count=0;r.resetAt=now+15*60_000;}
 return r.count>=8;
}
function failure(key,now){
 const r=counters.get(key)||{count:0,resetAt:now+15*60_000};
 r.count+=1;counters.set(key,r);
}
export async function POST(request){
 const now=Date.now();
 const key=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,80);
 const denial=(kind='credentials')=>Response.redirect(authRedirect('/login?error='+kind,request),303);
 if(!isBootstrapConfigured())return Response.redirect(authRedirect('/login?setup=1',request),303);
 if(blocked(key,now))return denial('limited');
 const len=Number(request.headers.get('content-length')||'0');
 if(!Number.isFinite(len)||len>12_000)return denial('request');
 let form;
 try{form=await request.formData();}catch{return denial('request');}
 // Signed double-submit CSRF works with browsers that strip or alter Origin.
 if(!validateCsrfForm(request,'login',form.get('csrf')))return denial('security');
 const login=form.get('login'),password=form.get('password');
 if(typeof login!=='string'||typeof password!=='string'){failure(key,now);return denial();}
 let token,bootstrap=false;
 if(databaseConfigured()){
  try{
   const result=await authenticateOwner(login,password);
   if(!result){failure(key,now);return denial();}
   token=result.token;bootstrap=result.must_change_password;
  }catch{return new Response('Service temporarily unavailable',{status:503});}
 }else{
  if(!verifyAdminCredentials(login,password)){failure(key,now);return denial();}
  token=newSession(process.env.NEXUS_ADMIN_EMAIL);
 }
 counters.delete(key);
 // Fetch Response.redirect() has immutable headers in Node 22; a mutable
 // Response is required to set the HttpOnly session cookie.
 const response=new Response(null,{status:303,headers:{Location:authRedirect(bootstrap?'/owner/setup':'/console',request).toString()}});
 response.headers.append('Set-Cookie',sessionCookieName()+'='+token+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+(bootstrap?7200:28800)+(process.env.NODE_ENV==='production'?'; Secure':''));
 response.headers.set('Cache-Control','no-store');
 return response;
}
