import {getSession} from '../../../../lib/auth.js';
import {inspectLiveMetadata} from '../../../../lib/external.js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
 if(!await getSession())return Response.json({error:'unauthorized'},{status:401,headers:{'Cache-Control':'no-store'}});
 const id=new URL(request.url).searchParams.get('app');
 if(typeof id!=='string'||!/^[a-z][a-z0-9-]{2,63}$/.test(id))return Response.json({error:'invalid_app'},{status:400});
 const result=await inspectLiveMetadata(id);
 if(!result)return Response.json({error:'not_found'},{status:404});
 return Response.json(result,{headers:{'Cache-Control':'no-store'}});
}
