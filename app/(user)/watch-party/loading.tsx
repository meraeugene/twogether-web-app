const pulse = "animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.05]";

export default function WatchPartyLoading() {
  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-32 text-white sm:px-6 lg:px-24 xl:px-32 md:pt-36 2xl:px-26">
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="h-[50%] w-[80%] rounded-full bg-red-900/20 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-10 pb-16">
        <section className={`${pulse} p-5 sm:p-6 md:p-8`}>
          <div className="h-3 w-36 animate-pulse rounded bg-red-500/20" />
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="h-12 w-full max-w-xl animate-pulse rounded-3xl bg-white/10" />
              <div className="h-4 w-full max-w-lg animate-pulse rounded bg-white/10" />
            </div>
            <div className={`${pulse} w-full max-w-xl p-2`}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/10" />
                <div className="h-12 w-32 animate-pulse rounded-xl bg-white/10" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={`${pulse} overflow-hidden`}>
                <div className="aspect-video animate-pulse bg-white/10" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
