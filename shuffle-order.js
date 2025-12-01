require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function shuffleOrder() {
  const { data: galleries } = await supabase
    .from('galleries')
    .select('id, title')
    .ilike('title', '%juana%')
    .limit(1)
    .single();

  if (!galleries) {
    console.log('No se encontró galería');
    return;
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('id, file_name, display_order')
    .eq('gallery_id', galleries.id)
    .order('display_order', { ascending: true });

  console.log(`\n🔀 Desordenando ${photos.length} fotos...\n`);

  // Crear un orden aleatorio
  const shuffled = [...photos].sort(() => Math.random() - 0.5);

  // Actualizar display_order aleatoriamente
  for (let i = 0; i < shuffled.length; i++) {
    await supabase
      .from('photos')
      .update({ display_order: i + 1 })
      .eq('id', shuffled[i].id);

    console.log(`${i + 1}. ${shuffled[i].file_name} (nuevo orden: ${i + 1})`);
  }

  console.log('\n✅ Orden desordenado correctamente. Ahora refrescá la página y probá el selector de orden.');
}

shuffleOrder().catch(console.error);
