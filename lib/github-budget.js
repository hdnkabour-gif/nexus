// One hourly budget for every anonymous GitHub read made by NEXUS (console page refresh AND the
// knowledge sync), shared through PostgreSQL so separate processes behind one egress IP cannot
// together exceed GitHub's anonymous primary limit (60 requests/hour/IP). We keep a margin below it.
// A batch is reserved as a whole BEFORE any request: if it does not fit, no request is made and the
// tasks are reported UNKNOWN (reason: budget), never as success or failure.
import {databaseConfigured,dbQuery} from './db.js';

export const GITHUB_HOURLY_LIMIT=60;
export const GITHUB_HOURLY_BUDGET=50;

const RESERVE_SQL=`WITH w AS (SELECT (window_start < now()-interval '1 hour') AS expired FROM nexus_github_budget WHERE id=1 FOR UPDATE)
 UPDATE nexus_github_budget b SET
  window_start=CASE WHEN w.expired THEN now() ELSE b.window_start END,
  used=CASE WHEN w.expired THEN $1 ELSE b.used+$1 END
 FROM w WHERE b.id=1 AND (CASE WHEN w.expired THEN $1 ELSE b.used+$1 END) <= $2
 RETURNING b.used`;

/** Database-backed budget (shared by all processes using the same database). */
export function createDbBudget({query=(sql,params)=>dbQuery(sql,params),budget=GITHUB_HOURLY_BUDGET}={}){
 return {
  shared:true,
  async reserve(n){
   if(!Number.isInteger(n)||n<1||n>budget)return false;
   await query('INSERT INTO nexus_github_budget(id,window_start,used) VALUES(1,now(),0) ON CONFLICT (id) DO NOTHING');
   const r=await query(RESERVE_SQL,[n,budget]);
   return r.rowCount===1;
  },
  // GitHub said 0 remaining (another client on the same IP): close the window for everyone.
  async exhaust(){await query('UPDATE nexus_github_budget SET used=$1 WHERE id=1',[budget]);}
 };
}

/** Per-process fallback when no database is configured (cannot coordinate across processes). */
export function createMemoryBudget({now=()=>Date.now(),budget=GITHUB_HOURLY_BUDGET}={}){
 let start=now(),used=0;
 return {
  shared:false,
  async reserve(n){
   if(now()-start>=3600_000){start=now();used=0;}
   if(!Number.isInteger(n)||n<1||used+n>budget)return false;
   used+=n;return true;
  },
  async exhaust(){used=budget;}
 };
}

let defaultBudget;
export function githubBudget(){
 if(!defaultBudget)defaultBudget=databaseConfigured()?createDbBudget():createMemoryBudget();
 return defaultBudget;
}
