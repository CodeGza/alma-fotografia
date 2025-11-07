import { Suspense } from 'react';
import { createClient } from '@/lib/server';
import { notFound } from 'next/navigation';
import PublicGalleryView from '@/components/public/PublicGalleryView';
import PublicGallerySkeleton from '@/components/public/PublicGallerySkeleton';

/**
 * Página pública de galería compartida
 * 
 * Arquitectura:
 * - Server Component para fetch de datos
 * - Validación de token en servidor (seguridad)
 * - ISR para cachear páginas (performance)
 * - Suspense para streaming (UX)
 * 
 * Flujo:
 * 1. Validar token y permisos
 * 2. Obtener galería + fotos
 * 3. Trackear vista
 * 4. Renderizar vista pública
 */

/**
 * ISR - Cachea la página por 5 minutos
 * 
 * Por qué 300 segundos:
 * - Las galerías no cambian frecuentemente
 * - Reduce carga en Supabase drásticamente
 * - Balance entre frescura y performance
 */
export const revalidate = 300;

/**
 * GalleryContent - Componente que carga los datos
 * 
 * Separado del page principal para usar Suspense.
 * Esto permite mostrar skeleton mientras carga.
 */
async function GalleryContent({ slug, token }) {
  const supabase = await createClient();

  // ✅ Paso 1: Validar token y permisos
  const { data: shareData, error: shareError } = await supabase
    .from('gallery_shares')
    .select('id, gallery_id, views_count, last_viewed_at')
    .eq('share_token', token)
    .eq('is_active', true)
    .single();

  // Por qué notFound(): retorna 404 semántico (SEO + UX)
  if (shareError || !shareData) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Invalid/inactive token:', token);
    }
    notFound();
  }

  // ✅ Paso 2: Obtener galería con fotos en una sola query
  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', shareData.gallery_id) // Usar el ID del share
    .single();

  if (galleryError || !gallery) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Gallery not found:', shareData.gallery_id);
    }
    notFound();
  }

  // 🆕 PASO 2.5: Obtener fotos de la galería
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', gallery.id)
    .order('display_order', { ascending: true });

  // Agregar fotos a la galería
  gallery.photos = photos || [];

  // ✅ Paso 3: Incrementar vistas (no bloqueante)
  // Por qué fire-and-forget: no queremos esperar a que termine
  // para renderizar la página, mejora tiempo de respuesta
  supabase
    .from('gallery_shares')
    .update({
      views_count: (shareData.views_count || 0) + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq('id', shareData.id)
    .then(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ View tracked:', gallery.title);
      }
    })
    .catch(err => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to track view:', err);
      }
    });

  // ✅ Paso 4: Filtrar fotos válidas
  // Por qué filtrar: datos de prueba pueden tener URLs inválidas
  // que romperían next/image
  const validPhotos = (gallery.photos || [])
    .filter(photo => {
      if (!photo.file_path) return false;
      // Solo aceptar URLs HTTP(S) o paths absolutos
      return photo.file_path.startsWith('http') || photo.file_path.startsWith('/');
    })
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <PublicGalleryView
      gallery={{
        id: gallery.id,
        title: gallery.title,
        slug: gallery.slug,
        eventDate: gallery.event_date,
        clientEmail: gallery.client_email,
        coverImage: gallery.cover_image,
        photos: validPhotos,
      }}
      token={token}
    />
  );
}

/**
 * Página principal - Renderizado inmediato con Suspense
 * 
 * Por qué estructura así:
 * - El componente page se renderiza inmediatamente
 * - GalleryContent carga en segundo plano
 * - Usuario ve skeleton mientras tanto (mejor UX)
 */
export default async function PublicGalleryPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token;

  // Validación básica antes de Suspense
  if (!token) {
    notFound();
  }

  return (
    <Suspense fallback={<PublicGallerySkeleton />}>
      <GalleryContent slug={slug} token={token} />
    </Suspense>
  );
}

/**
 * Metadata dinámica para SEO
 * 
 * Por qué importante:
 * - Mejora SEO de enlaces compartidos
 * - Preview correcto en redes sociales
 * - Título descriptivo en pestañas del navegador
 */
export async function generateMetadata({ params, searchParams }) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token;

  if (!token) {
    return {
      title: 'Galería no encontrada | Alma Fotografía',
      description: 'Esta galería no está disponible o el enlace no es válido.',
    };
  }

  const supabase = await createClient();

  const { data: shareData } = await supabase
    .from('gallery_shares')
    .select('gallery_id')
    .eq('share_token', token)
    .eq('is_active', true)
    .single();

  if (!shareData) {
    return {
      title: 'Galería no encontrada | Alma Fotografía',
      description: 'Esta galería no está disponible.',
    };
  }

  const { data: gallery } = await supabase
    .from('galleries')
    .select('title, event_date')
    .eq('id', shareData.gallery_id)
    .single();

  if (!gallery) {
    return {
      title: 'Galería | Alma Fotografía',
    };
  }

  const formattedDate = gallery.event_date
    ? new Date(gallery.event_date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    })
    : '';

  return {
    title: `${gallery.title} | Alma Fotografía`,
    description: `Galería de fotos${formattedDate ? ` - ${formattedDate}` : ''}. Ve y descarga tus fotos profesionales.`,
  };
}