import { NextResponse } from "next/server";
import { BROWSE_GENRE_SHELVES } from "@/constants/browseShelves";
import { TMDB_GENRE_MAP } from "@/constants/tmdbGenres";
import type { TMDBBrowseFeaturedResponse, TMDBBrowseShelf, TMDBEnrichedResult, TMDBFeaturedResult, TMDBRawResult } from "@/types/tmdb";

const FEATURED_IDS = [157336, 27205, 155, 496243, 129, 120467];
const DETAILS_CACHE_SECONDS = 86400;
const FEED_CACHE_SECONDS = 3600;
const BASE_URL = "https://api.themoviedb.org/3";
type MovieSummary = TMDBRawResult & { adult?: boolean };

type MovieDetails = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  runtime?: number;
  overview?: string;
  genres?: { name: string }[];
  images?: { logos?: { file_path: string; iso_639_1: string | null }[] };
  videos?: { results?: { key: string; site: string; type: string; official?: boolean; published_at?: string }[] };
};

async function fetchTMDB<T>(path: string, apiKey: string, params: Record<string, string> = {}, revalidate = FEED_CACHE_SECONDS): Promise<T> {
  const query = new URLSearchParams({ api_key: apiKey, language: "en-US", ...params });
  const response = await fetch(`${BASE_URL}/${path}?${query}`, {
    next: { revalidate }, signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("Movie service is unavailable.");
  return response.json() as Promise<T>;
}

async function movieDetails(id: number, apiKey: string): Promise<TMDBFeaturedResult> {
  const movie = await fetchTMDB<MovieDetails>(`movie/${id}`, apiKey, {
    append_to_response: "videos,images", include_image_language: "en,null",
  }, DETAILS_CACHE_SECONDS);
  const trailers = (movie.videos?.results ?? [])
    .filter((video) => video.site === "YouTube" && video.type === "Trailer")
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
  const trailer = trailers.find((video) => video.official) ?? trailers[0];
  const logo = movie.images?.logos?.find((image) => image.iso_639_1 === "en");
  return {
    id: movie.id, tmdb_id: movie.id, type: "movie", title: movie.title,
    poster_path: movie.poster_path, backdrop_path: movie.backdrop_path,
    poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    backdrop_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
    logo_url: logo ? `https://image.tmdb.org/t/p/w500${logo.file_path}` : null,
    release_date: movie.release_date, year: movie.release_date?.slice(0, 4),
    genres: movie.genres?.map((genre) => genre.name) ?? [],
    duration: movie.runtime, synopsis: movie.overview, trailer_key: trailer?.key ?? null,
  };
}

async function recentHeroes(apiKey: string): Promise<TMDBFeaturedResult[]> {
  const feeds = await Promise.allSettled([
    fetchTMDB<{ results: MovieSummary[] }>("trending/movie/day", apiKey),
    fetchTMDB<{ results: MovieSummary[] }>("movie/now_playing", apiKey),
  ]);
  const lists = feeds.map((feed) => feed.status === "fulfilled" ? feed.value.results ?? [] : []);
  const today = Date.now();
  const oldest = today - 365 * 86400000;
  const upcoming = today + 90 * 86400000;
  const candidates = new Map<number, MovieSummary>();
  // Interleave current releases and today's trending feed, excluding old re-releases.
  for (let index = 0; index < Math.max(...lists.map((list) => list.length)); index += 1) {
    for (const list of lists) {
      const movie = list[index];
      if (!movie || movie.adult || !movie.backdrop_path) continue;
      const released = Date.parse(movie.release_date ?? "");
      if (released >= oldest && released <= upcoming) candidates.set(movie.id, movie);
    }
  }
  const results = await Promise.allSettled([...candidates.keys()].slice(0, 10).map((id) => movieDetails(id, apiKey)));
  return results.flatMap((result) => result.status === "fulfilled" && result.value.backdrop_url && result.value.trailer_key ? [result.value] : []);
}

async function genreShelf(config: typeof BROWSE_GENRE_SHELVES[number], apiKey: string): Promise<TMDBBrowseShelf> {
  try {
    const response = await fetchTMDB<{ results: MovieSummary[] }>("discover/movie", apiKey, {
      with_genres: String(TMDB_GENRE_MAP[config.genre]), sort_by: "popularity.desc",
      include_adult: "false", "vote_count.gte": "100",
    });
    const items: TMDBEnrichedResult[] = (response.results ?? [])
      .filter((movie) => !movie.adult && movie.poster_path)
      .map((movie) => ({
        ...movie, type: "movie", tmdb_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        year: movie.release_date?.slice(0, 4), synopsis: movie.overview,
        genres: Object.entries(TMDB_GENRE_MAP).filter(([, id]) => movie.genre_ids?.includes(id)).map(([name]) => name),
      }));
    return { ...config, items };
  } catch {
    return { ...config, items: [], unavailable: true };
  }
}

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Movie service is unavailable." }, { status: 503 });
  const [curated, heroes, genreShelves] = await Promise.all([
    Promise.allSettled(FEATURED_IDS.map((id) => movieDetails(id, apiKey))),
    recentHeroes(apiKey),
    Promise.all(BROWSE_GENRE_SHELVES.map((config) => genreShelf(config, apiKey))),
  ]);
  const curatedItems = curated.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  const items = curatedItems.length ? curatedItems : heroes.slice(0, 6);
  const usedIds = new Set(items.map((item) => item.id));
  const shelves = genreShelves.map((shelf) => ({
    ...shelf,
    items: shelf.items.filter((item) => {
      if (usedIds.has(item.id)) return false;
      return true;
    }).slice(0, 6).map((item) => { usedIds.add(item.id); return item; }),
  }));
  if (!items.length && !shelves.some((shelf) => shelf.items.length)) {
    return NextResponse.json({ error: "Featured movies are unavailable. Please try again." }, { status: 502 });
  }
  const payload: TMDBBrowseFeaturedResponse = { hero: heroes[0] ?? null, heroes, items, shelves };
  const complete = curatedItems.length === FEATURED_IDS.length && heroes.length > 0 && shelves.every((shelf) => !shelf.unavailable);
  return NextResponse.json(payload, {
    headers: { "Cache-Control": `public, max-age=${complete ? FEED_CACHE_SECONDS : 60}, stale-while-revalidate=300` },
  });
}
