import { NextRequest, NextResponse } from "next/server";
import {
  TMDBRawResult,
  TMDBEnrichedResult,
  EpisodeTitle,
  TMDBSeasonResponse,
} from "@/types/tmdb";

// In-memory cache
const cache = new Map<
  string,
  { data: TMDBEnrichedResult[]; timestamp: number }
>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";
const MAX_RECOMMEND_RESULTS = 8;
const MAX_TV_SEASONS = 12;
const TMDB_FETCH_OPTIONS = {
  cache: "force-cache" as const,
  next: { revalidate: 86400 },
};

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
      const seasonRes = await fetch(
        `${BASE_URL}/tv/${tmdbId}/season/${season}?api_key=${TMDB_API_KEY}`,
      );

      if (!seasonRes.ok) return null;

      const seasonData: TMDBSeasonResponse = await seasonRes.json();
      return [
        season,
        seasonData.episodes.map(
          (ep): EpisodeTitle => ({
            episode_number: ep.episode_number,
            title: ep.name,
          }),
        ),
      ] as const;
    }),
  );

  const validSeasons = seasons.filter(
    (
      season,
    ): season is readonly [number, EpisodeTitle[]] => season !== null,
  );

  return Object.fromEntries(validSeasons);
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  const lite = req.nextUrl.searchParams.get("lite") === "1";
  const requestedLimit = Number(req.nextUrl.searchParams.get("limit") ?? "");
  const resultLimit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, MAX_RECOMMEND_RESULTS)
      : MAX_RECOMMEND_RESULTS;

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const cacheKey = `${query.toLowerCase().trim()}::${lite ? "lite" : "full"}::${resultLimit}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=60",
      },
    });
  }

  const searchUrl = `${BASE_URL}/search/multi?query=${encodeURIComponent(
    query,
  )}&api_key=${TMDB_API_KEY}&include_adult=false&language=en-US&region=US`;

  const searchRes = await fetch(searchUrl, TMDB_FETCH_OPTIONS);
  if (!searchRes.ok) {
    return NextResponse.json({ error: "TMDB search failed" }, { status: 502 });
  }

  const searchData = await searchRes.json();

  const rawResults: TMDBRawResult[] = (searchData.results || [])
    .filter(
      (item: TMDBRawResult) =>
        (item.media_type === "movie" || item.media_type === "tv") &&
        !!item.poster_path,
    )
    .sort((a: TMDBRawResult, b: TMDBRawResult) => {
      const getYear = (item: TMDBRawResult) =>
        item.media_type === "movie"
          ? parseInt(item.release_date?.slice(0, 4) || "0")
          : parseInt(item.first_air_date?.slice(0, 4) || "0");
      return getYear(b) - getYear(a);
    });

  const enrichedResults: TMDBEnrichedResult[] = await Promise.all(
    rawResults.slice(0, resultLimit).map(
      async (item): Promise<TMDBEnrichedResult> => {
      try {
        const detailsRes = await fetch(
          `${BASE_URL}/${item.media_type}/${item.id}?api_key=${TMDB_API_KEY}&append_to_response=videos`,
          TMDB_FETCH_OPTIONS,
        );
        if (!detailsRes.ok) throw new Error("Details fetch failed");

        const details = await detailsRes.json();

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

        if (!lite && item.media_type === "tv") {
          episodeTitlesPerSeason = await getEpisodeTitlesPerSeason(
            item.id,
            details.number_of_seasons || 0,
          );
        }

        const duration =
          item.media_type === "movie"
            ? details.runtime
            : details.episode_run_time?.[0] ||
              details.episode_run_time?.[1] ||
              24;

        return {
          ...item,
          genres:
            details.genres?.map((g: { id: number; name: string }) => g.name) ||
            [],
          poster_url: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
          year:
            item.media_type === "movie"
              ? details.release_date?.slice(0, 4)
              : details.first_air_date?.slice(0, 4),
          duration,
          synopsis: details.overview || "",
          seasons:
            item.media_type === "tv" ? details.number_of_seasons : undefined,
          episodes:
            item.media_type === "tv" ? details.number_of_episodes : undefined,
          episodeTitlesPerSeason,
          trailer_key: trailer?.key || null,
        };
      } catch (err) {
        console.error(`Failed to fetch details for ID ${item.id}:`, err);
        return {
          ...item,
          genres: [],
          poster_url: null,
          year: undefined,
          duration: undefined,
          synopsis: "",
          seasons: undefined,
          episodes: undefined,
          episodeTitlesPerSeason: undefined,
          trailer_key: null,
        };
      }
    }),
  );

  // Remove entries with no poster or 0/missing duration
  const cleanedResults = enrichedResults.filter((item) => {
    const hasValidPoster = !!item.poster_url;
    const hasValidDuration = item.duration && item.duration > 0;

    return hasValidPoster && hasValidDuration;
  });

  // Cache it
  cache.set(cacheKey, { data: cleanedResults, timestamp: now });

  return NextResponse.json(cleanedResults, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=60",
    },
  });
}
