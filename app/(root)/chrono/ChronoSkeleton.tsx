import Skeleton from "@/components/ui/Skeleton";
import { LoadingPage } from "@/components/PageSkeletons";

export default function ChronoSkeleton() {
  return (
    <LoadingPage label="Loading chronological story map">
      <section className="page-width relative mx-auto max-w-[1480px]">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex gap-3"><Skeleton className="h-6 w-24 rounded-full" /><Skeleton className="h-4 w-20" /></div>
            <Skeleton className="h-9 w-80 max-w-full md:h-10" />
            <Skeleton className="mt-3 h-7 w-72 max-w-full" />
          </div>
          <div className="flex flex-wrap gap-2"><Skeleton className="h-11 w-44 rounded-full" /><Skeleton className="h-11 w-48 rounded-full" /></div>
        </div>
        <div className="chrono-scroll relative overflow-hidden pb-4">
          <div className="relative min-w-max px-2 py-4 md:px-4 md:pb-36 md:pt-8">
            <div className="absolute inset-x-0 top-[8.2rem] h-px bg-red-400/20" />
            <div className="flex min-w-max items-start gap-4 md:gap-0">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-start md:items-stretch">
                  <div className={`w-[230px] shrink-0 md:w-[280px] ${index % 2 ? "md:translate-y-28" : ""}`}>
                    <div className="glass-surface rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="mb-4 flex items-center justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-8 w-8 rounded-full" /></div>
                      <Skeleton className="aspect-[2/3] w-full rounded-[1.4rem]" />
                      <Skeleton className="mt-4 h-7 w-4/5" />
                      <Skeleton className="mt-2 h-5 w-28" />
                      <Skeleton className="mt-3 h-6 w-full" />
                      <Skeleton className="mt-1 h-6 w-4/5" />
                      <Skeleton className="mt-4 h-12 w-full rounded-xl md:hidden" />
                    </div>
                  </div>
                  <div className="relative w-24 shrink-0"><div className="absolute top-[8.15rem] h-px w-24 bg-red-400/20" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LoadingPage>
  );
}
