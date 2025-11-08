import { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CreateGalleryForm from '@/components/dashboard/galeria/CreateGalleryForm';

/**
 * Página de creación de galería
 * 
 * Server Component optimizado con Suspense
 */
export const metadata = {
  title: 'Crear Galería | Alma Fotografía',
  description: 'Crea una nueva galería para tus clientes',
};

function FormSkeleton() {
  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 w-32 bg-black/10 rounded" />
        <div className="h-12 bg-black/5 rounded-lg" />
      </div>
      <div className="space-y-4">
        <div className="h-4 w-32 bg-black/10 rounded" />
        <div className="h-12 bg-black/5 rounded-lg" />
      </div>
      <div className="space-y-4">
        <div className="h-4 w-32 bg-black/10 rounded" />
        <div className="h-32 bg-black/5 rounded-lg" />
      </div>
    </div>
  );
}

export default function NewGalleryPage() {
  return (
    <>
      <DashboardHeader
        title="Crear nueva galería"
        subtitle="Completa la información de la sesión fotográfica"
      />

      <Suspense fallback={<FormSkeleton />}>
        <CreateGalleryForm />
      </Suspense>
    </>
  );
}