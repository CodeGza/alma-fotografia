export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Campos del formulario */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}

          {/* Área de subida */}
          <div className="h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 animate-pulse" />

          {/* Botón */}
          <div className="h-12 bg-[#8B5E3C]/20 rounded-lg animate-pulse w-40" />
        </div>
      </div>
    </div>
  );
}
