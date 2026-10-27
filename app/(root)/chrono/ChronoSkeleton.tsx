import Skeleton from "@/components/ui/Skeleton";
import { LoadingPage } from "@/components/PageSkeletons";
import ChronoConnector from "./ChronoConnector";
import styles from "./chrono.module.css";

export default function ChronoSkeleton() {
  return (
    <LoadingPage label="Loading chronological story map">
      <section className="page-width relative mx-auto max-w-[1480px]">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex gap-3"><Skeleton className="h-6 w-24 rounded-full" /><Skeleton className="h-4 w-20" /></div>
            <Skeleton className="h-[72px] w-80 max-w-full md:h-10" />
            <Skeleton className="mt-3 h-7 w-72 max-w-full" />
          </div>
          <div className="flex flex-wrap gap-2"><Skeleton className="h-11 w-44 rounded-full" /><Skeleton className="h-11 w-48 rounded-full" /></div>
        </div>
        <div className="chrono-scroll relative overflow-hidden pb-4">
          <div className={styles.track}>
            <div className={styles.row}>
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className={styles.stop}>
                  <div className={`${styles.item} ${index % 2 ? styles.staggered : ""}`}>
                    <div className={`${styles.card} glass-surface rounded-[1.75rem] border border-white/10 bg-white/[0.04]`}>
                      <div className="mb-4 flex items-center justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-8 w-8 rounded-full" /></div>
                      <Skeleton className="aspect-[2/3] w-full rounded-[1.4rem]" />
                      <Skeleton className="mt-4 h-[54px] w-4/5 md:h-[60px]" />
                      <Skeleton className="mt-2 h-5 w-28" />
                      <Skeleton className="mt-3 h-6 w-full" />
                      <Skeleton className="mt-1 h-6 w-4/5" />
                      <Skeleton className="mt-4 h-12 w-full rounded-xl md:hidden" />
                    </div>
                  </div>
                  {index < 3 && <ChronoConnector descending={index % 2 === 0} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LoadingPage>
  );
}
