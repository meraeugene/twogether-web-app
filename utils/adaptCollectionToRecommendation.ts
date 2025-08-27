import { EnrichedCollection } from "@/types/binge";
import { Recommendation } from "@/types/recommendation";

export function adaptCollectionMoviesToRecommendations(
  collection: EnrichedCollection
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
      stream_url: [
        `https://vidlink.pro/movie/${movie.tmdb_id}?title=true&poster=true&autoplay=false`,
        `https://vidsrc.cc/v2/embed/movie/${movie.tmdb_id}?autoPlay=false&poster=true`,
        `https://vidsrc.to/embed/movie/${movie.tmdb_id}`,
      ],
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
