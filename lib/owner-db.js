import {createHash,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {dbQuery,withTransaction} from './db.js';
import {configuredOwnerUsername,verifyAdminCredentials} from './auth.js';

const BOOTSTRAP_SESSION_HOURS=2;
const NORMAL_SESSION_HOURS=8;
const hashToken=s=>createHash('sha256').update(s).digest('hex');
const validatePassword=s=>typeof s==='string'&&s.length>=16&&s.length<=256;
export function passwordHash(password){
 if(!validatePassword(password))throw new Error('invalid_password_length');
 const salt=randomBytes(16);
 return 'scrypt$'+salt.toString('hex')+'$'+scryptSync(password,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024}).toString('hex');
}
export function verifyPassword(password,encoded){
 if(typeof password!=='string'||typeof encoded!=='string'||password.length>1024)return false;
 const parts=encoded.split('$');
 if(parts.length!==3||parts[0]!=='scrypt'||!/^[a-f0-9]{32}$/i.test(parts[1])||!/^[a-f0-9]{128}$/i.test(parts[2]))return false;
 try{
  const actual=scryptSync(password,Buffer.from(parts[1],'hex'),64,{N:16384,r:8,p:1,maxmem:64*1024*1024});
  return timingSafeEqual(actual,Buffer.from(parts[2],'hex'));
 }catch{return false;}
}
function validIdentity(login){
 if(typeof login!=='string'||login.length>320)return false;
 const entered=login.trim().toLowerCase();
 const email=(process.env.NEXUS_ADMIN_EMAIL||'').trim().toLowerCase();
 const alias=configuredOwnerUsername();
 // On bootstrap/credential change the email env must remain the canonical identity.
 return !!email&&(entered===email||(alias!==null&&entered===alias));
}
async function currentOwner(client){
 const q=client||{query:dbQuery};
 const result=await q.query('SELECT id, password_hash, version FROM nexus_owner_credentials WHERE id=1');
 return result.rows[0]||null;
}
async function audit(client,kind,result){
 await client.query('INSERT INTO nexus_audit(kind,result) VALUES($1,$2)',[kind,result]);
}
export async function authenticateOwner(login,password){
 if(!validIdentity(login)||typeof password!=='string')return null;
 const existing=await currentOwner();
 const ok=existing?verifyPassword(password,existing.password_hash):verifyAdminCredentials(login,password);
 if(!ok)return null;
 const token=randomBytes(32).toString('base64url');
 const hash=hashToken(token);
 const minutes=existing?NORMAL_SESSION_HOURS*60:BOOTSTRAP_SESSION_HOURS*60;
 const email=process.env.NEXUS_ADMIN_EMAIL.trim().toLowerCase();
 await withTransaction(async client=>{
  await client.query('INSERT INTO nexus_sessions(token_hash,email,owner_version,expires_at) VALUES($1,$2,$3,now()+($4::int * interval \'1 minute\'))',[hash,email,existing?.version||0,minutes]);
  await audit(client,'owner_login','success');
 });
 return {token,must_change_password:!existing};
}
export async function lookupOwnerSession(token){
 if(typeof token!=='string'||token.length>150||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
 const result=await dbQuery(`
 SELECT s.email,s.owner_version,s.expires_at,c.version AS current_version
 FROM nexus_sessions s LEFT JOIN nexus_owner_credentials c ON c.id=1
 WHERE s.token_hash=$1 AND s.expires_at>now()
 `,[hashToken(token)]);
 const row=result.rows[0];
 const expectedEmail=(process.env.NEXUS_ADMIN_EMAIL||'').trim().toLowerCase();
 if(!row||row.email!==expectedEmail||!expectedEmail)return null;
 if(row.current_version===null&&row.owner_version===0)return {email:row.email,must_change_password:true};
 if(row.current_version===row.owner_version)return {email:row.email,must_change_password:false};
 return null;
}
export async function enrollOwner(token,newPassword){
 if(!validatePassword(newPassword))return false;
 const existingSession=await lookupOwnerSession(token);
 if(!existingSession?.must_change_password)return false;
 const digest=passwordHash(newPassword),tokenHash=hashToken(token);
 return withTransaction(async client=>{
  const existing=await currentOwner(client);
  if(existing)return false;
  await client.query('INSERT INTO nexus_owner_credentials(id,password_hash,version) VALUES(1,$1,1)',[digest]);
  const q=await client.query('UPDATE nexus_sessions SET owner_version=1,expires_at=now()+interval \'8 hours\' WHERE token_hash=$1 AND owner_version=0 RETURNING token_hash',[tokenHash]);
  if(q.rowCount!==1)throw new Error('session_no_longer_valid');
  await audit(client,'owner_enrolled','success');
  return true;
 });
}
export async function rotateOwnerPassword(token,oldPassword,newPassword){
 if(!validatePassword(newPassword)||typeof oldPassword!=='string')return false;
 const session=await lookupOwnerSession(token);
 if(!session||session.must_change_password)return false;
 const tokenHash=hashToken(token);
 return withTransaction(async client=>{
  const row=await client.query('SELECT password_hash,version FROM nexus_owner_credentials WHERE id=1 FOR UPDATE');
  const owner=row.rows[0];
  if(!owner||!verifyPassword(oldPassword,owner.password_hash))return false;
  const sessionRow=await client.query('SELECT owner_version FROM nexus_sessions WHERE token_hash=$1 AND expires_at>now() FOR UPDATE',[tokenHash]);
  if(sessionRow.rows[0]?.owner_version!==owner.version)return false;
  const next=owner.version+1;
  await client.query('UPDATE nexus_owner_credentials SET password_hash=$1,version=$2,changed_at=now() WHERE id=1',[passwordHash(newPassword),next]);
  await client.query('UPDATE nexus_sessions SET owner_version=$1 WHERE token_hash=$2',[next,tokenHash]);
  await audit(client,'owner_password_changed','success');
  return true;
 });
}
export async function revokeOwnerSession(token){
 if(typeof token!=='string'||token.length>150)return;
 await dbQuery('DELETE FROM nexus_sessions WHERE token_hash=$1',[hashToken(token)]);
}
