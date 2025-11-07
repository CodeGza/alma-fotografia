/**
 * DashboardSkeleton - Loading placeholder para estadísticas
 * 
 * Muestra un skeleton genérico mientras cargan los datos.
 * Diseño minimalista que coincide con el estilo de StatCard.
 * 
 * Props:
 * @param {string} type - 'stat' | 'action' (para futuros skeletons)
 */
export default function DashboardSkeleton({ type = 'stat' }) {
  if (type === 'stat') {
    return (
      <div className="bg-white border border-black/20 rounded-none p-8 animate-pulse">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 border border-black/10 bg-black/5" />
        </div>
        <div className="text-center space-y-2">
          <div className="h-12 bg-black/5 rounded w-20 mx-auto" />
          <div className="h-4 bg-black/5 rounded w-24 mx-auto" />
        </div>
      </div>
    );
  }

  return null;
}