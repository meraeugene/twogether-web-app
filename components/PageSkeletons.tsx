import type { ReactNode } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { FilmCardSkeleton } from "@/components/FilmGridSkeleton";
import { cn } from "@/utils/cn";

export function LoadingPage({ children, label, centered = false, className }: { children: ReactNode; label: string; centered?: boolean; className?: string }) {
  return (
    <main aria-busy="true" className={cn("page-gutter relative min-h-screen bg-black px-7 pb-16 pt-28 font-[family-name:var(--font-geist-sans)] text-white", centered ? "flex flex-col items-center justify-center" : "page-listing", className)}>
      <div className="pointer-events-none absolute inset-0 page-ambient" />
      <span role="status" className="sr-only">{label}</span>
      <div aria-hidden="true" className="relative w-full">{children}</div>
    </main>
  );
}

export function TabsSkeleton({ count = 4 }: { count?: number }) {
  return <div className="relative mx-auto mt-6 flex w-fit max-w-full overflow-hidden border-b border-white/10">{Array.from({ length: count }, (_, index) => <div key={index} className="shrink-0 px-4 py-3 sm:px-6"><Skeleton className="h-5 w-14" /></div>)}</div>;
}

export function FriendCardsSkeleton() {
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => (
    <div key={index} className="glass-surface rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-5 flex items-start gap-4"><Skeleton className="h-12 w-12 shrink-0 rounded-full" /><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-5 w-1/2" /></div></div>
      <div className="flex flex-wrap justify-end gap-2"><Skeleton className="h-7 w-20 rounded-full" /><Skeleton className="h-7 w-28 rounded-full" /></div>
    </div>
  ))}</div>;
}

export function FriendsPageSkeleton() {
  return <LoadingPage label="Loading friends">
    <Skeleton className="mobile-banner mobile-bleed relative aspect-[3/1] w-full max-h-[500px] rounded-3xl sm:aspect-[5/2] md:aspect-[16/5] lg:aspect-[16/4] xl:max-h-[200px] xl:aspect-[16/3]" />
    <TabsSkeleton count={3} />
    <div className="py-8"><div className="mx-auto mb-4 w-full lg:max-w-4xl"><Skeleton className="h-10 w-full rounded-md" /></div><FriendCardsSkeleton /></div>
  </LoadingPage>;
}

export function ThreadListSkeleton() {
  return <div className="space-y-2 border-t border-white/10 p-4">{Array.from({ length: 6 }, (_, index) => (
    <div key={index} className="flex items-center gap-3 rounded-xl p-2"><Skeleton className="h-11 w-11 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-3/4" /></div><Skeleton className="h-3 w-6" /></div>
  ))}</div>;
}

export function MessagesPageSkeleton() {
  return <LoadingPage label="Loading chats">
    <h1 className="relative mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">Chats</h1>
    <div className="glass-surface mobile-chat mobile-bleed relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 lg:grid lg:min-h-[520px] lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="bg-black/20 lg:border-r lg:border-white/10">
        <div className="grid grid-cols-2 border-b border-white/10">{[0, 1].map(index => <div key={index} className="border-white/10 px-2 py-4 first:border-r"><Skeleton className="mx-auto mb-2 h-4 w-20" /><div className="flex gap-2"><Skeleton className="h-7 w-full rounded-full" /><Skeleton className="h-7 w-full rounded-full" /></div></div>)}</div>
        <ThreadListSkeleton />
      </div>
      <div className="hidden min-h-[360px] flex-col items-center justify-center gap-4 bg-black/10 px-6 py-12 lg:flex"><Skeleton className="h-9 w-9" /><Skeleton className="h-6 w-44" /><Skeleton className="h-5 w-64 max-w-full" /></div>
    </div>
  </LoadingPage>;
}

function ProfileInfoSkeleton() {
  return (
    <div className="glass-surface flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
      <Skeleton className="mt-1 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-28 max-w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return <LoadingPage label="Loading profile">
    <div className="mobile-banner mobile-bleed relative flex h-80 w-full flex-col items-center justify-center overflow-hidden rounded-md bg-white/[0.04] px-2 sm:h-96 md:h-[20rem]">
      <Skeleton className="h-21 w-21 rounded-full" /><Skeleton className="mt-4 h-8 w-48" /><Skeleton className="mt-1 h-6 w-28" /><Skeleton className="mt-1 h-5 w-40" /><Skeleton className="mt-5 h-10 w-36 rounded-xl" />
    </div>
    <TabsSkeleton />
    <div className="py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6"><ProfileInfoSkeleton /></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => <ProfileInfoSkeleton key={index} />)}
        </div>
      </div>
    </div>
  </LoadingPage>;
}

export function EditProfilePageSkeleton() {
  return <LoadingPage label="Loading profile settings"><div className="mx-auto max-w-2xl space-y-8">
    <h2 className="text-2xl font-semibold">Edit Profile</h2>
    <div><Skeleton className="mb-2 h-5 w-28" /><div className="flex items-center gap-4"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-9 w-36 rounded-md" /></div></div>
    {Array.from({ length: 5 }, (_, index) => <div key={index}><Skeleton className="mb-3 h-5 w-28" /><Skeleton className={index === 2 ? "h-32 w-full rounded" : "h-12 w-full rounded"} /></div>)}
  </div></LoadingPage>;
}

export function AIRecommendPageSkeleton() {
  return <LoadingPage label="Loading AI recommendations" centered className="md:px-15 md:pt-0 md:pb-0"><div className="mx-auto w-full max-w-xl text-center">
    <Skeleton className="mx-auto h-44 w-44 rounded-full" /><Skeleton className="mx-auto mb-6 h-9 w-64 max-w-full" /><Skeleton className="h-[58px] w-full rounded-lg" /><div className="mt-6 rounded-xl border border-white/10 bg-white/10 p-2"><Skeleton className="h-12 w-full rounded-xl" /></div>
  </div></LoadingPage>;
}

export function RecommendPageSkeleton() {
  return <LoadingPage label="Loading recommendation form" centered className="lg:pt-32"><div className="mx-auto w-full max-w-lg text-center">
    <div className="mb-8 flex flex-wrap justify-center gap-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-7 w-20 rounded" />)}</div>
    <Skeleton className="mx-auto mb-2 h-9 w-80 max-w-full" /><Skeleton className="mx-auto mb-4 h-6 w-24" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="mt-6 h-14 w-full rounded-xl" />
  </div></LoadingPage>;
}

export function MyRecommendationsPageSkeleton() {
  return <LoadingPage label="Loading your recommendations">
    <h1 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">Your Recommendations</h1>
    <p className="mb-8 text-sm leading-6 text-white/55">Here are the movies and shows you&apos;ve recommended.</p>
    {["Public", "Private"].map(title => <section key={title} className="mb-12"><h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Skeleton className="h-4 w-4" />{title}</h2><div className="media-grid grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <FilmCardSkeleton key={index} />)}</div></section>)}
  </LoadingPage>;
}
