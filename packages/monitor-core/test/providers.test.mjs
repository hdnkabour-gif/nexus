import test from 'node:test';
import assert from 'node:assert/strict';
import {collectGitHubRepo,collectRailwayProject} from '../src/providers.mjs';
test('GitHub fixed-host, GET-only, allowlisted metadata, no secrets in result',async()=>{
 let args;
 const fetchImpl=async (url,init)=>{
  args={url,init};
  return {ok:true,status:200,json:async()=>({
   full_name:'owner/repo',default_branch:'main',archived:false,private:true,
   pushed_at:'2026-11-17T12:00:00Z',secrets:'DO_NOT_EXPORT',permissions:{admin:true}
  })};
 };
 const r=await collectGitHubRepo({repository:'owner/repo',token:'test-readonly-token',fetchImpl});
 assert.equal(args.url,'https://api.github.com/repos/owner/repo');
 assert.equal(args.init.method,'GET');assert.equal(r.secrets,undefined);assert.equal(r.permissions,undefined);
 assert.equal(r.private,true);assert.equal(r.readonly,true);
});
test('GitHub cannot accept external hosts or path traversal',async()=>{
 await assert.rejects(()=>collectGitHubRepo({repository:'https://evil.example/repo',token:'test-readonly-token'}));
 await assert.rejects(()=>collectGitHubRepo({repository:'owner/..',token:'test-readonly-token'}));
});
test('GitHub errors never pass through raw response body',async()=>{
 const fetchImpl=async()=>({ok:false,status:403});
 await assert.rejects(()=>collectGitHubRepo({repository:'owner/repo',token:'test-readonly-token',fetchImpl}),/github_request_failed_403/);
});
test('Railway uses fixed GraphQL endpoint and only approved project metadata',async()=>{
 const id='8cb69dd8-2bca-41d6-9760-2a5fda1d8de8';
 let payload;
 const fetchImpl=async(url,init)=>{
  assert.equal(url,'https://backboard.railway.com/graphql/v2');
  assert.equal(init.method,'POST');payload=JSON.parse(init.body);
  return {ok:true,status:200,json:async()=>({data:{project:{id,name:'Pilot',secrets:'DO_NOT_EXPORT'}}})};
 };
 const r=await collectRailwayProject({projectId:id,token:'test-readonly-token',fetchImpl});
 assert.equal(payload.variables.id,id);assert.equal(r.project_name,'Pilot');assert.equal(r.secrets,undefined);
});
test('Railway malformed project or GraphQL error rejected',async()=>{
 await assert.rejects(()=>collectRailwayProject({projectId:'javascript:evil',token:'test-readonly-token'}));
 const id='8cb69dd8-2bca-41d6-9760-2a5fda1d8de8';
 await assert.rejects(()=>collectRailwayProject({projectId:id,token:'test-readonly-token',fetchImpl:async()=>({ok:true,json:async()=>({errors:[{message:'secret'}]})})}),/railway_query_rejected/);
});
