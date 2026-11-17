import {databaseConfigured,dbReady} from '../../../lib/db.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){
 const db=databaseConfigured()?await dbReady():false;
 return Response.json({service:'nexus-web',database:db?'ready':'unavailable',mode:db?'persistent':'preview-only'},{
  status:db?200:503,headers:{'Cache-Control':'no-store'}
 });
}
