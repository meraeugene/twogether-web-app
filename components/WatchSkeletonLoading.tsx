"use client";

const pulse =
  "animate-pulse rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03]";

const WatchSkeletonLoading = () => {
  return (
    <main className="relative min-h-screen bg-black px-7 pb-16 pt-28 text-white lg:px-24 xl:px-32 xl:pt-34 2xl:px-26">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <div className="relative space-y-8">
        <div className="h-9 w-14 animate-pulse rounded-md bg-white/10" />

        <section className={`${pulse} aspect-video w-full`} />

        <section className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <div className={`${pulse} h-10 w-40`} />
            <div className={`${pulse} h-10 w-44`} />
          </div>

          <div className="h-11 w-[85%] max-w-3xl animate-pulse rounded-lg bg-white/10" />

          <div className="space-y-3">
            <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-white/10" />
            <div className="h-4 w-[92%] max-w-3xl animate-pulse rounded bg-white/10" />
            <div className="h-4 w-[68%] max-w-2xl animate-pulse rounded bg-white/10" />
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`${pulse} h-7 w-20 rounded-full`} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={`${pulse} h-40`} />
          <div className={`${pulse} h-40`} />
        </section>

        <section className="space-y-4">
          <div className="h-7 w-56 animate-pulse rounded bg-white/10" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className={`${pulse} aspect-[2/3] w-full`} />
                <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default WatchSkeletonLoading;
