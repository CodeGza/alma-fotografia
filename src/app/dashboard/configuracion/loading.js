export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded w-40 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-56 animate-pulse" />
          </div>
        </div>

        {/* Grid de opciones de configuración */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
