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

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const id = (await params).id;

  const [currentUser, recommendation] = await Promise.all([
    getCurrentUser(),
    getRecommendationById(id),
  ]);

  if (!currentUser) redirect("/");
  if (!recommendation) {
    return (
      <ErrorMessage
        title="Recommendation not found"
        message="The movie or show you are looking for doesn't exist."
      />
    );
  }

  const suggestions = await getSuggestions(id, recommendation.genres);
  const { inWatchlist, id: watchListId } = await checkIfInWatchlist(
    recommendation.tmdb_id,
    currentUser.id
  );

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-15 pt-28 pb-16 text-white">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-10">
          <WatchPlayer
            urls={
              Array.isArray(recommendation.stream_url)
                ? recommendation.stream_url
                : [recommendation.stream_url]
            }
          />{" "}
          <WatchInfo
            id={id}
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
    </main>
  );
}
