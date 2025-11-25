export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Horarios de trabajo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tipos de reserva */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-56 animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
