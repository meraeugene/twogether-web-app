import { getCurrentUser } from "@/actions/authActions";
import AIWatchClient from "./AIWatchClient";
import { redirect } from "next/navigation";
import { hasUserRecommendedFilm } from "@/actions/recommendationActions";
import { checkIfInWatchlist } from "@/actions/watchlistActions";

export default async function AIWatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tmdbId = (await params).id;

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/");

  const hasRecommended = await hasUserRecommendedFilm(
    currentUser.id,
    Number(tmdbId)
  );

  const { inWatchlist, id: watchListId } = await checkIfInWatchlist(
    Number(tmdbId),
    currentUser.id
  );

  return (
    <AIWatchClient
      currentUserId={currentUser.id}
      alreadyRecommended={hasRecommended}
      initialInWatchlist={inWatchlist}
      initialWatchlistId={watchListId}
    />
  );
}
