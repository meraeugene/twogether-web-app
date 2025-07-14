const RecommendCardSkeleton = () => {
  return (
    <div className="animate-pulse rounded-lg lg:p-2">
      <div className="w-full aspect-[2/3] bg-white/10 rounded mb-3" />
      <div className="h-4 bg-white/10 w-full  mb-2 " />
      <div className="flex justify-between gap-8">
        <div className="h-3 bg-white/10  w-[70%]" />
        <div className="h-3 bg-white/10  w-[30%]" />
      </div>
    </div>
  );
};

export default RecommendCardSkeleton;
