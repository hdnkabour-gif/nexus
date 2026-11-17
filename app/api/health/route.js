export const dynamic='force-dynamic';
export function GET(){
 return Response.json({service:'NEXUS',status:'up',mode:'initial-control-center',checked_at:new Date().toISOString()}, {headers:{'Cache-Control':'no-store'}});
}
