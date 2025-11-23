import { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SecuritySettings from '@/components/dashboard/configuracion/SecuritySettings';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Seguridad | Alma Fotografía',
  description: 'Gestiona la seguridad de tu cuenta',
};

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 animate-pulse">
      <div className="h-48 bg-white rounded-xl" />
      <div className="h-48 bg-white rounded-xl" />
    </div>
  );
}

export default function SeguridadPage() {
  return (
    <>
      <DashboardHeader
        title="Seguridad"
        subtitle="Gestiona la seguridad de tu cuenta"
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <SecuritySettings />
      </Suspense>
    </>
  );
}
