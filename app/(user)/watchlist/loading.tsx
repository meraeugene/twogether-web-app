import { FilmCardSkeleton } from "@/components/FilmGridSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 relative xl:pt-32 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />

      <div className="relative z-10">
        <div className="h-8 w-48 rounded bg-white/10 animate-pulse" />
        <div className="mt-4 h-4 w-80 max-w-full rounded bg-white/10 animate-pulse" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 mt-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <FilmCardSkeleton key={`watchlist-skeleton-${idx}`} />
          ))}
        </div>
      </div>
    </main>
  );
}
