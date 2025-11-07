export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="h-10 bg-black/5 rounded-lg w-64 mb-4 animate-pulse" />
          <div className="h-5 bg-black/5 rounded w-48 animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-square bg-beige/30 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}