import Skeleton from "@/components/ui/Skeleton";

export default function AddFriendSkeleton() {
  return (
    <div className="my-4 grid grid-cols-1 gap-4 md:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex flex-col flex-wrap gap-4 rounded-md border border-white/10 bg-black px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="space-y-2"><Skeleton className="h-6 w-32" /><Skeleton className="h-5 w-20" /></div>
          </div>
          <div className="flex gap-3 sm:ml-auto"><Skeleton className="h-9 w-20 rounded-md" /><Skeleton className="h-9 w-24 rounded-md" /></div>
        </div>
      ))}
    </div>
  );
}
