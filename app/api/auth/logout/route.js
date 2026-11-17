import {sessionCookieName,validateFormOrigin} from '../../../../lib/auth.js';
export async function POST(request){
 if(!validateFormOrigin(request))return new Response('Forbidden',{status:403});
 const response=Response.redirect(new URL('/login',request.url),303);
 response.headers.append('Set-Cookie',sessionCookieName()+'=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'+(process.env.NODE_ENV==='production'?'; Secure':''));
 response.headers.set('Cache-Control','no-store');
 return response;
}
