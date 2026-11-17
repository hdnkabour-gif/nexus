import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {getPool} from '../lib/db.js';
const file=fileURLToPath(new URL('../db/schema.sql',import.meta.url));
const schema=await readFile(file,'utf8');
const client=await getPool().connect();
try{
 await client.query('BEGIN');
 await client.query('SELECT pg_advisory_xact_lock(497321, 20261117)');
 await client.query(schema);
 await client.query('COMMIT');
 process.stdout.write('NEXUS metadata schema applied (idempotent).\n');
}catch(err){
 await client.query('ROLLBACK').catch(()=>{});
 process.stderr.write('NEXUS metadata schema migration failed (details withheld).\n');
 process.exitCode=1;
}finally{
 client.release();
 await getPool().end();
}
