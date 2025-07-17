import { Recommendation } from "@/types/recommendation";
import { TMDBEnrichedResult } from "@/types/tmdb";

export function adaptAIGeneratedToRecommendation(
  tmdb: TMDBEnrichedResult
): Recommendation {
  const baseId = `${tmdb.media_type}-${tmdb.id}`; // deterministic

  return {
    id: baseId,
    recommendation_id: baseId,
    tmdb_id: tmdb.id,
    title: tmdb.title || tmdb.name || "Untitled",
    poster_url: tmdb.poster_url ?? undefined,
    type: tmdb.media_type === "tv" ? "tv" : "movie",
    stream_url:
      tmdb.media_type === "tv"
        ? [
            `https://vidlink.pro/tv/${tmdb.id}/1/1?title=true&poster=true&autoplay=false`,
            `https://vidsrc.cc/v2/embed/tv/${tmdb.id}/1/1?autoPlay=false&poster=true`,
            `https://vidsrc.to/embed/tv/${tmdb.id}/1/1`,
          ]
        : [
            `https://vidlink.pro/movie/${tmdb.id}?title=true&poster=true&autoplay=false`,
            `https://vidsrc.cc/v2/embed/movie/${tmdb.id}?autoPlay=false&poster=true`,
            `https://vidsrc.to/embed/movie/${tmdb.id}`,
          ],

    genres: tmdb.genres,
    year: tmdb.year,
    duration: tmdb.duration ?? undefined,
    synopsis: tmdb.synopsis,
    seasons: tmdb.seasons ?? undefined,
    episodes: tmdb.episodes ?? undefined,
    episode_titles_per_season: tmdb.episodeTitlesPerSeason ?? undefined,
    comment: "AI Recommended",
    visibility: "public",
    created_at: new Date().toISOString(),
    recommended_by: {
      id: "ai-generated",
      username: "AI Recommendation",
      avatar_url: "/gemini-color.svg",
    },
  };
}
