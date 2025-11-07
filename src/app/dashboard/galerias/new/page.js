import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CreateGalleryForm from '@/components/dashboard/galeria/CreateGalleryForm';

/**
 * Página para crear nueva galería
 * 
 * Server Component simple que renderiza el formulario.
 * Toda la lógica reactiva está en CreateGalleryForm (Client Component).
 */
export default function NewGalleryPage() {
  return (
    <>
      <DashboardHeader
        title="Crear nueva galería"
        subtitle="Completa la información básica de la sesión fotográfica"
      />

      <div className="p-8 lg:p-12 max-w-4xl">
        <CreateGalleryForm />
      </div>
    </>
  );
}