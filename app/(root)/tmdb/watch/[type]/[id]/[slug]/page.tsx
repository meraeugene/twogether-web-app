import { getCurrentUser } from "@/actions/authActions";
import TMDBWatchPage from "./TMDBWatchPage";
import { hasUserRecommendedFilm } from "@/actions/recommendationActions";
import { checkIfInWatchlist } from "@/actions/watchlistActions";
import { Metadata } from "next";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
  const { id, type } = await params;

  try {
    // Fetch movie/TV details
    const [detailsRes, videosRes] = await Promise.all([
      fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`),
    ]);

    const details = await detailsRes.json();
    const videos = await videosRes.json();

    const title = details.title || details.name || "Watch";
    const overview = details.overview ?? "";

    // Try to find a YouTube trailer
    const trailer = videos.results?.find(
      (v: { type: string; site: string; key: string }) =>
        v.type === "Trailer" && v.site === "YouTube"
    );

    // If found, use the YouTube thumbnail
    const trailerThumbnail = trailer
      ? `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`
      : null;

    // Fallbacks
    const poster =
      trailerThumbnail ||
      (details.backdrop_path
        ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
        : details.poster_path
        ? `https://image.tmdb.org/t/p/w780${details.poster_path}`
        : "/thumbnail-new.png");

    return {
      title: `${title} | Twogether`,
      description: overview,
      openGraph: {
        title: `Twogether | ${title}`,
        description: overview,
        images: [poster],
        siteName: "Twogether",
      },
      twitter: {
        card: "summary_large_image",
        title: `Twogether | ${title}`,
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
