export default function Loading() {
  return (
    <main className="min-h-screen bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white relative font-(family-name:--font-geist-sans)">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <div className="relative">
        <div className="mb-6 h-10 w-14 animate-pulse rounded-md bg-white/10" />

        <div className="mx-auto mb-8 h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-white/10" />

        <div className="mb-6 h-8 w-72 max-w-full animate-pulse rounded-md bg-white/10" />

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-2/3 w-full animate-pulse rounded-lg bg-white/10" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
