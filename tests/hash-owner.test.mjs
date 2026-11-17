import test from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync} from 'node:crypto';
import {hashOwnerPassword} from '../scripts/hash-owner-password.mjs';
test('password generator produces valid salted scrypt credential, no plaintext',()=>{
 const password='a-very-long-test-password-not-production';
 const a=hashOwnerPassword(password),b=hashOwnerPassword(password);
 assert.notEqual(a,b);
 assert.match(a,/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
 assert.equal(a.includes(password),false);
 const [algorithm,salt,encoded]=a.split('$');
 assert.equal(algorithm,'scrypt');
 assert.equal(scryptSync(password,Buffer.from(salt,'hex'),64,{N:16384,r:8,p:1,maxmem:64*1024*1024}).toString('hex'),encoded);
});
test('refuses weak, malformed and oversized input',()=>{
 for(const pass of ['short','',null,123,'x'.repeat(1025)])assert.throws(()=>hashOwnerPassword(pass));
});
