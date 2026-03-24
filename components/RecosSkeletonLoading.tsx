const rowHeaderPulse =
  "animate-pulse rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03]";

function RecosRowSkeleton() {
  return (
    <section className="relative z-10 mb-16 space-y-6">
      <div className="flex items-center justify-between">
        <div className={`${rowHeaderPulse} h-9 w-44`} />
        <div className="flex gap-3">
          <div className={`${rowHeaderPulse} h-10 w-10 rounded-full`} />
          <div className={`${rowHeaderPulse} h-10 w-10 rounded-full`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[2/3] w-full animate-pulse rounded-lg bg-white/10"
          />
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={`${rowHeaderPulse} h-2 rounded-full ${
              index === 0 ? "w-6" : "w-2"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default function RecosSkeletonLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-7 pb-16 pt-28 lg:px-24 xl:px-32 xl:pt-32 2xl:px-26">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <RecosRowSkeleton />
      <RecosRowSkeleton />
      <RecosRowSkeleton />
    </main>
  );
}
