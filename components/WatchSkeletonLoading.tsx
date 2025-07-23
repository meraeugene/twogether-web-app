"use client";

const WatchSkeletonLoading = () => {
  return (
    <main className="min-h-screen bg-black flex flex-col  lg:px-24 xl:px-32 2xl:px-26 xl:pt-34 px-7 pt-28  pb-16 text-white">
      <div className="flex flex-col gap-10 animate-pulse">
        <div className="flex-1 ">
          <div className="w-full aspect-video bg-white/10 rounded-lg" />

          <div className="flex items-center mt-7 gap-3">
            <div className="h-10 w-[30%] bg-white/10 rounded-lg" />
            <div className="h-10 w-[30%] bg-white/10 rounded-lg" />
          </div>

          <div className="flex justify-between items-center  gap-8 mt-12">
            <div className="h-10 w-[60%] bg-white/10 rounded-lg" />
            <div className="h-10 w-[40%] bg-white/10 rounded-lg" />
          </div>

          <div className="h-4 w-[10%] bg-white/10 rounded-sm mt-6" />
          <div className="h-5 w-[55%] bg-white/10 rounded-sm mt-3" />
          <div className="h-6 w-[40%] bg-white/10 rounded-sm mt-4" />
          <div className="h-5 w-[15%] bg-white/10 rounded-sm mt-4" />
        </div>
      </div>
    </main>
  );
};

export default WatchSkeletonLoading;
