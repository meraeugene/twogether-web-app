import { Recommendation } from "@/types/recommendation";
import { TMDBEnrichedResult } from "@/types/tmdb";

export function adaptAIGeneratedToRecommendation(
  tmdb: TMDBEnrichedResult,
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
            `https://vidsrc-embed.ru/embed/tv/${tmdb.id}/1/1`,
            `https://www.vidking.net/embed/tv/${tmdb.id}/1/1`,
            `https://player.videasy.net/tv/${tmdb.id}/1/1`,
            `https://vidsrc.to/embed/tv/${tmdb.id}/1/1`,
          ]
        : [
            `https://vidsrc-embed.ru/embed/movie/${tmdb.id}`,
            `https://www.vidking.net/embed/movie/${tmdb.id}`,
            `https://player.videasy.net/movie/${tmdb.id}/1/1`,
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
    trailer_key: tmdb.trailer_key ?? undefined,
  };
}
