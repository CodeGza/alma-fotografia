import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export const metadata = {
  title: {
    default: 'Dashboard - Alma Fotografía',
    template: '%s - Dashboard - Alma Fotografía'
  },
  description: 'Panel de administración de Alma Fotografía',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * DashboardLayout - Layout base para todas las páginas del dashboard
 *
 * Obtiene datos del usuario autenticado y los pasa a componentes hijos
 */
export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Verificar autenticación
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  /**
   * Extrae el nombre del usuario con prioridad:
   * 1. full_name del metadata
   * 2. Parte antes del @ del email
   * 3. "Usuario" como fallback
   */
  const userName = user.user_metadata?.full_name || 
                   user.email?.split('@')[0] || 
                   'Usuario';

  return (
    <DashboardLayoutClient userName={userName}>
      {children}
    </DashboardLayoutClient>
  );
}