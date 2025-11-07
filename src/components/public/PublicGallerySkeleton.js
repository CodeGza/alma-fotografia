/**
 * PublicGallerySkeleton - Skeleton loader para galería pública
 * 
 * Por qué necesario:
 * - Mejora percepción de velocidad (usuario ve algo inmediatamente)
 * - Reduce bounce rate (usuarios no abandonan por pantalla en blanco)
 * - Coherente con diseño final (mismo layout)
 */
export default function PublicGallerySkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header skeleton */}
      <header className="border-b border-black/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Título */}
              <div className="h-10 bg-black/5 rounded-lg w-64 mb-3" />
              {/* Fecha */}
              <div className="h-5 bg-black/5 rounded w-48" />
            </div>
            {/* Botón */}
            <div className="h-11 w-40 bg-black/5 rounded-lg" />
          </div>

          {/* Contador de fotos */}
          <div className="mt-6 flex items-center gap-2">
            <div className="h-4 w-4 bg-black/5 rounded" />
            <div className="h-4 w-20 bg-black/5 rounded" />
          </div>
        </div>
      </header>

      {/* Grid skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Generamos 12 placeholders */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-beige/30 rounded-lg"
              style={{
                // Por qué delay escalonado: efecto visual más agradable
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}