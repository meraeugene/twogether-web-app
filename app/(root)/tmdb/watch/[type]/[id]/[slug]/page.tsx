import { getCurrentUser } from "@/actions/authActions";
import TMDBWatchPage from "./TMDBWatchPage";
import { hasUserRecommendedFilm } from "@/actions/recommendationActions";
import { checkIfInWatchlist } from "@/actions/watchlistActions";
import { Metadata } from "next";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Dynamically generate metadata (for SEO and social sharing)
 */
export async function generateMetadata({
  params,
}: {
  params: { type: string; id: string };
}): Promise<Metadata> {
  try {
    const res = await fetch(
      `${BASE_URL}/${params.type}/${params.id}?api_key=${API_KEY}`
    );
    if (!res.ok) throw new Error("Failed to fetch TMDB data");

    const details = await res.json();
    const title = details.title || details.name || "Watch";
    const overview = details.overview ?? "";
    const poster = details.poster_path
      ? `https://image.tmdb.org/t/p/w780${details.poster_path}`
      : "/thumbnail-new.png";

    return {
      title: `${title} | Twogether - Watch & Recommend Movies Socially`,
      description: overview,
      openGraph: {
        title,
        description: overview,
        images: [poster],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: overview,
        images: [poster],
      },
    };
  } catch {
    return {
      title: "Twogether | Watch & Recommend Movies Socially",
      description:
        "Stream and recommend movies with friends. Twogether is your cozy social movie space to discover what couples and friends are watching together.",
    };
  }
}

/**
 * 🔹 Page component
 */
const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
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

export default Page;
