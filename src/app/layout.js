import { voga, firaSans } from '@/fonts';
import './globals.css';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: 'Alma Fotografía - Dashboard',
  description: 'Panel de administración de Alma Fotografía',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${voga.variable} ${firaSans.variable}`}>
      <body className="font-fira antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}