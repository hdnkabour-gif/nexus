import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
const COOKIE_NAME='nexus_csrf';
const SCOPES=new Set(['login','enroll','rotate','logout']);
const NONCE_RE=/^[A-Za-z0-9_-]{32}$/;
const TOKEN_RE=/^v1\.([0-9]{10})\.([A-Za-z0-9_-]{43})$/;
const LIFETIME_SECONDS=7200;
function key(){
 const k=process.env.NEXUS_SESSION_SECRET;
 return typeof k==='string'&&k.length>=32?k:null;
}
export function csrfCookieName(){return COOKIE_NAME;}
export function isValidCsrfNonce(value){return typeof value==='string'&&NONCE_RE.test(value);}
export function createCsrfNonce(){return randomBytes(24).toString('base64url');}
export function csrfCookieHeader(nonce){
 if(!isValidCsrfNonce(nonce))throw new Error('invalid_csrf_nonce');
 return COOKIE_NAME+'='+nonce+'; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200'+(process.env.NODE_ENV==='production'?'; Secure':'');
}
function mac(scope,nonce,issuedAt,secret){
 return createHmac('sha256',secret).update('nexus/csrf/v1:'+scope+':'+nonce+':'+issuedAt).digest('base64url');
}
export function createCsrfToken(scope,nonce,now=Date.now()){
 const secret=key();
 if(!secret||!SCOPES.has(scope)||!isValidCsrfNonce(nonce))throw new Error('csrf_unavailable');
 const issued=Math.floor(now/1000);
 return 'v1.'+issued+'.'+mac(scope,nonce,issued,secret);
}
function csrfNonceFromCookieHeader(header){
 if(typeof header!=='string'||header.length>8192)return null;
 for(const part of header.split(';')){
  const [name,...rest]=part.trim().split('=');
  if(name===COOKIE_NAME){
   const value=rest.join('=');
   return isValidCsrfNonce(value)?value:null;
  }
 }
 return null;
}
export function validateCsrfForm(request,scope,token,now=Date.now()){
 const site=request.headers.get('sec-fetch-site')?.toLowerCase();
 // Fetch Metadata cannot be forged by page JS, and blocks all cross-site forms.
 if(site==='cross-site'||site==='same-site')return false;
 const secret=key();
 if(!secret||!SCOPES.has(scope)||typeof token!=='string'||token.length>96)return false;
 const parsed=TOKEN_RE.exec(token);
 if(!parsed)return false;
 const issued=Number(parsed[1]),current=Math.floor(now/1000);
 if(issued>current+60||issued<current-LIFETIME_SECONDS)return false;
 const nonce=csrfNonceFromCookieHeader(request.headers.get('cookie'));
 if(!nonce)return false;
 const expected=mac(scope,nonce,issued,secret);
 const a=Buffer.from(parsed[2]),b=Buffer.from(expected);
 return a.length===b.length&&timingSafeEqual(a,b);
}
export async function pageCsrfNonce(){
 const {cookies}=await import('next/headers');
 const jar=await cookies();
 const nonce=jar.get(COOKIE_NAME)?.value;
 return isValidCsrfNonce(nonce)?nonce:null;
}
