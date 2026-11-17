import pg from 'pg';
const {Pool}=pg;
let pool;
export function databaseConfigured(){
 return typeof process.env.NEXUS_DATABASE_URL==='string' && /^postgres(?:ql)?:\/\//.test(process.env.NEXUS_DATABASE_URL);
}
export function getPool(){
 if(!databaseConfigured())throw new Error('nexus_database_not_configured');
 if(!pool)pool=new Pool({
   connectionString:process.env.NEXUS_DATABASE_URL,
   max:5,
   idleTimeoutMillis:30000,
   connectionTimeoutMillis:5000,
   application_name:'nexus-control-center'
 });
 return pool;
}
export async function dbQuery(sql,params=[]){return getPool().query(sql,params);}
export async function withTransaction(operation){
 const client=await getPool().connect();
 try{
  await client.query('BEGIN');
  const result=await operation(client);
  await client.query('COMMIT');
  return result;
 }catch(err){await client.query('ROLLBACK').catch(()=>{});throw err;}
 finally{client.release();}
}
export async function dbReady(){
 if(!databaseConfigured())return false;
 try{await dbQuery('SELECT 1');return true;}catch{return false;}
}
