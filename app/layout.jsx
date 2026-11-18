import './globals.css';
import './command-os.css';
export const metadata={
 title:'NEXUS • Intelligence & Control',
 description:'NEXUS operational intelligence center — protected initial preview.',
 robots:{index:false,follow:false}
};
export default function RootLayout({children}){
 return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
