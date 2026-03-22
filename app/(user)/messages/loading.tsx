const pulse = "animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]";

export default function Loading() {
  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-28 text-white lg:px-24 xl:px-32 xl:pt-32 2xl:px-26">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />
      <div className="relative grid overflow-hidden rounded-xl border border-white/10 lg:grid-cols-[400px_1fr]">
        <section className="bg-black/20 lg:border-r lg:border-white/10">
          <div className="grid grid-cols-2 border-b border-white/10">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="space-y-3 border-white/10 px-3 py-4 first:border-r"
              >
                <div className="mx-auto h-3 w-24 animate-pulse rounded bg-white/10" />
                <div className="flex gap-2">
                  <div className="h-9 flex-1 animate-pulse rounded-full bg-white/10" />
                  <div className="h-9 flex-1 animate-pulse rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 p-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`${pulse} flex h-20 items-center gap-3 px-4`}
              >
                <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hidden min-h-[70vh] bg-black/10 lg:block">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
          </div>
          <div className="space-y-4 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div className={`${pulse} h-20 w-full max-w-md`} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
