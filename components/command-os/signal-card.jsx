import Icon from '../icons';
export default function SignalCard({code,label,value,detail,icon='pulse',tone='neutral'}){
 return <div className={'os-signal-card tone-'+tone}><span className="os-signal-code">{code} / {label}</span><div className="os-signal-main"><strong>{value}</strong><span className="os-signal-icon"><Icon name={icon} size={21}/></span></div><small>{detail}</small></div>;
}