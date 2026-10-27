import Skeleton from "@/components/ui/Skeleton";

export default function RecommendCardSkeleton() {
  return (
    <div className="rounded-lg py-4 text-left lg:p-2 lg:py-2" aria-hidden="true">
      <Skeleton className="mb-2 aspect-[2/3] w-full rounded" />
      <Skeleton className="h-6 w-4/5" />
      <div className="mt-2 flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-20" /><Skeleton className="h-6 w-12 rounded-sm" />
      </div>
      <Skeleton className="mt-3 h-9 w-full rounded-md lg:hidden" />
    </div>
  );
}
