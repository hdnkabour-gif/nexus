import {createHmac,scryptSync,timingSafeEqual} from 'node:crypto';
const COOKIE='nexus_session';
const TTL=8*60*60;
const MIN_SECRET=32;
const ADMIN_EMAIL='NEXUS_ADMIN_EMAIL';
const PW_HASH='NEXUS_ADMIN_PASSWORD_HASH';
const SESSION_KEY='NEXUS_SESSION_SECRET';
const USERNAME_KEY='NEXUS_ADMIN_USERNAME';
const DISPLAY_NAME_KEY='NEXUS_ADMIN_NAME';
const BASE64=/^[A-Za-z0-9_-]+$/;
const bytesEqual=(a,b)=>a.length===b.length&&timingSafeEqual(a,b);
function securityKey() {
 const s=process.env[SESSION_KEY];
 if(typeof s!=='string'||s.length<MIN_SECRET) return null;
 return s;
}
export function isBootstrapConfigured() {
 return !!(securityKey()&&process.env[ADMIN_EMAIL]&&process.env[PW_HASH]);
}
export function configuredOwnerUsername(){
 const value=process.env[USERNAME_KEY];
 if(typeof value!=='string')return null;
 const name=value.trim().toLowerCase();
 return /^[a-z][a-z0-9._-]{2,31}$/.test(name) ? name : null;
}
export function configuredOwnerDisplayName(){
 const value=process.env[DISPLAY_NAME_KEY];
 if(typeof value!=='string')return 'Owner';
 const name=value.trim();
 return name.length>=2 && name.length<=80 && !/[\x00-\x1f\x7f]/.test(name) ? name : 'Owner';
}
export function verifyAdminCredentials(email,password){
 if(!isBootstrapConfigured()||typeof email!=='string'||typeof password!=='string'||email.length>320||password.length>1024)return false;
 const normalized=email.trim().toLowerCase();
 const expected=process.env[ADMIN_EMAIL].trim().toLowerCase();
 const actual=process.env[PW_HASH].split('$');
 if(actual.length!==3||actual[0]!=='scrypt'||!/^[a-f0-9]{32}$/i.test(actual[1])||!/^[a-f0-9]{128}$/i.test(actual[2]))return false;
 const username=configuredOwnerUsername();
 const matchesEmail=bytesEqual(Buffer.from(normalized),Buffer.from(expected));
 const matchesUsername=username!==null && bytesEqual(Buffer.from(normalized),Buffer.from(username));
 if(!matchesEmail&&!matchesUsername)return false;
 try{
  const dk=scryptSync(password,Buffer.from(actual[1],'hex'),64,{N:16384,r:8,p:1,maxmem:64*1024*1024});
  return bytesEqual(dk,Buffer.from(actual[2],'hex'));
 }catch{return false;}
}
function sign(payload,secret){return createHmac('sha256',secret).update(payload).digest('base64url');}
export function newSession(email,now=Date.now()){
 const secret=securityKey();
 if(!secret)throw new Error('server_auth_not_configured');
 const payload=Buffer.from(JSON.stringify({sub:email.trim().toLowerCase(),iat:Math.floor(now/1000),exp:Math.floor(now/1000)+TTL})).toString('base64url');
 return payload+'.'+sign(payload,secret);
}
export function verifySession(token,now=Date.now()){
 const secret=securityKey();
 if(!secret||typeof token!=='string'||token.length>1500)return null;
 const [payload,mac,...extra]=token.split('.');
 if(extra.length||!payload||!mac||!BASE64.test(payload)||!BASE64.test(mac))return null;
 const expected=sign(payload,secret);
 if(!bytesEqual(Buffer.from(mac),Buffer.from(expected)))return null;
 try{
  const claims=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
  const time=Math.floor(now/1000);
  if(typeof claims.sub!=='string'||claims.sub!==process.env[ADMIN_EMAIL].trim().toLowerCase())return null;
  if(!Number.isSafeInteger(claims.iat)||!Number.isSafeInteger(claims.exp))return null;
  if(claims.iat>time+60||claims.exp<=time||claims.exp-claims.iat!==TTL)return null;
  return {email:claims.sub,expires_at:new Date(claims.exp*1000).toISOString()};
 }catch{return null;}
}
export async function getSession(){
 const {cookies}=await import('next/headers');
 const jar=await cookies();
 const token=jar.get(COOKIE)?.value;
 if(process.env.NEXUS_DATABASE_URL){
  try{const {lookupOwnerSession}=await import('./owner-db.js');return await lookupOwnerSession(token);}catch{return null;}
 }
 return verifySession(token);
}
export function sessionCookieName(){return COOKIE;}
export function validateFormOrigin(request){
 const origin=request.headers.get('origin');
 if(!origin)return false;
 try{
  const incoming=new URL(origin);
  const target=new URL(request.url);
  const host=request.headers.get('x-forwarded-host')||request.headers.get('host')||target.host;
  return (incoming.protocol==='https:'||process.env.NODE_ENV!=='production')&&incoming.host.toLowerCase()===host.toLowerCase();
 }catch{return false;}
}
