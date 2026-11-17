import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,scryptSync} from 'node:crypto';
import {verifyAdminCredentials,newSession,verifySession,isBootstrapConfigured,validateFormOrigin,configuredOwnerUsername,configuredOwnerDisplayName,configuredPublicOrigin,authRedirect} from '../lib/auth.js';
const old={...process.env};
function configure(){
 const salt=randomBytes(16);
 process.env.NEXUS_ADMIN_EMAIL='owner@internal.invalid';
 process.env.NEXUS_ADMIN_USERNAME='owner';
 process.env.NEXUS_ADMIN_NAME='NEXUS Owner';
 process.env.NEXUS_ADMIN_PASSWORD_HASH='scrypt$'+salt.toString('hex')+'$'+scryptSync('a-long-demo-password-with-entropy',salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024}).toString('hex');
 process.env.NEXUS_SESSION_SECRET='test-session-secret-with-adequate-entropy-only-'+randomBytes(24).toString('hex');
}
test('unconfigured platform fails closed',()=>{
 delete process.env.NEXUS_ADMIN_EMAIL;delete process.env.NEXUS_ADMIN_PASSWORD_HASH;delete process.env.NEXUS_SESSION_SECRET;
 assert.equal(isBootstrapConfigured(),false);
 assert.equal(verifyAdminCredentials('owner@internal.invalid','anything'),false);
 assert.equal(verifySession('bad'),null);
});
test('valid credentials and signed session, invalid credentials rejected',()=>{
 configure();assert.equal(isBootstrapConfigured(),true);
 assert.equal(verifyAdminCredentials('owner@internal.invalid','a-long-demo-password-with-entropy'),true);
 assert.equal(verifyAdminCredentials('OWNER','a-long-demo-password-with-entropy'),true);
 assert.equal(configuredOwnerUsername(),'owner');
 assert.equal(configuredOwnerDisplayName(),'NEXUS Owner');
 assert.equal(verifyAdminCredentials('owner@internal.invalid','wrong'),false);
 assert.equal(verifyAdminCredentials('different@internal.invalid','a-long-demo-password-with-entropy'),false);
 assert.equal(verifyAdminCredentials('owner','wrong'),false);
 const now=Date.parse('2026-11-17T14:00:00Z');
 const token=newSession('owner@internal.invalid',now);
 assert.equal(verifySession(token,now+1000)?.email,'owner@internal.invalid');
 assert.equal(verifySession(token+'garbage',now),null);
 assert.equal(verifySession(token,now+9*60*60*1000),null);
 const [p,m]=token.split('.');
 const tampered=p+'.'+m.replace(/^./,m[0]==='a'?'b':'a');
 assert.equal(verifySession(tampered,now),null);
});
test('invalid usernames never become login aliases; email remains accepted',()=>{
 configure();process.env.NEXUS_ADMIN_USERNAME='https://bad.example.invalid';
 assert.equal(configuredOwnerUsername(),null);
 assert.equal(verifyAdminCredentials('https://bad.example.invalid','a-long-demo-password-with-entropy'),false);
 assert.equal(verifyAdminCredentials('owner@internal.invalid','a-long-demo-password-with-entropy'),true);
 process.env.NEXUS_ADMIN_NAME='<Bad Name>';
 assert.equal(configuredOwnerDisplayName(),'<Bad Name>'); // React renders text escaped, no HTML injection.
});
test('cookie signing fails closed on missing signing secret',()=>{
 configure();delete process.env.NEXUS_SESSION_SECRET;
 assert.throws(()=>newSession('owner@internal.invalid'));
});
test('form origin check denies cross-origin and missing origin',()=>{
 const safe=new Request('https://nexus.example.invalid/api/auth/logout',{method:'POST',headers:{origin:'https://nexus.example.invalid',host:'nexus.example.invalid'}});
 const unsafe=new Request('https://nexus.example.invalid/api/auth/logout',{method:'POST',headers:{origin:'https://evil.invalid',host:'nexus.example.invalid'}});
 const missing=new Request('https://nexus.example.invalid/api/auth/logout',{method:'POST',headers:{host:'nexus.example.invalid'}});
 assert.equal(validateFormOrigin(safe),true);
 assert.equal(validateFormOrigin(unsafe),false);
 assert.equal(validateFormOrigin(missing),false);
});
test('Railway trusted origin works even with internal forwarded host and request URL',()=>{
 const previous=process.env.NEXUS_PUBLIC_ORIGIN;
 try{
  process.env.NEXUS_PUBLIC_ORIGIN='https://nexus-control-center.up.railway.app';
  const proxy=new Request('http://nexus-web.railway.internal/api/auth/login',{method:'POST',headers:{
   origin:'https://nexus-control-center.up.railway.app',
   host:'nexus-web.railway.internal',
   'x-forwarded-host':'nexus-web.railway.internal'
  }});
  assert.equal(configuredPublicOrigin(),'https://nexus-control-center.up.railway.app');
  assert.equal(validateFormOrigin(proxy),true);
  assert.equal(authRedirect('/owner/setup',proxy).href,'https://nexus-control-center.up.railway.app/owner/setup');
  const attacker=new Request('http://nexus-web.railway.internal/api/auth/login',{method:'POST',headers:{
   origin:'https://evil.example.invalid', 'x-forwarded-host':'evil.example.invalid'
  }});
  assert.equal(validateFormOrigin(attacker),false);
  assert.equal(validateFormOrigin(new Request(proxy.url,{method:'POST'})),false);
  process.env.NEXUS_PUBLIC_ORIGIN='http://nexus-control-center.up.railway.app';
  const oldMode=process.env.NODE_ENV;
  process.env.NODE_ENV='production';
  try{assert.equal(validateFormOrigin(proxy),false);}finally{
   if(oldMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=oldMode;
  }
 }finally{
  if(previous===undefined)delete process.env.NEXUS_PUBLIC_ORIGIN;else process.env.NEXUS_PUBLIC_ORIGIN=previous;
 }
});
process.on('exit',()=>{for(const k of Object.keys(process.env))if(!(k in old))delete process.env[k];});
