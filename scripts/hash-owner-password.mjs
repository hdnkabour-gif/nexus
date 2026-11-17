/**
 * Offline, interactive password-hash generator for NEXUS owner Railway variable.
 * Never outputs the plaintext. Do not pass a password on the CLI or in shell history.
 * Running the script does NOT update Railway; paste only the output hash into
 * NEXUS_ADMIN_PASSWORD_HASH in Railway service Variables.
 */
import {scryptSync,randomBytes} from 'node:crypto';
import {createInterface} from 'node:readline';
import {Writable} from 'node:stream';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export function hashOwnerPassword(password) {
 if(typeof password!=='string'||password.length<16||password.length>1024) throw new TypeError('Password must contain 16–1024 characters');
 const salt=randomBytes(16);
 const dk=scryptSync(password,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024});
 return 'scrypt$'+salt.toString('hex')+'$'+dk.toString('hex');
}

async function main() {
 if(!process.stdin.isTTY||!process.stdout.isTTY) {
  process.stderr.write('Use an interactive local terminal (not a CI job or Railway log).\n');
  process.exitCode=1;
  return;
 }
 // Terminal echo, including passwords, is suppressed by a deliberately muted output stream.
 const hidden=new Writable({write(_chunk,_enc,next){next();}});
 const input=createInterface({input:process.stdin,output:hidden,terminal:true});
 const prompt=label=>new Promise(done=>{
  process.stdout.write(label);
  input.question('',answer=>{process.stdout.write('\n');done(answer);});
 });
 try {
  const first=await prompt('New NEXUS owner password (16+ characters, hidden): ');
  const again=await prompt('Confirm password (hidden): ');
  if(first!==again)throw new Error('Passwords do not match');
  const hash=hashOwnerPassword(first);
  process.stdout.write('\nCopy ONLY this hash into Railway NEXUS_ADMIN_PASSWORD_HASH:\n'+hash+'\n');
 } catch(error) {
  process.stderr.write('\n'+error.message+'\n');
  process.exitCode=1;
 } finally {
  input.close();
 }
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) await main();
