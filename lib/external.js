import {collectGitHubRepo,collectRailwayProject} from '../packages/monitor-core/src/providers.mjs';
import {getApp} from './data.js';
export async function inspectLiveMetadata(appId){
 const app=getApp(appId);
 if(!app)return null;
 const githubToken=process.env.NEXUS_GITHUB_READ_TOKEN;
 const railwayToken=process.env.NEXUS_RAILWAY_READ_TOKEN;
 const github = !githubToken
  ? {status:'not_connected',message:'Dedicated read-only GitHub credential required'}
  : await collectGitHubRepo({repository:app.repository,token:githubToken}).then(data=>({status:'connected',checked_at:new Date().toISOString(),data})).catch(()=>({status:'unknown',message:'GitHub read-only probe failed'}));
 const selected=app.railway_projects[0];
 const railway = !railwayToken || !selected
  ? {status:'not_connected',message:'Dedicated scoped Railway API credential required'}
  : await collectRailwayProject({projectId:selected.id,token:railwayToken}).then(data=>({status:'connected',checked_at:new Date().toISOString(),data})).catch(()=>({status:'unknown',message:'Railway scoped metadata probe failed'}));
 return {app_id:app.app_id,github,railway,observed_at:new Date().toISOString(),note:'Metadata connectivity only. Not proof of app health or backups.'};
}
