import {verifyAdminCredentials,newSession,sessionCookieName,validateFormOrigin,isBootstrapConfigured} from '../../../../lib/auth.js';
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
 const email=form.get('email'),password=form.get('password');
 if(typeof email!=='string'||typeof password!=='string'||!verifyAdminCredentials(email,password)){failure(key,now);return denial();}
 counters.delete(key);
 const response=Response.redirect(new URL('/console',request.url),303);
 response.headers.append('Set-Cookie',sessionCookieName()+'='+newSession(email)+'; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800'+(process.env.NODE_ENV==='production'?'; Secure':''));
 response.headers.set('Cache-Control','no-store');
 return response;
}
