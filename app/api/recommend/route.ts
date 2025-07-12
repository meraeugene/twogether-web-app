import { NextRequest, NextResponse } from "next/server";
import {
  TMDBRawResult,
  TMDBEnrichedResult,
  EpisodeTitle,
  TMDBSeasonResponse,
} from "@/types/tmdb";

// In-memory cache (fast but temporary)
const cache = new Map<
  string,
  { data: TMDBEnrichedResult[]; timestamp: number }
>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const cacheKey = query.toLowerCase().trim();
  const now = Date.now();
  const cached = cache.get(cacheKey);

  // Serve from cache if available and fresh
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // Fetch search results
  const searchUrl = `${BASE_URL}/search/multi?query=${encodeURIComponent(
    query
  )}&api_key=${TMDB_API_KEY}`;
  const searchRes = await fetch(searchUrl);

  if (!searchRes.ok) {
    return NextResponse.json({ error: "TMDB search failed" }, { status: 502 });
  }

  const searchData = await searchRes.json();

  const rawResults: TMDBRawResult[] = (searchData.results || [])
    .filter((item: TMDBRawResult) => ["movie", "tv"].includes(item.media_type))
    .sort((a: TMDBRawResult, b: TMDBRawResult) => {
      const getYear = (item: TMDBRawResult) =>
        item.media_type === "movie"
          ? parseInt(item.release_date?.slice(0, 4) || "0")
          : parseInt(item.first_air_date?.slice(0, 4) || "0");
      return getYear(b) - getYear(a);
    });

  // Fetch details concurrently (parallel API calls)
  const enrichedResults: TMDBEnrichedResult[] = await Promise.all(
    rawResults.map(async (item): Promise<TMDBEnrichedResult> => {
      try {
        const detailsRes = await fetch(
          `${BASE_URL}/${item.media_type}/${item.id}?api_key=${TMDB_API_KEY}`
        );
        if (!detailsRes.ok) throw new Error("Details fetch failed");

        const details = await detailsRes.json();

        const episodeTitlesPerSeason: Record<number, EpisodeTitle[]> = {};

        if (item.media_type === "tv") {
          for (let season = 1; season <= details.number_of_seasons; season++) {
            const seasonRes = await fetch(
              `${BASE_URL}/tv/${item.id}/season/${season}?api_key=${TMDB_API_KEY}`
            );

            if (seasonRes.ok) {
              const seasonData: TMDBSeasonResponse = await seasonRes.json();
              episodeTitlesPerSeason[season] = seasonData.episodes.map(
                (ep): EpisodeTitle => ({
                  episode_number: ep.episode_number,
                  title: ep.name,
                })
              );
            }
          }
        }

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
          duration:
            item.media_type === "movie"
              ? details.runtime
              : details.episode_run_time?.[0] ||
                details.episode_run_time?.[1] ||
                24, // fallback
          synopsis: details.overview || "",
          seasons:
            item.media_type === "tv" ? details.number_of_seasons : undefined,
          episodes:
            item.media_type === "tv" ? details.number_of_episodes : undefined,
          episodeTitlesPerSeason:
            item.media_type === "tv" ? episodeTitlesPerSeason : undefined,
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
        };
      }
    })
  );

  // Cache result for future requests
  cache.set(cacheKey, { data: enrichedResults, timestamp: now });

  return NextResponse.json(enrichedResults);
}
