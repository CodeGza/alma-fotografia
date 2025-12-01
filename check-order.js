require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrder() {
  const { data: galleries } = await supabase
    .from('galleries')
    .select('id, title')
    .ilike('title', '%juana%')
    .limit(1)
    .single();

  if (!galleries) {
    console.log('No se encontró galería con "juana" en el título');
    return;
  }

  console.log(`\n📁 Galería: ${galleries.title} (ID: ${galleries.id})\n`);

  const { data: photos } = await supabase
    .from('photos')
    .select('id, file_name, display_order')
    .eq('gallery_id', galleries.id)
    .order('display_order', { ascending: true });

  console.log('Fotos ordenadas por display_order:\n');
  photos.forEach((photo, i) => {
    console.log(`${i + 1}. ${photo.file_name} (display_order: ${photo.display_order})`);
  });
}

checkOrder().catch(console.error);
