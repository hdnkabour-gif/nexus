const shapes={
 grid:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
 layers:<><rect x="3" y="3" width="18" height="7" rx="2"/><path d="M7 13h14M3 17h18M7 21h14"/></>,
 pulse:<><path d="M2 12h4l3-7 4 14 3-7h6"/></>,
 nodes:<><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/></>,
 shield:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
 database:<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/></>,
 brain:<><path d="M12 5a4 4 0 0 0-7.2-2A5 5 0 0 0 3 12a4 4 0 0 0 4 6h1a4 4 0 0 0 8 0h1a4 4 0 0 0 4-6 5 5 0 0 0-1.8-9A4 4 0 0 0 12 5ZM12 5v14M8 11l4 2 4-2"/></>,
 plug:<><path d="M8 2v6M16 2v6M7 8h10v4a5 5 0 0 1-5 5v5M5 8h14"/></>,
 activity:<><path d="M3 21h18M4 17V9M10 17V3M16 17v-8M22 17v-5"/></>,
 settings:<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12"/></>,
 code:<><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/></>,
 arrow:<><path d="M5 12h14m-6-6 6 6-6 6"/></>,
 search:<><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
 lock:<><rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></>,
 chevron:<><path d="m9 18 6-6-6-6"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 3"/></>,
 alert:<><path d="M10.3 3.5 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0zM12 9v5M12 18h.01"/></>,
 check:<><path d="m5 12 4 4L19 6"/></>,
 logout:<><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M16 17l5-5-5-5M9 12h12"/></>,
 eye:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
 external:<><path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
 bot:<><rect x="4" y="7" width="16" height="14" rx="4"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M12 7V3M9 17h6"/></>,
 filter:<><path d="M4 7h16M7 12h10M10 17h4"/></>,
 refresh:<><path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7"/></>
};
export default function Icon({name,size=20,strokeWidth=1.8,className=''}) {
 return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]||shapes.grid}</svg>;
}
