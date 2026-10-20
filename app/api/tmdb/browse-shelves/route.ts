import { NextRequest, NextResponse } from "next/server";
import { BROWSE_CATEGORY_SHELVES, TV_GENRE_MAP, isBrowseCategory, type BrowseCategoryId, type BrowseShelfConfig } from "@/constants/browseShelves";
import { TMDB_GENRE_MAP } from "@/constants/tmdbGenres";
import type { TMDBBrowseCategoryResponse, TMDBBrowseShelf, TMDBEnrichedResult, TMDBRawResult } from "@/types/tmdb";

const CACHE_SECONDS = 3600;
type Summary = TMDBRawResult & { adult?: boolean };

function discoveryParams(category: BrowseCategoryId, genre?: string): Record<string, string> {
  const genres = new Set<number>();
  if (category === "anime") genres.add(16);
  if (category === "kdramas") genres.add(18);
  const genreMap: Record<string, number> = category === "movies" ? TMDB_GENRE_MAP : TV_GENRE_MAP;
  if (genre && genreMap[genre]) genres.add(genreMap[genre]);
  return {
    sort_by: "popularity.desc", include_adult: "false",
    ...(genres.size ? { with_genres: [...genres].join(",") } : {}),
    ...(category === "anime" ? { with_original_language: "ja" } : {}),
    ...(category === "kdramas" ? { with_original_language: "ko" } : {}),
  };
}

async function fetchTitles(category: BrowseCategoryId, apiKey: string, genre?: string, page = 1): Promise<TMDBEnrichedResult[]> {
  const type = category === "movies" ? "movie" : "tv";
  const path = !genre && category === "movies" ? "trending/movie/week"
    : !genre && category === "tv" ? "tv/popular" : `discover/${type}`;
  const params = new URLSearchParams({ api_key: apiKey, language: "en-US", page: String(page), ...discoveryParams(category, genre) });
  const response = await fetch(`https://api.themoviedb.org/3/${path}?${params}`, {
    next: { revalidate: CACHE_SECONDS }, signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("Titles are unavailable.");
  const data = await response.json() as { results?: Summary[] };
  const genreMap = type === "movie" ? TMDB_GENRE_MAP : TV_GENRE_MAP;
  return (data.results ?? []).filter((item) => !item.adult && item.poster_path).map((item) => ({
    ...item, type, tmdb_id: item.id,
    title: item.title || item.name || "Untitled",
    poster_url: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
    year: (item.release_date || item.first_air_date)?.slice(0, 4),
    genres: Object.entries(genreMap).filter(([, id]) => item.genre_ids?.includes(id)).map(([name]) => name),
    synopsis: item.overview,
  }));
}

async function fetchShelf(category: BrowseCategoryId, config: BrowseShelfConfig, apiKey: string): Promise<TMDBBrowseShelf> {
  try {
    return { ...config, items: await fetchTitles(category, apiKey, config.genre) };
  } catch {
    return { ...config, items: [], unavailable: true };
  }
}

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") ?? "movies";
  if (!isBrowseCategory(category)) return NextResponse.json({ error: "Unknown browse category." }, { status: 400 });
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Movie service is unavailable." }, { status: 503 });
  const genre = request.nextUrl.searchParams.get("genre") || undefined;
  const config = genre ? BROWSE_CATEGORY_SHELVES[category].find((item) => item.genre === genre) : undefined;
  if (genre && !config) return NextResponse.json({ error: "Unknown genre for this category." }, { status: 400 });
  const page = Math.min(500, Math.max(1, Math.floor(Number(request.nextUrl.searchParams.get("page")) || 1)));
  try {
    if (genre) {
      return NextResponse.json({ items: await fetchTitles(category, apiKey, genre, page), shelves: [] }, {
        headers: { "Cache-Control": `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=300` },
      });
    }
    const [top, rows] = await Promise.all([
      fetchTitles(category, apiKey).catch(() => null),
      Promise.all(BROWSE_CATEGORY_SHELVES[category].map((shelf) => fetchShelf(category, shelf, apiKey))),
    ]);
    if (!top && rows.every((shelf) => shelf.unavailable)) throw new Error("Category unavailable");
    const items = (top ?? []).slice(0, 6);
    const seen = new Set(items.map((item) => item.id));
    const shelves = rows.map((shelf) => {
      const unique: TMDBEnrichedResult[] = [];
      for (const item of shelf.items) {
        if (seen.has(item.id)) continue;
        unique.push(item);
        seen.add(item.id);
        if (unique.length === 6) break;
      }
      return { ...shelf, items: unique };
    });
    const payload: TMDBBrowseCategoryResponse = { items, shelves };
    return NextResponse.json(payload, {
      headers: { "Cache-Control": `public, max-age=${top && shelves.every((shelf) => !shelf.unavailable) ? CACHE_SECONDS : 60}, stale-while-revalidate=300` },
    });
  } catch {
    return NextResponse.json({ error: "These titles are unavailable. Please try again." }, { status: 502 });
  }
}
