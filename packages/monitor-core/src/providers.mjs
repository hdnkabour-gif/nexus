/** Scoped provider metadata clients. No writes, no API payload passthrough. */
function repositoryPath(repository) {
  if(typeof repository!=='string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || repository.includes('..')) {
    throw new TypeError('invalid GitHub repository');
  }
  return repository.split('/').map(encodeURIComponent).join('/');
}
function ensureToken(token) {
  if(typeof token!=='string' || token.length<12 || /\s/.test(token)) throw new TypeError('provider credential missing');
}
function timeoutSignal(milliseconds=8_000) {
  const limit=Number.isFinite(milliseconds)&&milliseconds>0&&milliseconds<=30_000?milliseconds:8_000;
  return AbortSignal.timeout(limit);
}
/**
 * Fetch GitHub repo metadata only. Pass a dedicated read-only installation
 * token. Does not download source code, CI logs, secrets or customer records.
 */
export async function collectGitHubRepo({repository,token,fetchImpl=fetch,timeoutMs=8000}) {
  const path=repositoryPath(repository);
  ensureToken(token);
  const resp=await fetchImpl('https://api.github.com/repos/'+path,{
    method:'GET',
    headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'},
    signal:timeoutSignal(timeoutMs)
  });
  if(!resp || !resp.ok) throw new Error('github_request_failed_'+(Number.isInteger(resp?.status)?resp.status:'unknown'));
  const raw=await resp.json();
  if(!raw || typeof raw!=='object' || raw.full_name!==repository || typeof raw.default_branch!=='string') throw new Error('github_payload_invalid');
  const stamp=typeof raw.pushed_at==='string' && Number.isFinite(Date.parse(raw.pushed_at)) ? raw.pushed_at:null;
  return Object.freeze({
    provider:'github',repository:raw.full_name,default_branch:raw.default_branch,
    archived:raw.archived===true,private:raw.private===true,
    pushed_at:stamp,source:'github_api',readonly:true
  });
}

/**
 * Query one explicit Railway project. Endpoint and GraphQL shape are fixed,
 * response fields allowlisted and must be verified on staging with a dedicated
 * project-scoped credential before production use.
 */
export async function collectRailwayProject({projectId,token,fetchImpl=fetch,timeoutMs=8000}) {
  if(typeof projectId!=='string' || !/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(projectId)) throw new TypeError('invalid railway project id');
  ensureToken(token);
  const query='query NexusReadOnlyProject($id: String!) { project(id: $id) { id name } }';
  const resp=await fetchImpl('https://backboard.railway.com/graphql/v2',{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
    body:JSON.stringify({query,variables:{id:projectId}}),
    signal:timeoutSignal(timeoutMs)
  });
  if(!resp || !resp.ok) throw new Error('railway_request_failed_'+(Number.isInteger(resp?.status)?resp.status:'unknown'));
  const raw=await resp.json();
  if(raw?.errors?.length) throw new Error('railway_query_rejected');
  if(raw?.data?.project?.id!==projectId) throw new Error('railway_payload_invalid');
  return Object.freeze({provider:'railway',project_id:projectId,project_name:typeof raw.data.project.name==='string'?raw.data.project.name.slice(0,120):'unknown',source:'railway_graphql',readonly:true});
}
