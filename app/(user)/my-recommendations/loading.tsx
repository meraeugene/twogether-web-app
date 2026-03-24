import { FilmCardSkeleton } from "@/components/FilmGridSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen relative bg-black px-7 pt-28 pb-16 text-white font-[family-name:var(--font-geist-sans)] lg:px-24 xl:px-32 2xl:px-26 xl:pt-32">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />

      <div className="relative z-10">
        <div className="h-8 w-64 rounded bg-white/10 animate-pulse" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/10 animate-pulse" />

        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <FilmCardSkeleton key={`recommendation-skeleton-${idx}`} />
          ))}
        </div>
      </div>
    </main>
  );
}
