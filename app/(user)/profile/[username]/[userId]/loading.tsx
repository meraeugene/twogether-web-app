const pulse = "animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]";

export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-black px-7 pb-16 pt-28 text-white lg:px-24 xl:px-32 xl:pt-32 2xl:px-26">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />
      <div className="relative space-y-8">
        <section className="relative h-80 overflow-hidden rounded-md border border-white/10 bg-white/[0.04] sm:h-96 md:h-[20rem]">
          <div className="absolute inset-0 animate-pulse bg-white/10" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4">
            <div className="h-24 w-24 animate-pulse rounded-full bg-white/15" />
            <div className="h-7 w-44 animate-pulse rounded bg-white/15" />
            <div className="h-4 w-28 animate-pulse rounded bg-red-500/20" />
            <div className="flex gap-3">
              <div className="h-10 w-32 animate-pulse rounded-full bg-white/15" />
              <div className="h-10 w-32 animate-pulse rounded-full bg-white/15" />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-center border-b border-white/10 bg-black/90">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-12 w-32 animate-pulse rounded-t-xl bg-white/10 px-6 py-3"
            />
          ))}
        </div>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className={`${pulse} h-40`} />
            <div className={`${pulse} h-48`} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={`${pulse} h-72`} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
