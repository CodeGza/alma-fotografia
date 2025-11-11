/**
 * GalleryGridSkeleton - Loading state para el grid de galerías
 * 
 * Diseño coherente:
 * - Fondo oscuro #2d2d2d
 * - Animación pulse
 */
export default function GalleryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* CreateGalleryCard skeleton */}
      <div className="bg-[#2d2d2d] rounded-xl overflow-hidden border-2 border-dashed border-[#79502A]/20 h-[400px] animate-pulse">
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-24 h-24 bg-white/10 rounded-full" />
          <div className="w-48 h-6 bg-white/10 rounded" />
          <div className="w-64 h-4 bg-white/10 rounded" />
          <div className="w-32 h-10 bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* GalleryCard skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-[#2d2d2d] rounded-xl overflow-hidden animate-pulse">
          {/* Imagen skeleton */}
          <div className="w-full aspect-[4/3] bg-gray-800" />
          
          {/* Contenido skeleton */}
          <div className="p-4 space-y-4">
            {/* Título */}
            <div className="h-6 bg-white/10 rounded w-3/4" />
            
            {/* Metadata */}
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-1/2" />
              <div className="h-4 bg-white/10 rounded w-2/3" />
            </div>

            {/* Estadísticas */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded" />
                <div className="space-y-1">
                  <div className="h-4 w-8 bg-white/10 rounded" />
                  <div className="h-3 w-12 bg-white/10 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded" />
                <div className="space-y-1">
                  <div className="h-4 w-8 bg-white/10 rounded" />
                  <div className="h-3 w-12 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}