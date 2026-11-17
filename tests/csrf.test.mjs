import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {createCsrfNonce,createCsrfToken,validateCsrfForm,csrfCookieHeader} from '../lib/csrf.js';
test('signed double-submit token is scoped to same-origin request and independent of Origin header',()=>{
 const previous=process.env.NEXUS_SESSION_SECRET;
 process.env.NEXUS_SESSION_SECRET='test-only-secret-'+randomBytes(32).toString('hex');
 try{
  const nonce=createCsrfNonce(),token=createCsrfToken('login',nonce);
  const mk=(cookie,headers={})=>new Request('http://railway-internal.invalid/api/auth/login',{method:'POST',headers:{cookie,'sec-fetch-site':'same-origin',...headers}});
  assert.match(csrfCookieHeader(nonce),/^nexus_csrf=/);
  assert.match(csrfCookieHeader(nonce),/SameSite=Lax/);
  assert.equal(validateCsrfForm(mk('nexus_csrf='+nonce),'login',token),true);
  assert.equal(validateCsrfForm(mk('nexus_csrf='+nonce,{'origin':'null'}),'login',token),true);
  assert.equal(validateCsrfForm(mk('nexus_csrf='+nonce,{'sec-fetch-site':'cross-site'}),'login',token),false);
  assert.equal(validateCsrfForm(mk('nexus_csrf='+nonce,{'sec-fetch-site':'same-site'}),'login',token),false);
  assert.equal(validateCsrfForm(mk(''),'login',token),false);
  assert.equal(validateCsrfForm(mk('nexus_csrf='+createCsrfNonce()),'login',token),false);
  assert.equal(validateCsrfForm(mk('nexus_csrf='+nonce),'logout',token),false);
  assert.equal(validateCsrfForm(mk('nexus_csrf='+nonce),'login',token.slice(0,-1)+(token.at(-1)==='a'?'b':'a')),false);
  assert.equal(validateCsrfForm(mk('nexus_csrf='+nonce),'login',null),false);
  assert.equal(validateCsrfForm(mk('nexus_csrf='+nonce),'login',createCsrfToken('login',nonce,Date.now()-8000_000)),false);
 }finally{
  if(previous===undefined)delete process.env.NEXUS_SESSION_SECRET;else process.env.NEXUS_SESSION_SECRET=previous;
 }
});
test('malformed, unsigned, forged, invalid scope and missing secrets fail closed',()=>{
 const p=process.env.NEXUS_SESSION_SECRET;
 delete process.env.NEXUS_SESSION_SECRET;
 try{assert.throws(()=>createCsrfToken('login',createCsrfNonce()));}
 finally{if(p!==undefined)process.env.NEXUS_SESSION_SECRET=p;}
 assert.throws(()=>createCsrfToken('unknown',createCsrfNonce()));
 assert.throws(()=>csrfCookieHeader('evil'));
});
