import {getSession,validateFormOrigin} from '../../../../lib/auth.js';
import {databaseConfigured} from '../../../../lib/db.js';
import {latestHttpChecks,runHttpChecks,publicProbeTargets} from '../../../../lib/public-probes.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const unavailable=()=>Response.json({error:'service_unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 const session=await getSession();
 if(!session||session.must_change_password)return Response.json({error:'unauthorized'},{status:401});
 if(!databaseConfigured())return unavailable();
 try{return Response.json({scope:'HTTP reachability only — not application health',targets:publicProbeTargets(),checks:await latestHttpChecks()},{headers:{'Cache-Control':'no-store'}});}
 catch{return unavailable();}
}
export async function POST(request){
 const session=await getSession();
 if(!session||session.must_change_password)return Response.json({error:'unauthorized'},{status:401});
 if(!validateFormOrigin(request))return Response.json({error:'invalid_origin'},{status:403});
 if(!databaseConfigured())return unavailable();
 try{
  const last=await latestHttpChecks();
  if(last.length&&last.every(x=>Date.now()-new Date(x.measured_at).getTime()<45_000)){
   return Response.json({scope:'HTTP reachability only — not application health',checks:last,cached:true},{headers:{'Cache-Control':'no-store'}});
  }
  const checks=await runHttpChecks();
  return Response.json({scope:'HTTP reachability only — not application health',checks,cached:false},{headers:{'Cache-Control':'no-store'}});
 }catch{return unavailable();}
}
