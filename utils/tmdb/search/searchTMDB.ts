import {
  TMDBEnrichedResult,
  TMDBRawResult,
  EpisodeTitle,
  TMDBSeasonResponse,
} from "@/types/tmdb";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

export async function searchTMDB(query: string): Promise<TMDBEnrichedResult[]> {
  const searchUrl = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
    query
  )}&include_adult=false&language=en-US&region=US`;

  const res = await fetch(searchUrl, {
    cache: "force-cache",
    next: { revalidate: 86400 }, // 24 hours
  });

  const { results } = (await res.json()) as { results: TMDBRawResult[] };
  if (!results) return [];

  const filtered = results.filter(
    (item): item is TMDBRawResult =>
      (item.media_type === "movie" || item.media_type === "tv") &&
      !!item.poster_path
  );

  const enrichedResults: TMDBEnrichedResult[] = await Promise.all(
    filtered.map(async (item) => {
      const detailUrl =
        item.media_type === "movie"
          ? `${BASE_URL}/movie/${item.id}?api_key=${API_KEY}`
          : `${BASE_URL}/tv/${item.id}?api_key=${API_KEY}`;

      const detailRes = await fetch(detailUrl, {
        cache: "force-cache",
        next: { revalidate: 86400 },
      });

      const details = await detailRes.json();

      let episodeTitlesPerSeason: Record<number, EpisodeTitle[]> | undefined;

      if (item.media_type === "tv") {
        episodeTitlesPerSeason = {};
        const totalSeasons = details.number_of_seasons || 0;

        for (let season = 1; season <= totalSeasons; season++) {
          const seasonUrl = `${BASE_URL}/tv/${item.id}/season/${season}?api_key=${API_KEY}`;
          const seasonRes = await fetch(seasonUrl, {
            cache: "force-cache",
            next: { revalidate: 86400 },
          });

          if (seasonRes.ok) {
            const seasonData: TMDBSeasonResponse = await seasonRes.json();
            episodeTitlesPerSeason[season] = seasonData.episodes.map((ep) => ({
              episode_number: ep.episode_number,
              title: ep.name,
            }));
          }
        }
      }

      return {
        ...item,
        tmdb_id: item.id,
        type: item.media_type,
        media_type: item.media_type,
        poster_url: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
        year:
          item.media_type === "movie"
            ? details.release_date?.slice(0, 4)
            : details.first_air_date?.slice(0, 4),
        genres:
          Array.isArray(details.genres) && details.genres.length > 0
            ? details.genres.map((g: { id: number; name: string }) => g.name)
            : [],
        duration:
          item.media_type === "movie"
            ? details.runtime ?? null
            : details.episode_run_time?.[0] ?? null,
        synopsis: details.overview || "",
        seasons:
          item.media_type === "tv" ? details.number_of_seasons : undefined,
        episodes:
          item.media_type === "tv" ? details.number_of_episodes : undefined,
        episodeTitlesPerSeason:
          item.media_type === "tv" ? episodeTitlesPerSeason : undefined,
      };
    })
  );

  const enrichedResultsSorted = enrichedResults
    .filter((item) => item.year)
    .sort((a, b) => {
      const yearA = parseInt(a.year ?? "0", 10);
      const yearB = parseInt(b.year ?? "0", 10);
      return yearB - yearA;
    });

  const cleanedResults = enrichedResultsSorted.filter((item) => {
    if (item.type === "movie") {
      return item.duration && item.duration > 0;
    }
    return true;
  });

  return cleanedResults;
}
