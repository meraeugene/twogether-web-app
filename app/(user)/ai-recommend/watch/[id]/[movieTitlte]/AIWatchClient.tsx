"use client";

import { useParams } from "next/navigation";
import { useAIRecommendations } from "@/stores/useAIRecommendation";
import ErrorMessage from "@/components/ErrorMessage";
import WatchSuggestions from "@/app/(user)/watch/[id]/[movieTitle]/WatchSuggestions";
import WatchInfo from "@/app/(user)/watch/[id]/[movieTitle]/WatchInfo";
import WatchGemeni from "@/app/(user)/watch/[id]/[movieTitle]/WatchGemeni";
import WatchPlayer from "@/app/(user)/watch/[id]/[movieTitle]/WatchPlayer";
import { CurrentUser } from "@/types/user";
import { useEffect, useState } from "react";
import WatchSkeletonLoading from "@/components/WatchSkeletonLoading";

export default function AIWatchClient({
  currentUser,
  alreadyRecommended,
  initialInWatchlist,
  initialWatchlistId,
}: {
  currentUser: CurrentUser;
  alreadyRecommended: boolean;
  initialInWatchlist: boolean;
  initialWatchlistId: string | null;
}) {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);

  const params = useParams();
  const tmdbId = params?.id as string;

  const recommendations = useAIRecommendations.getState().recommendations;
  const recommendation = recommendations.find(
    (r) => r.tmdb_id === Number(tmdbId)
  );

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

      <div className="mt-8">
        <WatchInfo
          recommendation={recommendation}
          initialInWatchlist={initialInWatchlist}
          initialWatchlistId={initialWatchlistId}
          isAiRecommendation={recommendation.generated_by_ai}
          currentUserId={currentUser.id}
          alreadyRecommended={alreadyRecommended}
        />
      </div>

      {recommendation.genres?.length > 0 && (
        <WatchSuggestions suggestions={[]} />
      )}

      <WatchGemeni title={recommendation.title} />
    </main>
  );
}
