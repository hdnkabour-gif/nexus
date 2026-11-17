/** Provider normalization: explicit field allowlist, no raw payloads or secrets. */
const PROVIDERS = new Set(['github','railway','app_adapter','dns','tls','backup_store','otel','external_api']);
const STATES = new Set(['healthy','degraded','down','unknown']);
const KINDS = new Set(['repository','workflow','deployment','service','database','volume','backup','dns_record','tls_certificate','api','integration','check']);
const keyOk = x => typeof x==='string' && x.length>=2 && x.length<=128 && /^[a-zA-Z0-9_.:/-]+$/.test(x);
function dateValid(s) {
  return typeof s==='string' && /(?:Z|[+-]\d\d:\d\d)$/.test(s) && Number.isFinite(Date.parse(s));
}
export function normalizeObservation(source, now = new Date()) {
  if (!source || typeof source!=='object' || Array.isArray(source)) throw new TypeError('invalid observation');
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError('invalid clock');
  const {app_id,environment,provider,kind,resource_ref,state,observed_at} = source;
  if (![app_id,environment,resource_ref].every(keyOk) || !PROVIDERS.has(provider) || !KINDS.has(kind) || !STATES.has(state) || !dateValid(observed_at)) {
    throw new TypeError('invalid operational observation');
  }
  const ms = Date.parse(observed_at);
  if(ms > now.getTime()+60_000) throw new TypeError('observation from future');
  // Avoid propagating untrusted names/URLs/logs/headers/tokens/PII.
  return Object.freeze({
    app_id,environment,provider,kind,resource_ref,state,observed_at,
    stale: now.getTime()-ms > 15 * 60_000
  });
}
const ORDER = Object.freeze({down:0,degraded:1,unknown:2,healthy:3});
export function summarizeObservations(observations, appId, environment, now = new Date()) {
  if (!keyOk(appId) || !keyOk(environment)) throw new TypeError('invalid scope');
  if (!Array.isArray(observations)) throw new TypeError('observations must be array');
  const latest = new Map();
  for(const o of observations) {
    const x=normalizeObservation(o,now);
    if(x.app_id !== appId || x.environment !== environment) continue;
    const k=[x.provider,x.kind,x.resource_ref].join('|');
    const previous=latest.get(k);
    if(!previous || Date.parse(x.observed_at)>Date.parse(previous.observed_at)) latest.set(k,x);
  }
  const clean=[...latest.values()];
  const states=clean.map(x=>x.stale?'unknown':x.state);
  return Object.freeze({
    app_id:appId,environment,
    observed_count:clean.length,
    stale_count:clean.filter(x=>x.stale).length,
    state: states.length===0 ? 'unknown' : states.sort((a,b)=>ORDER[a]-ORDER[b])[0],
    observations:clean
  });
}
