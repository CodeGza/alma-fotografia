import { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ConfigMenu from '@/components/dashboard/configuracion/ConfigMenu';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Configuración | Alma Fotografía',
  description: 'Configura tu cuenta y servicios',
};

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-4xl mx-auto space-y-4 animate-pulse">
      <div className="h-32 bg-gray-100 rounded-lg" />
      <div className="h-32 bg-gray-100 rounded-lg" />
      <div className="h-32 bg-gray-100 rounded-lg" />
    </div>
  );
}

export default function ConfiguracionPage() {
  return (
    <>
      <DashboardHeader
        title="Configuración"
        subtitle="Administra tus servicios y preferencias"
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <ConfigMenu />
      </Suspense>
    </>
  );
}