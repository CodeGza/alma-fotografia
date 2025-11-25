export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 bg-gray-200 rounded w-40 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-56 animate-pulse" />
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32" />
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-48" />
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-32" />
        </div>

        {/* Grid de galerías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
