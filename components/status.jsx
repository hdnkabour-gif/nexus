export default function Status({state='unknown',label}){
 const text=label||({unknown:'غير مؤكد',healthy:'سليم',critical:'حرج',warning:'تحذير',connected:'متصل',not_connected:'بانتظار الربط',degraded:'متدهور'}[state]||state);
 return <span className={'status-pill status-'+state}><i/>{text}</span>;
}
