import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para Client Components
 * 
 * Exporta una función que crea el cliente para mantener
 * consistencia con el patrón de Supabase SSR.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// También exportar instancia directa para casos simples
export const supabase = createClient();