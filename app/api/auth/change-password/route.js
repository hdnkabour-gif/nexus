import {cookies} from 'next/headers';
import {getSession,sessionCookieName,authRedirect} from '../../../../lib/auth.js';
import {rotateOwnerPassword} from '../../../../lib/owner-db.js';
import {validateCsrfForm} from '../../../../lib/csrf.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request){
 const session=await getSession();
 if(!session||session.must_change_password)return new Response('Unauthorized',{status:401});
 if(Number(request.headers.get('content-length')||0)>5000)return new Response('Invalid input',{status:413});
 let f;try{f=await request.formData();}catch{return new Response('Invalid input',{status:400});}
 if(!validateCsrfForm(request,'rotate',f.get('csrf')))return new Response('Invalid security token',{status:403});
 const old=f.get('currentPassword'),next=f.get('newPassword'),confirm=f.get('confirmPassword');
 if(typeof old!=='string'||typeof next!=='string'||next!==confirm||next.length<16||next.length>256)return Response.redirect(authRedirect('/console/settings?password=invalid',request),303);
 try{
  const token=(await cookies()).get(sessionCookieName())?.value;
  const ok=await rotateOwnerPassword(token,old,next);
  return Response.redirect(authRedirect('/console/settings?password='+(ok?'changed':'invalid'),request),303);
 }catch{return new Response('Service temporarily unavailable',{status:503});}
}
