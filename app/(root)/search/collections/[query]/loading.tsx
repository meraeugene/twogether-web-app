export default function Loading() {
  return (
    <main className="page-gutter page-listing min-h-screen bg-black pb-16 pt-28 px-7 text-white font-[family-name:var(--font-geist-sans)]">
      <div className="space-y-16">
        {[...Array(3)].map((_, index) => (
          <section key={index}>
            <div className="h-8 w-72 bg-white/10 rounded mb-6 animate-pulse" />

            {/* FilmCard Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] w-full bg-white/10 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
