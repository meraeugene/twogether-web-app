import { Recommendation } from "@/types/recommendation";
import { TMDBEnrichedResult } from "@/types/tmdb";
import { getStreamUrls } from "@/utils/getStreamUrls";

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
    stream_url: getStreamUrls(tmdb.id, tmdb.type === "tv" ? "tv" : "movie"),
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
