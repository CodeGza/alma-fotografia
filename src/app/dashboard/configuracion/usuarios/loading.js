export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Tabla skeleton */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="flex gap-4 p-4 border-b border-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              ))}
            </div>
            {/* Rows */}
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="flex gap-4 p-4 border-b border-gray-100">
                {[1, 2, 3, 4, 5].map((col) => (
                  <div key={col} className="h-5 bg-gray-100 rounded w-24 animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
