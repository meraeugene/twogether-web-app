const Loading = () => {
  return (
    <main className="min-h-screen bg-black flex flex-col  lg:px-24 xl:px-32 2xl:px-26 xl:pt-34 px-7 pt-28  pb-16 text-white">
      <div className="relative flex flex-col gap-8 overflow-hidden">
        <div
          className="absolute inset-0 -translate-x-full 
                        bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />

        {/* Video/Poster Placeholder */}
        <div className="w-full aspect-video bg-white/10 rounded-lg relative z-10" />

        {/* Buttons / Tags (3 buttons fixed) */}
        <div className="flex flex-wrap items-center mt-4 gap-3 relative z-10">
          <div className="h-10 w-[40%] sm:w-[25%] md:w-[20%] bg-white/10 rounded-lg" />
          <div className="h-10 w-[40%] sm:w-[25%] md:w-[20%] bg-white/10 rounded-lg" />
          <div className="h-10 w-[40%] sm:w-[25%] md:w-[20%] bg-white/10 rounded-lg" />
        </div>

        {/* Title + Action */}
        <div className="h-10 w-[80%] sm:w-[60%] bg-white/10 rounded-lg" />

        {/* Text Lines */}
        <div className="flex flex-col gap-3 mt-2 relative z-10">
          <div className="h-4 w-[25%] sm:w-[15%] bg-white/10 rounded-sm" />
          <div className="h-5 w-[90%] sm:w-[70%] bg-white/10 rounded-sm" />
          <div className="h-5 w-[85%] sm:w-[65%] bg-white/10 rounded-sm" />
          <div className="h-5 w-[75%] sm:w-[55%] bg-white/10 rounded-sm" />
          <div className="h-5 w-[65%] sm:w-[45%] bg-white/10 rounded-sm" />
          <div className="h-5 w-[40%] sm:w-[25%] bg-white/10 rounded-sm" />
        </div>
      </div>
    </main>
  );
};

export default Loading;
