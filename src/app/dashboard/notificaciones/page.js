import { Suspense } from 'react';
import DashboardHeader from '../DashboardHeader';
import NotificationsView from '@/components/dashboard/notificaciones/NotificationsView';
import NotificationsSkeleton from '@/components/dashboard/notificaciones/NotificationsSkeleton';

export const metadata = {
  title: 'Notificaciones | Alma Fotografía',
  description: 'Gestiona tus notificaciones',
};

export default function NotificacionesPage() {
  return (
    <>
      <DashboardHeader
        title="Notificaciones"
        subtitle="Mantente al día con todas las actualizaciones de tus galerías"
      />
      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsView />
      </Suspense>
    </>
  );
}
