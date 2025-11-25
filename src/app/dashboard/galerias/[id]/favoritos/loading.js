export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-56 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24" />
        </div>

        {/* Tabla de favoritos */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="w-16 h-16 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
