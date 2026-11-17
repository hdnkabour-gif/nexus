import discovery from '../registry/portfolio-discovery.v1.json';
const CATEGORIES={
'pneu-mouhim':{icon:'◈',accent:'mint',label:'Gestion stock & ventes',description:'Stocks multi-sites, pneumatiques, facturation, encaissement et services atelier',modules:['Stock','Ventes','Facturation','Atelier','Comptabilité']},
'rent-car':{icon:'▱',accent:'blue',label:'Location & flotte',description:'Locations, contrats, documents, validation et OCR',modules:['Contrats','Véhicules','OCR','Paiements']},
'amanzine':{icon:'◇',accent:'violet',label:'Commerce & livraison',description:'Marketplace, marchands, commandes et livraison',modules:['Marchands','Commandes','Livraison','API']},
'alloservix':{icon:'✳',accent:'amber',label:'Services techniques',description:'Services, demandes clients, techniciens et site public',modules:['Services','Demandes','Techniciens','Site']},
'nexora':{icon:'✚',accent:'rose',label:'Plateforme médicale',description:'Architecture de clinique, accès, modules de spécialité',modules:['Cabinets','Accès','Modules','Audit']},
'tech-platform':{icon:'▦',accent:'cyan',label:'Infrastructure audiovisuelle',description:'Équipements, écrans, chemins de signal et maintenance',modules:['Équipements','Salles','Tickets','Diagnostic']}
};
export const snapshotAt=discovery.observed_on;
export const portfolio=Object.freeze(discovery.apps.map(a=>Object.freeze({...a,...CATEGORIES[a.app_id],connection_label:'غير متصل',health_state:'unknown',backup_state:'unknown'})));
export function getApp(id){return portfolio.find(x=>x.app_id===id)||null;}
export const portfolioStats=Object.freeze({
 applications:portfolio.length,
 railway_projects:new Set(portfolio.flatMap(a=>a.railway_projects.map(p=>p.id))).size,
 live_adapters:0,
 verified_backups:0
});
