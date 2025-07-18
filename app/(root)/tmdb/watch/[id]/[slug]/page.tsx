import { getCurrentUser } from "@/actions/authActions";
import TMDBWatchPage from "./TMDBWatchPage";
import { hasUserRecommendedFilm } from "@/actions/recommendationActions";
import { checkIfInWatchlist } from "@/actions/watchlistActions";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const tmdbId = (await params).id;
  const currentUser = await getCurrentUser();

  let hasRecommended = false;
  let inWatchlist = false;
  let watchListId = null;

  if (currentUser?.id) {
    const [recommendResult, watchlistResult] = await Promise.all([
      hasUserRecommendedFilm(currentUser.id, Number(tmdbId)),
      checkIfInWatchlist(Number(tmdbId), currentUser.id),
    ]);

    hasRecommended = recommendResult;
    inWatchlist = watchlistResult.inWatchlist;
    watchListId = watchlistResult.id;
  }

  return (
    <TMDBWatchPage
      currentUserId={currentUser?.id}
      alreadyRecommended={hasRecommended}
      initialInWatchlist={inWatchlist}
      initialWatchlistId={watchListId}
      isTMDBRecommendation={true}
    />
  );
};

export default page;
