const loading = () => {
  return (
    <main className="min-h-screen px-7  pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 bg-black text-white">
      <div className="mb-6">
        <div className="h-7 w-1/3 bg-white/10 rounded mb-6 animate-pulse" />
        <div className="h-4 w-1/4 bg-white/5 rounded mb-7 animate-pulse" />
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

export default loading;
