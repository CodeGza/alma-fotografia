import { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LandingVideoManager from '@/components/dashboard/configuracion/LandingVideoManager';
import { getLandingVideos } from '@/app/actions/landing-video-actions';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Videos Landing | Configuración | Alma Fotografía',
  description: 'Gestiona los videos de la página principal',
};

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#79502A]" />
      </div>
    </div>
  );
}

async function VideoManagerContent() {
  const { videos } = await getLandingVideos();
  return <LandingVideoManager initialVideos={videos} />;
}

export default function LandingConfigPage() {
  return (
    <>
      <DashboardHeader
        title="Videos Landing"
        subtitle="Sube hasta 2 videos para mostrar en la página principal"
        backUrl="/dashboard/configuracion"
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <VideoManagerContent />
      </Suspense>
    </>
  );
}
