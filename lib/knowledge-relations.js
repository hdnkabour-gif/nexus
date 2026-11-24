// References existing RU IDs in portfolio baseline. These are proposed patterns
// for reuse, NOT proof of a connected service or shared database.
export const RELATIONS=Object.freeze([
 ['RU-01',['pneu-mouhim','tijara-os','amanzine']],
 ['RU-02',['pneu-mouhim','rent-car','tijara-os','alloservix','nexus']],
 ['RU-03',['rent-car','scanflow-pro','fleetdocs-ai','alloservix']],
 ['RU-04',['pneu-mouhim','rent-car','amanzine']],
 ['RU-05',['amanzine','alloservix']],
 ['RU-06',['tijara-os','nexora','amanzine']],
 ['RU-07',['nexus','rent-car','tijara-os','alloservix']],
 ['RU-08',['pneu-mouhim','tijara-os','rent-car','amanzine']],
 ['RU-09',['tijara-os','nexus']]
].map(([id,apps])=>Object.freeze({id,apps:Object.freeze(apps)})));
export function relationApps(id){return RELATIONS.find(x=>x.id===id)?.apps??[];}
