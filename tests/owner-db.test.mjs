import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,scryptSync} from 'node:crypto';
import {dbQuery,getPool,databaseConfigured} from '../lib/db.js';
import {authenticateOwner,lookupOwnerSession,enrollOwner,rotateOwnerPassword,revokeOwnerSession,passwordHash,verifyPassword} from '../lib/owner-db.js';
import {POST as loginPost} from '../app/api/auth/login/route.js';
import {GET as prepareGet} from '../app/api/auth/prepare/route.js';
import {createCsrfToken} from '../lib/csrf.js';
test('scrypt hashes randomize salt and verify only the correct password',()=>{
 const p='deliberately-long-test-password-123';
 const a=passwordHash(p),b=passwordHash(p);
 assert.notEqual(a,b);assert.equal(verifyPassword(p,a),true);
 assert.equal(verifyPassword('bad',a),false);
 assert.throws(()=>passwordHash('short'));
});
test('owner bootstrap -> forced setup -> persistent login -> password rotation and session revocation',{skip:!databaseConfigured()},async()=>{
 const original={email:process.env.NEXUS_ADMIN_EMAIL,username:process.env.NEXUS_ADMIN_USERNAME,hash:process.env.NEXUS_ADMIN_PASSWORD_HASH,secret:process.env.NEXUS_SESSION_SECRET,origin:process.env.NEXUS_PUBLIC_ORIGIN};
 try{
  const salt=randomBytes(16),initial='only-a-test-bootstrap-password-1234';
  process.env.NEXUS_ADMIN_EMAIL='test-owner@internal.invalid';
  process.env.NEXUS_ADMIN_USERNAME='owner';
  process.env.NEXUS_ADMIN_PASSWORD_HASH='scrypt$'+salt.toString('hex')+'$'+scryptSync(initial,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024}).toString('hex');
  process.env.NEXUS_SESSION_SECRET='test-only-key-abcdefghijklmnopqrstuvwxyz';
  process.env.NEXUS_PUBLIC_ORIGIN='https://nexus-control-center.up.railway.app';
  await dbQuery('TRUNCATE nexus_sessions,nexus_owner_credentials,nexus_audit RESTART IDENTITY');
  assert.equal(await authenticateOwner('owner','bad'),null);
  const prepared=await prepareGet(new Request('http://nexus-web.railway.internal/api/auth/prepare?next=login'));
  assert.equal(prepared.status,303);
  assert.equal(prepared.headers.get('location'),'https://nexus-control-center.up.railway.app/login');
  const csrfCookie=prepared.headers.get('set-cookie')?.split(';')[0];
  assert.match(csrfCookie||'',/^nexus_csrf=/);
  const nonce=csrfCookie.split('=')[1];
  const body=new URLSearchParams({login:'OWNER',password:initial,csrf:createCsrfToken('login',nonce)});
  const request=new Request('http://nexus-web.railway.internal/api/auth/login',{
   method:'POST',body,
   headers:{
    origin:'https://nexus-control-center.up.railway.app',
    host:'nexus-web.railway.internal',
    'x-forwarded-host':'nexus-web.railway.internal',
    cookie:csrfCookie,
    'sec-fetch-site':'same-origin',
    'x-forwarded-for':'192.0.2.21'
   }
  });
  const response=await loginPost(request);
  assert.equal(response.status,303);
  assert.equal(response.headers.get('location'),'https://nexus-control-center.up.railway.app/owner/setup');
  const cookie=response.headers.get('set-cookie')||'';
  assert.match(cookie,/^nexus_session=/);
  assert.match(cookie,/HttpOnly/);
  assert.equal((await lookupOwnerSession(cookie.split(';')[0].split('=')[1]))?.must_change_password,true);
  const otherOrigin=new Request('http://nexus-web.railway.internal/api/auth/login',{
   method:'POST',body:new URLSearchParams({login:'owner',password:initial,csrf:createCsrfToken('login',nonce)}),
   headers:{origin:'https://malicious.example.invalid',cookie:csrfCookie,'sec-fetch-site':'cross-site','x-forwarded-for':'192.0.2.22'}
  });
  const rejected=await loginPost(otherOrigin);
  assert.equal(rejected.status,303);
  assert.equal(rejected.headers.get('location'),'https://nexus-control-center.up.railway.app/login?error=security');
  assert.equal(rejected.headers.has('set-cookie'),false);
  const absentToken=await loginPost(new Request('http://nexus-web.railway.internal/api/auth/login',{method:'POST',body:new URLSearchParams({login:'owner',password:initial}),headers:{cookie:csrfCookie,'x-forwarded-for':'192.0.2.23'}}));
  assert.equal(absentToken.headers.get('location'),'https://nexus-control-center.up.railway.app/login?error=security');
  const first=await authenticateOwner('OWNER',initial);
  assert.equal(first.must_change_password,true);
  assert.equal((await lookupOwnerSession(first.token)).must_change_password,true);
  const second=await authenticateOwner('test-owner@internal.invalid',initial);
  assert.equal((await lookupOwnerSession(second.token)).must_change_password,true);
  assert.equal(await enrollOwner(first.token,'new-local-owner-password-2026'),true);
  assert.equal((await lookupOwnerSession(first.token)).must_change_password,false);
  assert.equal(await lookupOwnerSession(second.token),null);
  assert.equal(await authenticateOwner('owner',initial),null);
  const later=await authenticateOwner('owner','new-local-owner-password-2026');
  assert.equal(later.must_change_password,false);
  assert.equal(await rotateOwnerPassword(later.token,'wrong','third-secret-password-2026'),false);
  assert.equal(await rotateOwnerPassword(later.token,'new-local-owner-password-2026','third-secret-password-2026'),true);
  assert.equal(await authenticateOwner('owner','new-local-owner-password-2026'),null);
  assert.equal(await lookupOwnerSession(first.token),null);
  assert.equal((await lookupOwnerSession(later.token)).must_change_password,false);
  assert.ok((await authenticateOwner('owner','third-secret-password-2026'))?.token);
  await revokeOwnerSession(later.token);
  assert.equal(await lookupOwnerSession(later.token),null);
  const audit=await dbQuery('SELECT kind FROM nexus_audit ORDER BY id');
  assert.ok(audit.rows.some(x=>x.kind==='owner_enrolled'));
  assert.ok(audit.rows.some(x=>x.kind==='owner_password_changed'));
 }finally{
  await dbQuery('TRUNCATE nexus_sessions,nexus_owner_credentials,nexus_audit RESTART IDENTITY').catch(()=>{});
  for(const [key,name] of Object.entries({email:'NEXUS_ADMIN_EMAIL',username:'NEXUS_ADMIN_USERNAME',hash:'NEXUS_ADMIN_PASSWORD_HASH',secret:'NEXUS_SESSION_SECRET',origin:'NEXUS_PUBLIC_ORIGIN'})){
   if(original[key]===undefined)delete process.env[name];else process.env[name]=original[key];
  }
  await getPool().end();
 }
});
