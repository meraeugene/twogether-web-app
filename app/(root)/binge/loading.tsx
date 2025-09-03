const loading = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col  lg:px-24 xl:px-32 2xl:px-26 xl:pt-34 px-7 pt-28  pb-16 text-white">
      <div className="h-4 w-[30%] bg-white/10 rounded mb-6 animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`skeleton-section-${i}`}>
          <div className="h-8 w-72 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5 gap-8">
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={`skeleton-card-${i}-${j}`}
                className="aspect-[2/3] w-full rounded-md bg-white/10 animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default loading;
