// Read-only attestation of the RUNTIME database role (#31 review): the application must not be able to
// rewrite history. It reports, for the role it is connected as: superuser / BYPASSRLS, ownership of the
// history tables (an owner can drop the append-only triggers), UPDATE/DELETE/TRUNCATE privileges, and
// whether the append-only triggers are installed. It changes nothing.
export const HISTORY_TABLES=Object.freeze(['nexus_task_observation_history','nexus_knowledge_revisions']);

export async function checkRuntimePrivileges(client){
 const role=(await client.query(`SELECT current_user AS name,rolsuper AS superuser,rolbypassrls AS bypassrls FROM pg_roles WHERE rolname=current_user`)).rows[0];
 const tables=[];
 for(const t of HISTORY_TABLES){
  const r=(await client.query(`SELECT pg_get_userbyid(c.relowner)=current_user AS owned,
     has_table_privilege(current_user,c.oid,'UPDATE') AS can_update,has_table_privilege(current_user,c.oid,'DELETE') AS can_delete,
     has_table_privilege(current_user,c.oid,'TRUNCATE') AS can_truncate,
     (SELECT count(*)::int FROM pg_trigger g WHERE g.tgrelid=c.oid AND NOT g.tgisinternal AND g.tgenabled<>'D' AND g.tgname LIKE 'nexus_%') AS triggers
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=$1`,[t])).rows[0];
  tables.push(r?{table:t,...r,triggers_ok:r.triggers>=2}:{table:t,missing:true});
 }
 const problems=[];
 if(role.superuser)problems.push('runtime role is superuser');
 if(role.bypassrls)problems.push('runtime role has BYPASSRLS');
 for(const t of tables){
  if(t.missing){problems.push(`${t.table}: missing`);continue;}
  if(t.owned)problems.push(`${t.table}: owned by the runtime role (it could drop the append-only triggers)`);
  if(!t.triggers_ok)problems.push(`${t.table}: append-only triggers missing or disabled`);
  if(t.can_update||t.can_delete||t.can_truncate)problems.push(`${t.table}: UPDATE/DELETE/TRUNCATE granted (refused by triggers, but should be revoked)`);
 }
 return {role:role.name,superuser:role.superuser,bypassrls:role.bypassrls,tables,problems,ok:problems.length===0};
}
