import { Recommendation } from "@/types/recommendation";
import { TMDBEnrichedResult } from "@/types/tmdb";

export function adaptTMDBToRecommendation(
  tmdb: TMDBEnrichedResult,
): Recommendation {
  const baseId = `${tmdb.type}-${tmdb.id}`; // deterministic

  return {
    id: baseId,
    recommendation_id: baseId,
    tmdb_id: tmdb.id,
    title: tmdb.title || tmdb.name || "Untitled",
    poster_url: tmdb.poster_url ?? undefined,
    type: tmdb.type === "tv" ? "tv" : "movie",
    stream_url:
      tmdb.type === "tv"
        ? [
            `https://vidsrc-embed.ru/embed/tv/${tmdb.id}/1/1`,
            `https://www.vidking.net/embed/tv/${tmdb.id}/1/1`,
            `https://player.videasy.net/tv/${tmdb.id}/1/1`,
            `https://vidsrc.to/embed/tv/${tmdb.id}/1/1`,
          ]
        : [
            `https://player.videasy.net/movie/${tmdb.id}/1/1`,
            `https://www.vidking.net/embed/movie/${tmdb.id}`,
            `https://vidsrc-embed.ru/embed/movie/${tmdb.id}`,
            `https://vidsrc.to/embed/movie/${tmdb.id}`,
          ],
    genres: tmdb.genres,
    year: tmdb.year,
    duration: tmdb.duration ?? undefined,
    synopsis: tmdb.synopsis,
    seasons: tmdb.seasons ?? undefined,
    episodes: tmdb.episodes ?? undefined,
    episode_titles_per_season: tmdb.episodeTitlesPerSeason ?? undefined,
    trailer_key: tmdb.trailer_key ?? null,
    visibility: "public",
    comment: "",
    is_tmdb_recommendation: true,
    created_at: new Date().toISOString(),
    recommended_by: {
      id: "tmdb",
      username: "",
      avatar_url: "",
    },
  };
}
