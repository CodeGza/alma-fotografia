import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PageTransition from '@/components/dashboard/PageTransition';
import ProfileEditor from '@/components/dashboard/configuracion/ProfileEditor';
import { getProfileData } from '@/app/actions/profile-actions';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Perfil | Configuración',
  description: 'Gestiona tu información personal y de contacto',
};

export default async function ProfilePage() {
  const result = await getProfileData();

  if (!result.success) {
    redirect('/auth/login');
  }

  return (
    <PageTransition>
      <DashboardHeader
        title="Perfil"
        subtitle="Gestiona tu información personal y de contacto"
        backButton
        backHref="/dashboard/configuracion"
      />

      <div className="mt-8">
        <ProfileEditor initialProfile={result.profile} />
      </div>
    </PageTransition>
  );
}
