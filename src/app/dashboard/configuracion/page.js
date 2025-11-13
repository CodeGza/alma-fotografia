import { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ConfigOverview from '@/components/dashboard/configuracion/ConfigOverview';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Configuración | Alma Fotografía',
  description: 'Configura tu cuenta y servicios',
};

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 animate-pulse">
      <div className="h-32 bg-white rounded-xl" />
      <div className="h-32 bg-white rounded-xl" />
      <div className="h-32 bg-white rounded-xl" />
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
        <ConfigOverview />
      </Suspense>
    </>
  );
}