import FilmGridSkeleton from "@/components/FilmGridSkeleton";
import Skeleton from "@/components/ui/Skeleton";

export default function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black px-6 pb-16 pt-28 text-white lg:px-24 xl:px-32">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-11 w-3/4 max-w-xl rounded-xl" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
          <Skeleton className="h-4 w-2/3 max-w-xl rounded-full" />
        </div>
        <FilmGridSkeleton count={10} showHeader={false} />
      </div>
    </div>
  );
}
