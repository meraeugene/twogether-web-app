import { FilmCardSkeleton } from "@/components/FilmGridSkeleton";
import Skeleton from "@/components/ui/Skeleton";

export default function RowSkeleton({ title }: { title?: string }) {
  return (
    <section className="relative z-10 mb-16">
      <div className="mb-6 flex items-center justify-between">
        {title ? <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2> : <Skeleton className="h-8 w-44 md:h-9" />}
        <div className="flex gap-3">
          <Skeleton className="h-9 w-9 rounded-full md:h-11 md:w-11" />
          <Skeleton className="h-9 w-9 rounded-full md:h-11 md:w-11" />
        </div>
      </div>
      <div className="media-grid grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => <FilmCardSkeleton key={index} />)}
      </div>
      <div className="mt-8 flex justify-center gap-2">
        {["w-6", "w-2", "w-2"].map((width, index) => <Skeleton key={index} className={"h-2 rounded-full " + width} />)}
      </div>
    </section>
  );
}
