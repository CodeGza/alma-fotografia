/**
 * GalleryGridSkeleton - Skeleton para el grid de galerías
 * 
 * Se muestra mientras cargan los datos reales.
 * Diseñado para ser visualmente similar al contenido final.
 */
export default function GalleryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white border border-black/10 rounded-2xl overflow-hidden animate-pulse"
        >
          {/* Imagen placeholder */}
          <div className="w-full aspect-[4/3] bg-beige/30" />
          
          {/* Contenido placeholder */}
          <div className="p-6">
            {/* Título */}
            <div className="h-7 bg-black/10 rounded-lg mb-4 w-3/4" />
            
            {/* Detalles */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-black/5 rounded w-full" />
              <div className="h-4 bg-black/5 rounded w-2/3" />
              <div className="h-4 bg-black/5 rounded w-1/2" />
              <div className="h-4 bg-black/5 rounded w-1/3" />
            </div>
            
            {/* Botón */}
            <div className="h-10 bg-black/5 rounded-lg w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}