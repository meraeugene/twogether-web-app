const MyRecommendationSkeleton = () => {
  return (
    <main className="min-h-screen px-15 pt-28 pb-16 bg-black text-white font-[family-name:var(--font-geist-sans)]">
      <div className="mb-6">
        <div className="h-7 w-108 bg-white/10 rounded mb-6 animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded mb-7 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white/10 rounded-lg overflow-hidden aspect-[2/3]"
          >
            <div className="w-full h-full bg-white/10 rounded-lg" />
          </div>
        ))}
      </div>
    </main>
  );
};

export default MyRecommendationSkeleton;
