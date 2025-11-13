import { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ServiceEditor from '@/components/dashboard/configuracion/ServiceEditor';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Tipos de Servicio | Configuración',
  description: 'Gestiona los tipos de servicio que ofreces',
};

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="h-96 bg-white rounded-xl animate-pulse" />
    </div>
  );
}

export default function ServiciosPage() {
  return (
    <>
      <DashboardHeader
        title="Tipos de Servicio"
        subtitle="Gestiona los servicios que ofreces a tus clientes"
        backButton={true}
        backHref="/dashboard/configuracion"
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <ServiceEditor />
      </Suspense>
    </>
  );
}