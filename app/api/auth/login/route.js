import {verifyAdminCredentials,newSession,sessionCookieName,validateFormOrigin,isBootstrapConfigured} from '../../../../lib/auth.js';
import {databaseConfigured} from '../../../../lib/db.js';
import {authenticateOwner} from '../../../../lib/owner-db.js';
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
 const next=new URL('/login?error=1',request.url);
 const denial=()=>Response.redirect(next,303);
 if(!isBootstrapConfigured())return Response.redirect(new URL('/login?setup=1',request.url),303);
 if(!validateFormOrigin(request)||blocked(key,now))return denial();
 const len=Number(request.headers.get('content-length')||'0');
 if(!Number.isFinite(len)||len>12_000)return denial();
 let form;
 try{form=await request.formData();}catch{return denial();}
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
 const response=Response.redirect(new URL(bootstrap?'/owner/setup':'/console',request.url),303);
 response.headers.append('Set-Cookie',sessionCookieName()+'='+token+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+(bootstrap?7200:28800)+(process.env.NODE_ENV==='production'?'; Secure':''));
 response.headers.set('Cache-Control','no-store');
 return response;
}
