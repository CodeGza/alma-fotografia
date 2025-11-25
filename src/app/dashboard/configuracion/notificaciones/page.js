import { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NotificationSettings from '@/components/dashboard/configuracion/NotificationSettings';
import NotificationSettingsSkeleton from '@/components/dashboard/configuracion/NotificationSettingsSkeleton';

export const metadata = {
  title: 'Configuración de Notificaciones | Alma Fotografía',
  description: 'Administra cómo y cuándo recibes notificaciones',
};

export default function NotificationSettingsPage() {
  return (
    <>
      <DashboardHeader
        title="Configuración de Notificaciones"
        subtitle="Personaliza cómo y cuándo quieres recibir notificaciones"
        backButton
        backHref="/dashboard/configuracion"
      />
      <Suspense fallback={<NotificationSettingsSkeleton />}>
        <NotificationSettings />
      </Suspense>
    </>
  );
}
