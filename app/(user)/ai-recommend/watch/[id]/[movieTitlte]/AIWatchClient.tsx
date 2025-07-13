"use client";

import { useParams } from "next/navigation";
import { useAIRecommendations } from "@/stores/useAIRecommendation";
import ErrorMessage from "@/components/ErrorMessage";
import WatchSuggestions from "@/app/(user)/watch/[id]/WatchSuggestions";
import WatchInfo from "@/app/(user)/watch/[id]/WatchInfo";
import WatchGemeni from "@/app/(user)/watch/[id]/WatchGemeni";
import WatchPlayer from "@/app/(user)/watch/[id]/WatchPlayer";

export default function AIWatchClient() {
  const params = useParams();
  const id = params?.id as string;

  const recommendations = useAIRecommendations.getState().recommendations;
  const recommendation = recommendations.find(
    (r) => r.recommendation_id === id
  );

  if (!recommendation) {
    return (
      <ErrorMessage
        title="AI Recommendation not found"
        message="We could not find the movie you selected. Try searching again."
      />
    );
  }

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-15 pt-28 pb-16 lg:px-24 xl:px-32 2xl:px-26 xl:pt-34 text-white">
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
          id={recommendation.id}
          recommendation={recommendation}
          initialInWatchlist={false}
          initialWatchlistId={null}
          isAiRecommendation={recommendation.generated_by_ai}
        />
      </div>

      {recommendation.genres?.length > 0 && (
        <WatchSuggestions suggestions={[]} />
      )}

      <WatchGemeni title={recommendation.title} />
    </main>
  );
}
