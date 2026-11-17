import {cookies} from 'next/headers';
import {getSession,sessionCookieName,validateFormOrigin} from '../../../../lib/auth.js';
import {enrollOwner} from '../../../../lib/owner-db.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request){
 if(!validateFormOrigin(request))return new Response('Forbidden',{status:403});
 const session=await getSession();
 if(!session?.must_change_password)return Response.redirect(new URL('/login',request.url),303);
 const length=Number(request.headers.get('content-length')||0);
 if(!Number.isFinite(length)||length>5000)return new Response('Invalid input',{status:413});
 let form;try{form=await request.formData();}catch{return new Response('Invalid input',{status:400});}
 const password=form.get('newPassword'),confirm=form.get('confirmPassword');
 if(typeof password!=='string'||typeof confirm!=='string'||password!==confirm||password.length<16||password.length>256)return Response.redirect(new URL('/owner/setup?error=1',request.url),303);
 try{
  const token=(await cookies()).get(sessionCookieName())?.value;
  if(!await enrollOwner(token,password))return Response.redirect(new URL('/owner/setup?error=1',request.url),303);
  return Response.redirect(new URL('/console',request.url),303);
 }catch{return new Response('Temporary setup failure',{status:503});}
}
