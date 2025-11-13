export default function NotificationSettingsSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Email notifications skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />

        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* In-app notifications skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />

        <div className="flex items-center gap-3 pt-4">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* Botón guardar skeleton */}
      <div className="flex justify-end">
        <div className="h-12 w-40 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
