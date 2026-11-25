// Usage: NEXUS_DATABASE_URL=<runtime role URL> node scripts/check-db-privileges.mjs
// Read-only. Prints a JSON attestation (role name, flags, per-table findings; no secrets) and exits 1
// when the runtime role could rewrite history. Run it with the RUNTIME role, not the migration owner.
import {getPool} from '../lib/db.js';
import {checkRuntimePrivileges} from '../lib/db-privileges.js';
const client=await getPool().connect();
try{
 await client.query('BEGIN READ ONLY');
 const r=await checkRuntimePrivileges(client);
 process.stdout.write(JSON.stringify(r,null,1)+'\n');
 process.exitCode=r.ok?0:1;
}catch{process.stderr.write('NEXUS privilege check failed (details withheld).\n');process.exitCode=1;}
finally{await client.query('ROLLBACK').catch(()=>{});client.release();await getPool().end().catch(()=>{});}
