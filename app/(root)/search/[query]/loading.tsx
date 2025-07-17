export default function Loading() {
  return (
    <main className="min-h-screen bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)]">
      <div className="mb-6 h-10 w-40 bg-white/10 animate-pulse  lg:hidden rounded" />

      <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">
        Searching...
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5 gap-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] w-full bg-white/10 animate-pulse rounded-lg"
          />
        ))}
      </div>
    </main>
  );
}
