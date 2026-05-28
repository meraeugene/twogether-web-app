import {
  TMDBEnrichedResult,
  TMDBRawResult,
  EpisodeTitle,
  TMDBSeasonResponse,
} from "@/types/tmdb";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";
const MAX_BASE_RESULTS = 8;
const MAX_FINAL_RESULTS = 24;
const MAX_TV_SEASONS = 12;

async function getEpisodeTitlesPerSeason(
  tmdbId: number,
  totalSeasons: number,
): Promise<Record<number, EpisodeTitle[]>> {
  const seasonNumbers = Array.from(
    { length: Math.min(totalSeasons, MAX_TV_SEASONS) },
    (_, index) => index + 1,
  );

  const seasons = await Promise.all(
    seasonNumbers.map(async (season) => {
      const seasonUrl = `${BASE_URL}/tv/${tmdbId}/season/${season}?api_key=${API_KEY}`;

      const seasonRes = await fetch(seasonUrl, {
        cache: "force-cache",
        next: { revalidate: 86400 },
      });

      if (!seasonRes.ok) return null;

      const seasonData: TMDBSeasonResponse = await seasonRes.json();

      return [
        season,
        seasonData.episodes.map((ep) => ({
          episode_number: ep.episode_number,
          title: ep.name,
        })),
      ] as const;
    }),
  );

  const validSeasons = seasons.filter(
    (season): season is readonly [number, EpisodeTitle[]] => season !== null,
  );

  return Object.fromEntries(validSeasons);
}

function removeDuplicates(results: TMDBRawResult[]) {
  const map = new Map<string, TMDBRawResult>();

  for (const item of results) {
    if (!item.id || !item.media_type) continue;

    const key = `${item.media_type}-${item.id}`;

    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

export async function searchTMDB(query: string): Promise<TMDBEnrichedResult[]> {
  const searchUrl = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
    query,
  )}&include_adult=false&language=en-US&region=US`;

  const res = await fetch(searchUrl, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const { results } = (await res.json()) as { results: TMDBRawResult[] };

  if (!results) return [];

  const baseResults = results
    .filter(
      (item): item is TMDBRawResult =>
        (item.media_type === "movie" || item.media_type === "tv") &&
        !!item.poster_path,
    )
    .slice(0, MAX_BASE_RESULTS);

  const relatedResults = await Promise.all(
    baseResults.map(async (item) => {
      const relatedUrl =
        item.media_type === "movie"
          ? `${BASE_URL}/movie/${item.id}?api_key=${API_KEY}&append_to_response=recommendations,similar`
          : `${BASE_URL}/tv/${item.id}?api_key=${API_KEY}&append_to_response=recommendations,similar`;

      const relatedRes = await fetch(relatedUrl, {
        cache: "force-cache",
        next: { revalidate: 86400 },
      });

      if (!relatedRes.ok) return [];

      const details = await relatedRes.json();

      const recommendations = details.recommendations?.results ?? [];
      const similar = details.similar?.results ?? [];

      return [...recommendations, ...similar].map((related) => ({
        ...related,
        media_type: related.media_type ?? item.media_type,
      })) as TMDBRawResult[];
    }),
  );

  const mergedResults = removeDuplicates([
    ...baseResults,
    ...relatedResults.flat(),
  ]).filter(
    (item): item is TMDBRawResult =>
      (item.media_type === "movie" || item.media_type === "tv") &&
      !!item.poster_path,
  );

  const enrichedResults = (
    await Promise.all(
      mergedResults.slice(0, MAX_FINAL_RESULTS).map(async (item) => {
        const detailUrl =
          item.media_type === "movie"
            ? `${BASE_URL}/movie/${item.id}?api_key=${API_KEY}&append_to_response=videos`
            : `${BASE_URL}/tv/${item.id}?api_key=${API_KEY}&append_to_response=videos`;

        const detailRes = await fetch(detailUrl, {
          cache: "force-cache",
          next: { revalidate: 86400 },
        });

        if (!detailRes.ok) return null;

        const details = await detailRes.json();

        const trailer =
          details.videos?.results?.find(
            (video: {
              key: string;
              site: string;
              type: string;
              official?: boolean;
            }) =>
              video.site === "YouTube" &&
              video.type === "Trailer" &&
              video.official,
          ) ||
          details.videos?.results?.find(
            (video: { key: string; site: string; type: string }) =>
              video.site === "YouTube" && video.type === "Trailer",
          ) ||
          details.videos?.results?.find(
            (video: { key: string; site: string; type: string }) =>
              video.site === "YouTube",
          );

        let episodeTitlesPerSeason: Record<number, EpisodeTitle[]> | undefined;

        if (item.media_type === "tv") {
          episodeTitlesPerSeason = await getEpisodeTitlesPerSeason(
            item.id,
            details.number_of_seasons || 0,
          );
        }

        const enrichedItem: TMDBEnrichedResult = {
          ...item,
          tmdb_id: item.id,
          type: item.media_type as "movie" | "tv",
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
              ? (details.runtime ?? null)
              : (details.episode_run_time?.[0] ?? null),
          synopsis: details.overview || "",
          seasons:
            item.media_type === "tv" ? details.number_of_seasons : undefined,
          episodes:
            item.media_type === "tv" ? details.number_of_episodes : undefined,
          episodeTitlesPerSeason:
            item.media_type === "tv" ? episodeTitlesPerSeason : undefined,
          trailer_key: trailer?.key || null,
        };

        return enrichedItem;
      }),
    )
  ).filter((item): item is TMDBEnrichedResult => item !== null);

  return enrichedResults
    .filter((item) => item.year)
    .filter((item) => {
      if (item.media_type === "movie") {
        return item.duration && item.duration > 0;
      }

      return true;
    });
}
