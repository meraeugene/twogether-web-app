export default function FriendsPageLoading() {
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black text-white px-4 sm:px-15 pt-28 pb-16">
      {/* Hero Banner Skeleton */}
      <div className="relative w-full h-70 border border-gray-900 rounded-xl overflow-hidden animate-pulse bg-white/5 mb-6" />

      {/* Tabs Skeleton */}
      <div className="flex justify-center border-b border-white/10 sticky top-0 z-20 bg-black/90 mb-8">
        {["Friends", "Requests", "Sent"].map((tab, i) => (
          <div
            key={i}
            className="px-6 py-3 text-sm font-medium text-white/40 border-b-2 border-transparent"
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Cards Grid Skeleton */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white/5 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/20 rounded w-2/3" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
