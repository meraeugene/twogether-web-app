import { FilmCardSkeleton } from "@/components/FilmGridSkeleton";

const pulse =
  "animate-pulse rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03]";

export default function WatchlistSkeletonLoading() {
  return (
    <main className="relative min-h-screen bg-black px-7 pb-16 pt-28 text-white lg:px-24 xl:px-32 xl:pt-32 2xl:px-26">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <div className="relative space-y-6">
        <section className="space-y-3">
          <div className={`${pulse} h-10 w-56`} />
          <div className={`${pulse} h-4 w-full max-w-lg rounded-md`} />
        </section>

        <section className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <FilmCardSkeleton key={index} />
          ))}
        </section>
      </div>
    </main>
  );
}
