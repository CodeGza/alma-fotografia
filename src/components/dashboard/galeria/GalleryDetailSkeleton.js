/**
 * GalleryDetailSkeleton - Skeleton loader para vista individual
 * 
 * Por qué necesario:
 * - Mejora UX mientras carga
 * - Muestra estructura esperada
 */
export default function GalleryDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header con info básica */}
      <div className="bg-white rounded-xl border border-black/10 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {/* Título */}
            <div className="h-8 bg-black/5 rounded-lg w-96 mb-3" />
            {/* Fecha */}
            <div className="h-5 bg-black/5 rounded w-48" />
          </div>
          {/* Botones */}
          <div className="flex gap-3">
            <div className="h-11 w-32 bg-black/5 rounded-lg" />
            <div className="h-11 w-32 bg-black/5 rounded-lg" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/5 rounded-lg" />
              <div>
                <div className="h-6 bg-black/5 rounded w-16 mb-2" />
                <div className="h-4 bg-black/5 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zona de upload */}
      <div className="bg-white rounded-xl border border-black/10 p-8">
        <div className="h-6 bg-black/5 rounded w-48 mb-6" />
        <div className="h-48 bg-beige/20 rounded-lg border-2 border-dashed border-black/10" />
      </div>

      {/* Grid de fotos */}
      <div className="bg-white rounded-xl border border-black/10 p-8">
        <div className="h-6 bg-black/5 rounded w-32 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-beige/30 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}