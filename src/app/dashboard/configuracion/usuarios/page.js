import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PageTransition from '@/components/dashboard/PageTransition';
import UserManagementTable from '@/components/dashboard/configuracion/UserManagementTable';
import { getAllUsers } from '@/app/actions/user-management-actions';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Administrar Usuarios | Configuración',
  description: 'Gestiona usuarios y permisos del sistema',
};

export default async function UsersManagementPage() {
  const result = await getAllUsers();

  return (
    <PageTransition>
      <DashboardHeader
        title="Administrar Usuarios"
        subtitle="Gestiona usuarios, permisos y accesos al dashboard"
        backButton
        backHref="/dashboard/configuracion/perfil"
      />

      <div className="mt-8">
        {!result.success ? (
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-fira text-lg font-semibold text-red-900 mb-2">
                Error de permisos
              </h3>
              <p className="font-fira text-sm text-red-800 mb-4">
                {result.error}
              </p>
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <p className="font-fira text-xs text-gray-600 mb-2">
                  Verificá que hayas ejecutado todos los SQLs en Supabase Dashboard.
                </p>
                <p className="font-fira text-xs text-gray-600">
                  Revisá la consola del servidor para más detalles.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <UserManagementTable initialUsers={result.users} />
        )}
      </div>
    </PageTransition>
  );
}
