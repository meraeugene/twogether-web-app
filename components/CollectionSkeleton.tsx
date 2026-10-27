import Skeleton from "@/components/ui/Skeleton";

export default function CollectionSkeleton() {
  return (
    <article aria-hidden="true" className="glass-surface mobile-collection mobile-bleed relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0c] shadow-[0_28px_90px_rgba(0,0,0,.24)]">
      <div className="grid lg:min-h-[310px] lg:grid-cols-[35%_1fr]">
        <Skeleton className="min-h-[230px] rounded-none lg:min-h-full" />
        <div className="mobile-collection-body flex min-w-0 flex-col justify-between gap-7 p-5 sm:p-7 sm:pb-5 lg:p-8 lg:pb-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1"><Skeleton className="h-8 w-4/5 sm:h-9" /><Skeleton className="mt-2 h-5 w-36" /></div>
            <Skeleton className="h-12 w-60 max-w-full shrink-0 rounded-xl" />
          </div>
          <div className="min-w-0">
            <Skeleton className="h-4 w-28" /><Skeleton className="mt-1 h-4 w-40 sm:hidden" />
            <div className="-mx-2 mt-2 flex min-w-0 gap-2 overflow-hidden px-2 pb-1 pt-3">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="w-[112px] shrink-0 p-2 sm:w-[124px] xl:w-[calc((100%-2rem)/5)]">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" /><Skeleton className="mt-2 h-5 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
