const AddFriendSkeleton = () => {
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-black border border-white/10 px-4 py-4 rounded-md shadow-sm flex flex-col sm:flex-row flex-wrap  sm:items-center sm:justify-between  gap-4 animate-pulse"
        >
          {/* Avatar + Name Skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-3 w-20 bg-white/10 rounded" />
            </div>
          </div>

          {/* Buttons Skeleton (2 buttons) */}
          <div className="flex gap-3 items-center md:ml-auto">
            <div className="h-8 w-full md:w-32 bg-white/10 rounded-md" />
            <div className="h-8 w-full md:w-32 bg-white/10 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddFriendSkeleton;
