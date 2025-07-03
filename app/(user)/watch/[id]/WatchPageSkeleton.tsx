const WatchPageSkeleton = () => {
  return (
    <main>
      <div className="flex flex-col lg:flex-row gap-10 animate-pulse">
        <div className="flex-1 ">
          <div className="w-full aspect-video bg-white/10 rounded-lg" />

          <div className="flex justify-between items-center gap-8 mt-12">
            <div className="h-10 w-[60%] bg-white/10 rounded-lg" />
            <div className="h-10 w-[13%] bg-white/10 rounded-lg" />
          </div>

          <div className="h-4 w-[10%] bg-white/10 rounded-sm mt-6" />
          <div className="h-5 w-[55%] bg-white/10 rounded-sm mt-3" />
          <div className="h-6 w-[40%] bg-white/10 rounded-sm mt-4" />
          <div className="h-5 w-[15%] bg-white/10 rounded-sm mt-4" />
        </div>
        <div className="w-full lg:w-[10%] space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <div className="h-[270px] bg-white/10 rounded-lg" />
              <div className="h-4 bg-white/10  rounded-sm mt-3" />
              <div className="flex justify-between items-center gap-4">
                <div className="h-3 bg-white/10 w-[35%]  rounded-sm mt-2" />
                <div className="h-3 bg-white/10 w-[20%] rounded-sm mt-2" />
              </div>
              <div className="h-3 bg-white/10 w-[80%] rounded-sm mt-2" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default WatchPageSkeleton;
