import { getCurrentUser } from "@/actions/authActions";
import WatchPlayer from "./WatchPlayer";
import WatchInfo from "./WatchInfo";
import WatchComments from "./WatchComments";
import WatchSuggestions from "./WatchSuggestions";
import ErrorMessage from "@/components/ErrorMessage";
import { redirect } from "next/navigation";
import { getSuggestions } from "@/actions/suggestionsActions";
import { getRecommendationById } from "@/actions/recommendationActions";
import { checkIfInWatchlist } from "@/actions/watchlistActions";
import WatchGemeni from "./WatchGemeni";
import BackButton from "@/components/BackButton";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const id = (await params).id;

  const [currentUser, recommendation] = await Promise.all([
    getCurrentUser(),
    getRecommendationById(Number(id)),
  ]);

  if (!currentUser) redirect("/");
  if (!recommendation) {
    return <ErrorMessage />;
  }

  const suggestions = await getSuggestions(Number(id), recommendation.genres);

  const { inWatchlist, id: watchListId } = await checkIfInWatchlist(
    recommendation.tmdb_id,
    currentUser.id
  );

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-7  pt-28 pb-16 relative lg:px-24  xl:px-32 2xl:px-26 xl:pt-34 text-white">
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />

      <BackButton />

      <div className="flex flex-col  xl:flex-row  gap-10">
        <div className="flex-1 space-y-10">
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
                    Object.entries(
                      recommendation.episode_titles_per_season
                    ).map(([season, episodes]) => [
                      Number(season),
                      episodes.map((ep) => ep.title),
                    ])
                  )
                : undefined
            }
          />{" "}
          <WatchInfo
            recommendation={recommendation}
            initialInWatchlist={inWatchlist}
            initialWatchlistId={watchListId}
            currentUserId={currentUser.id}
          />
          <WatchComments
            currentUserId={currentUser.id}
            username={currentUser.username}
            recId={recommendation.recommendation_id}
          />
        </div>
        {suggestions && suggestions?.length > 0 && (
          <WatchSuggestions suggestions={suggestions} />
        )}
      </div>

      <WatchGemeni
        currentUserId={currentUser.id}
        title={recommendation.title}
      />
    </main>
  );
}
