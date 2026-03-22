const pulse = "animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]";

export default function Loading() {
  return (
    <main className="min-h-screen bg-black px-7 pb-16 pt-28 text-white lg:px-24 xl:px-32 xl:pt-34 2xl:px-26">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />
      <div className="relative mx-auto max-w-2xl space-y-8">
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />

        <div className={`${pulse} p-5`}>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 animate-pulse rounded-full bg-white/10" />
            <div className="space-y-3">
              <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
              <div className="h-10 w-36 animate-pulse rounded-xl bg-white/10" />
            </div>
          </div>
        </div>

        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`${pulse} p-5`}>
            <div className="mb-4 h-4 w-36 animate-pulse rounded bg-white/10" />
            <div className="space-y-3">
              <div className="h-12 w-full animate-pulse rounded-xl bg-white/10" />
              {index > 2 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="h-16 animate-pulse rounded-xl bg-white/10" />
                  <div className="h-16 animate-pulse rounded-xl bg-white/10" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
