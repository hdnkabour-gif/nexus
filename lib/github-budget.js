// One hourly budget for every anonymous GitHub read made by NEXUS (console page refresh AND the
// knowledge sync), shared through PostgreSQL so separate processes behind one egress IP cannot
// together exceed GitHub's anonymous primary limit (60 requests/hour/IP). We keep a margin below it.
// A batch is reserved as a whole BEFORE any request: if it does not fit, no request is made and the
// tasks are reported UNKNOWN (reason: budget), never as success or failure.
import {databaseConfigured,dbQuery} from './db.js';

export const GITHUB_HOURLY_LIMIT=60;
export const GITHUB_HOURLY_BUDGET=50;
// Never spend GitHub's last requests: other clients on the same IP may need them.
export const GITHUB_SAFETY_MARGIN=5;
// Our own count and GitHub's own window are not aligned. After each batch we record what GitHub reports
// (x-ratelimit-remaining, x-ratelimit-reset): until that reset time, a batch is refused if GitHub's
// remaining minus the batch would fall under the margin. The budget reopens at GitHub's real reset time.

const RESERVE_SQL=`WITH w AS (SELECT (window_start < now()-interval '1 hour') AS expired,(gh_reset_at IS NOT NULL AND gh_reset_at>now()) AS gh_active FROM nexus_github_budget WHERE id=1 FOR UPDATE)
 UPDATE nexus_github_budget b SET
  window_start=CASE WHEN w.expired THEN now() ELSE b.window_start END,
  used=CASE WHEN w.expired THEN $1 ELSE b.used+$1 END,
  gh_remaining=CASE WHEN w.gh_active THEN b.gh_remaining-$1 ELSE NULL END,
  gh_reset_at=CASE WHEN w.gh_active THEN b.gh_reset_at ELSE NULL END
 FROM w WHERE b.id=1 AND (CASE WHEN w.expired THEN $1 ELSE b.used+$1 END) <= $2
  AND (NOT w.gh_active OR b.gh_remaining-$1 >= $3)
 RETURNING b.used`;
const OBSERVE_SQL=`UPDATE nexus_github_budget SET gh_remaining=CASE WHEN gh_reset_at IS NOT NULL AND gh_reset_at=to_timestamp($2) THEN LEAST(gh_remaining,$1) ELSE $1 END,
  gh_reset_at=to_timestamp($2) WHERE id=1 AND (gh_reset_at IS NULL OR gh_reset_at<=to_timestamp($2))`;

/** Database-backed budget (shared by all processes using the same database). */
export function createDbBudget({query=(sql,params)=>dbQuery(sql,params),budget=GITHUB_HOURLY_BUDGET}={}){
 return {
  shared:true,
  async reserve(n){
   if(!Number.isInteger(n)||n<1||n>budget)return false;
   await query('INSERT INTO nexus_github_budget(id,window_start,used) VALUES(1,now(),0) ON CONFLICT (id) DO NOTHING');
   const r=await query(RESERVE_SQL,[n,budget,GITHUB_SAFETY_MARGIN]);
   return r.rowCount===1;
  },
  /** Record GitHub's lowest reported remaining for its current window and when that window reopens. */
  async observe({remaining,reset}){
   if(!Number.isInteger(remaining)||remaining<0||!Number.isInteger(reset)||reset<=0)return;
   await query('INSERT INTO nexus_github_budget(id,window_start,used) VALUES(1,now(),0) ON CONFLICT (id) DO NOTHING');
   await query(OBSERVE_SQL,[remaining,reset]);
  }
 };
}

/** Per-process fallback when no database is configured (cannot coordinate across processes). */
export function createMemoryBudget({now=()=>Date.now(),budget=GITHUB_HOURLY_BUDGET}={}){
 let start=now(),used=0,ghRemaining=null,ghResetMs=0;
 return {
  shared:false,
  async reserve(n){
   if(now()-start>=3600_000){start=now();used=0;}
   const ghActive=ghRemaining!==null&&now()<ghResetMs;
   if(!ghActive){ghRemaining=null;}
   if(!Number.isInteger(n)||n<1||used+n>budget)return false;
   if(ghActive&&ghRemaining-n<GITHUB_SAFETY_MARGIN)return false;
   used+=n;if(ghActive)ghRemaining-=n;return true;
  },
  async observe({remaining,reset}){
   if(!Number.isInteger(remaining)||remaining<0||!Number.isInteger(reset)||reset<=0)return;
   const ms=reset*1000;
   if(ms<ghResetMs)return;
   ghRemaining=ms===ghResetMs&&ghRemaining!==null?Math.min(ghRemaining,remaining):remaining;ghResetMs=ms;
  }
 };
}

let defaultBudget;
export function githubBudget(){
 if(!defaultBudget)defaultBudget=databaseConfigured()?createDbBudget():createMemoryBudget();
 return defaultBudget;
}
