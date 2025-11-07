import { Suspense } from 'react';
import { createClient } from '@/lib/server';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import GalleryCard from '@/components/dashboard/galeria/GalleryCard';
import CreateGalleryButton from '@/components/dashboard/galeria/CreateGalleryButton';
import CreateGalleryCard from '@/components/dashboard/galeria/CreateGalleryCard';
import GalleryGridSkeleton from '@/components/dashboard/galeria/GalleryGridSkeleton';
import { ImageOff } from 'lucide-react';

export const revalidate = 60;

async function GalleriesGrid() {
  const supabase = await createClient();

  // Obtener galerías con count de fotos
  const { data: galleries, error } = await supabase
    .from('galleries')
    .select(`
      *,
      photos(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching galleries:', error);
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="font-fira text-black/60">Error al cargar las galerías</p>
      </div>
    );
  }

  // Transformar datos
  const galleriesWithCount = (galleries || []).map((gallery) => ({
    id: gallery.id,
    title: gallery.title,
    slug: gallery.slug,
    event_date: gallery.event_date,
    client_email: gallery.client_email,
    cover_image: gallery.cover_image,
    created_at: gallery.created_at,
    is_public: gallery.is_public,
    views_count: gallery.views_count || 0,
    photoCount: gallery.photos?.[0]?.count || 0,
  }));

  const isEmpty = galleriesWithCount.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="mb-6 p-8 rounded-full bg-beige/30">
          <ImageOff size={48} className="text-black/40" strokeWidth={1} />
        </div>
        <h2 className="font-voga text-2xl text-black mb-2">
          Aún no hay galerías creadas
        </h2>
        <p className="font-fira text-black/60 mb-8 max-w-md">
          Crea tu primera galería para comenzar a compartir tus fotografías con tus clientes.
        </p>
        <CreateGalleryButton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CreateGalleryCard />
      
      {galleriesWithCount.map((gallery, index) => (
        <GalleryCard
          key={gallery.id}
          gallery={gallery}
          index={index + 1}
        />
      ))}
    </div>
  );
}

export default function GaleriasPage() {
  return (
    <>
      <DashboardHeader
        title="Galerías"
        subtitle="Gestiona y comparte tus sesiones fotográficas"
        action={<CreateGalleryButton />}
      />

      <div className="p-8 lg:p-12">
        <Suspense fallback={<GalleryGridSkeleton />}>
          <GalleriesGrid />
        </Suspense>
      </div>
    </>
  );
}