import {cookies} from 'next/headers';
import {getSession,sessionCookieName,authRedirect} from '../../../../lib/auth.js';
import {enrollOwner} from '../../../../lib/owner-db.js';
import {validateCsrfForm} from '../../../../lib/csrf.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request){
 const session=await getSession();
 if(!session?.must_change_password)return Response.redirect(authRedirect('/login',request),303);
 const length=Number(request.headers.get('content-length')||0);
 if(!Number.isFinite(length)||length>5000)return new Response('Invalid input',{status:413});
 let form;try{form=await request.formData();}catch{return new Response('Invalid input',{status:400});}
 if(!validateCsrfForm(request,'enroll',form.get('csrf')))return new Response('Invalid security token',{status:403});
 const password=form.get('newPassword'),confirm=form.get('confirmPassword');
 if(typeof password!=='string'||typeof confirm!=='string'||password!==confirm||password.length<16||password.length>256)return Response.redirect(authRedirect('/owner/setup?error=1',request),303);
 try{
  const token=(await cookies()).get(sessionCookieName())?.value;
  if(!await enrollOwner(token,password))return Response.redirect(authRedirect('/owner/setup?error=1',request),303);
  return Response.redirect(authRedirect('/console',request),303);
 }catch{return new Response('Temporary setup failure',{status:503});}
}
