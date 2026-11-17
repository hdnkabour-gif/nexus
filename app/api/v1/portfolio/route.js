import {getSession} from '../../../../lib/auth.js';
import {portfolio,portfolioStats,snapshotAt} from '../../../../lib/data.js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 if(!await getSession())return Response.json({error:'unauthorized'},{status:401,headers:{'Cache-Control':'no-store'}});
 return Response.json({snapshot_at:snapshotAt,connected:false,apps:portfolio,stats:portfolioStats},{headers:{'Cache-Control':'no-store'}});
}
