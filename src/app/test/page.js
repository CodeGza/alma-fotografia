export default function Page() {
  const clientUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverUrl = process.env.SUPABASE_URL;
  const hasClientKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasServerKey = !!process.env.SUPABASE_ANON_KEY;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <h1>🔍 Verificación de variables de entorno</h1>
      <pre style={{ marginTop: '1rem', background: '#111', padding: '1rem', borderRadius: '8px' }}>
        {JSON.stringify(
          {
            NEXT_PUBLIC_SUPABASE_URL: clientUrl || '❌ NO LEÍDA',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: hasClientKey ? '✅ OK' : '❌ MISSING',
            SUPABASE_URL: serverUrl || '❌ NO LEÍDA',
            SUPABASE_ANON_KEY: hasServerKey ? '✅ OK' : '❌ MISSING',
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}
