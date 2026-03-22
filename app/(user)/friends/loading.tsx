const pulse = "animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]";

export default function Loading() {
  return (
    <main className="min-h-screen bg-black px-7 pb-16 pt-28 text-white lg:px-24 xl:px-32 xl:pt-32 2xl:px-26">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />
      <div className="relative mx-auto max-w-6xl space-y-8">
        <div className={`${pulse} aspect-[16/4] w-full rounded-3xl`} />

        <div className="mx-auto flex w-fit gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-28 animate-pulse rounded-full bg-white/10"
            />
          ))}
        </div>

        <div className={`${pulse} mx-auto h-32 max-w-4xl`} />

        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${pulse} h-40`} />
          ))}
        </div>
      </div>
    </main>
  );
}
