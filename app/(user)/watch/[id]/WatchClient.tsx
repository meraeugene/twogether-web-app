"use client";

import useSWR from "swr";
import WatchPlayer from "./WatchPlayer";
import WatchInfo from "./WatchInfo";
import WatchComments from "./WatchComments";
import WatchSuggestions from "./WatchSuggestions";
import ErrorMessage from "@/components/ErrorMessage";
import { getRecommendationById } from "@/actions/recommendationActions";
import { getSuggestions } from "@/actions/suggestionsActions";
import { checkIfInWatchlist } from "@/actions/watchlistActions";
import WatchPageSkeleton from "./WatchPageSkeleton";

export default function WatchClient({
  currentUser,
  recommendationId,
}: {
  currentUser: { id: string; username: string };
  recommendationId: string;
}) {
  const { data: recommendation, error: recError } = useSWR(
    ["recommendation", recommendationId],
    () => getRecommendationById(recommendationId)
  );

  const { data: suggestions } = useSWR(
    () =>
      recommendation
        ? ["suggestions", recommendationId, recommendation.genres]
        : null,
    () => getSuggestions(recommendationId, recommendation?.genres || [])
  );

  const { data: watchlistInfo } = useSWR(
    () =>
      recommendation
        ? ["watchlist", recommendation.tmdb_id, currentUser.id]
        : null,
    () => checkIfInWatchlist(recommendation!.tmdb_id, currentUser.id)
  );

  if (recError)
    return (
      <ErrorMessage
        title="Recommendation not found"
        message="The movie or show you are looking for doesn't exist."
      />
    );

  if (!recommendation || !watchlistInfo) {
    return <WatchPageSkeleton />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 space-y-10">
        <WatchPlayer
          urls={
            Array.isArray(recommendation.stream_url)
              ? recommendation.stream_url
              : [recommendation.stream_url]
          }
        />
        <WatchInfo
          id={recommendationId}
          recommendation={recommendation}
          initialInWatchlist={watchlistInfo.inWatchlist}
          initialWatchlistId={watchlistInfo.id}
          currentUserId={currentUser.id}
        />
        <WatchComments
          currentUserId={currentUser.id}
          username={currentUser.username}
          recId={recommendation.recommendation_id}
        />
      </div>

      {suggestions && suggestions.length > 0 && (
        <WatchSuggestions suggestions={suggestions} />
      )}
    </div>
  );
}
