"use client";

import { useTMDBWatch } from "@/stores/useTMDBWatch";
import WatchPlayer from "@/app/(user)/watch/[id]/[movieTitle]/WatchPlayer";
import WatchGemeni from "@/app/(user)/watch/[id]/[movieTitle]/WatchGemeni";
import ErrorMessage from "@/components/ErrorMessage";
import { useEffect, useState } from "react";
import WatchSkeletonLoading from "@/components/WatchSkeletonLoading";
import { CurrentUser } from "@/types/user";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TMDBWatchPage({
  currentUser,
}: {
  currentUser: CurrentUser | null;
}) {
  const router = useRouter();

  const recommendation = useTMDBWatch((s) => s.currentTMDB);

  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);

  if (!hasHydrated) return <WatchSkeletonLoading />;

  if (!recommendation) {
    return (
      <ErrorMessage
        title="AI Recommendation not found"
        message="We could not find the movie you selected. Try searching again."
      />
    );
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 xl:pt-34 text-white">
      <button
        onClick={() => router.back()}
        className="inline-flex w-12 h-8 lg:hidden items-center justify-center rounded-md bg-white text-red-600 hover:bg-red-600 hover:text-white transition mb-6"
      >
        <ArrowLeft size={20} />
      </button>

      <WatchPlayer
        urls={
          Array.isArray(recommendation.stream_url)
            ? recommendation.stream_url
            : [recommendation.stream_url]
        }
        type={recommendation.type}
        episodeTitlesPerSeason={
          recommendation.episode_titles_per_season
            ? Object.fromEntries(
                Object.entries(recommendation.episode_titles_per_season).map(
                  ([season, episodes]) => [
                    Number(season),
                    episodes.map((ep) => ep.title),
                  ]
                )
              )
            : undefined
        }
      />

      <div className="mt-8 space-y-5 font-[family-name:var(--font-geist-mono)] text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex justify-between w-full flex-wrap gap-4 flex-col md:flex-row  lg:items-center">
            <h1 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-geist-sans)] leading-tight">
              {recommendation.title}
            </h1>
          </div>
        </div>

        {recommendation.synopsis && (
          <p className="text-sm md:text-base text-white/70 max-w-3xl leading-relaxed font-[family-name:var(--font-geist-sans)]">
            {recommendation.synopsis}
          </p>
        )}

        <div className="text-white/60 text-xs md:text-sm">
          {recommendation.year} · {recommendation.duration}m ·{" "}
          <span className="uppercase">{recommendation.type}</span>
        </div>

        {recommendation.genres?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recommendation.genres.map((g) => (
              <span
                key={g}
                className="bg-white/10 px-2 py-1 text-[11px] md:text-xs rounded"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      <WatchGemeni title={recommendation.title} currentUser={currentUser} />
    </main>
  );
}
