import { EnrichedCollection } from "@/types/binge";
import { Recommendation } from "@/types/recommendation";
import { getStreamUrls } from "@/utils/getStreamUrls";

export function adaptCollectionMoviesToRecommendations(
  collection: EnrichedCollection,
): Recommendation[] {
  return collection.movies.map((movie) => {
    const baseId = `movie-${movie.tmdb_id}`;

    return {
      id: baseId,
      recommendation_id: baseId,
      tmdb_id: movie.tmdb_id,
      title: movie.title,
      poster_url: movie.poster_url ?? undefined,
      type: "movie",
      stream_url: getStreamUrls(movie.tmdb_id, "movie"),
      genres: movie.genres,
      year: movie.year ?? "",
      duration: movie.duration ?? undefined,
      synopsis: movie.synopsis ?? "",
      seasons: undefined,
      episodes: undefined,
      episode_titles_per_season: undefined,
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
  });
}
