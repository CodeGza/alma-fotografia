import { voga, firaSans } from '@/fonts';
import './globals.css';

export const metadata = {
  title: 'Alma Fotografía - Dashboard',
  description: 'Panel de administración de Alma Fotografía',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${voga.variable} ${firaSans.variable}`}>
      <body className="font-fira antialiased">
        {children}
      </body>
    </html>
  );
}