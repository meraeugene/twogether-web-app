import {
  EnrichedCollection,
  EnrichedMovie,
  TMDBCollection,
  TMDBMovie,
  TMDBMovieDetails,
} from "@/types/binge";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";
const COLLECTION_DISCOVERY_CACHE_SECONDS = 86400;
const COLLECTION_DETAILS_CACHE_SECONDS = 604800;
const COLLECTION_SEARCH_CACHE_SECONDS = 3600;
const TMDB_CONCURRENCY = 10;

const GENRE_NAME_TO_ID: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  "TV Movie": 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

async function fetchTMDB<T>(path: string, revalidate: number) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      cache: "force-cache",
      next: { revalidate },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    },
  );

  await Promise.all(workers);
  return results;
}

export async function GET(req: NextRequest) {
  const genreName = req.nextUrl.searchParams.get("genre");
  const query = req.nextUrl.searchParams.get("query")?.trim();
  const page = req.nextUrl.searchParams.get("page") || "1";

  if (!query && !genreName) {
    return NextResponse.json(
      { error: "A genre or search query is required" },
      { status: 400 },
    );
  }

  const genreId = genreName ? GENRE_NAME_TO_ID[genreName] : null;
  if (!query && !genreId) {
    return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
  }

  const uniqueCollections = new Map<number, { id: number; name: string }>();

  if (query) {
    if (query.length < 2) return NextResponse.json([]);

    const searchParams = new URLSearchParams({
      query,
      api_key: API_KEY,
      language: "en-US",
      page,
    });
    const searchResults = await fetchTMDB<{
      results: { id: number; name: string }[];
    }>(
      `/search/collection?${searchParams.toString()}`,
      COLLECTION_SEARCH_CACHE_SECONDS,
    );

    if (!searchResults) {
      return NextResponse.json(
        { error: "Unable to search collections" },
        { status: 502 },
      );
    }

    for (const collection of searchResults.results || []) {
      uniqueCollections.set(collection.id, collection);
    }
  } else {
    const discoveryParams = new URLSearchParams({
      with_genres: String(genreId),
      sort_by: "popularity.desc",
      include_adult: "false",
      certification_country: "US",
      "certification.lte": "PG-13",
      api_key: API_KEY,
      page,
    });
    const discovery = await fetchTMDB<{ results: TMDBMovie[] }>(
      `/discover/movie?${discoveryParams.toString()}`,
      COLLECTION_DISCOVERY_CACHE_SECONDS,
    );

    if (!discovery) {
      return NextResponse.json(
        { error: "Unable to load collections" },
        { status: 502 },
      );
    }

    // Resolve the collection for each discovery result concurrently. A popular
    // franchise often contributes several results, so deduplicate it before the
    // more expensive collection and movie-detail requests.
    const discoveredDetails = await mapWithConcurrency(
      discovery.results || [],
      TMDB_CONCURRENCY,
      (movie) =>
        fetchTMDB<TMDBMovieDetails>(
          `/movie/${movie.id}?api_key=${API_KEY}`,
          COLLECTION_DETAILS_CACHE_SECONDS,
        ),
    );

    for (const details of discoveredDetails) {
      const collection = details?.belongs_to_collection;
      if (collection) uniqueCollections.set(collection.id, collection);
    }
  }

  const collectionPayloads = await mapWithConcurrency(
    Array.from(uniqueCollections.values()),
    5,
    async (collection) => {
      const data = await fetchTMDB<TMDBCollection>(
        `/collection/${collection.id}?api_key=${API_KEY}`,
        COLLECTION_DETAILS_CACHE_SECONDS,
      );
      return data ? { collection, data } : null;
    },
  );

  const movieTasks = collectionPayloads.flatMap((payload) =>
    payload
      ? (payload.data.parts || []).map((part) => ({
          collectionId: payload.collection.id,
          collectionName: payload.collection.name,
          part,
        }))
      : [],
  );

  // Fetch all movie runtimes through one bounded worker pool. The old route
  // awaited every movie in a franchise serially and could multiply latency.
  const enrichedParts = await mapWithConcurrency(
    movieTasks,
    TMDB_CONCURRENCY,
    async ({ collectionId, collectionName, part }) => {
      const details = await fetchTMDB<TMDBMovieDetails>(
        `/movie/${part.id}?api_key=${API_KEY}`,
        COLLECTION_DETAILS_CACHE_SECONDS,
      );

      if (!details?.runtime) return null;

      const movie: EnrichedMovie = {
        id: part.id,
        tmdb_id: part.id,
        title: part.title,
        poster_url: part.poster_path
          ? `https://image.tmdb.org/t/p/w500${part.poster_path}`
          : null,
        backdrop_url: details.backdrop_path
          ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
          : null,
        year: part.release_date?.slice(0, 4),
        type: "movie",
        genres: details.genres?.map((genre) => genre.name) || [],
        duration: details.runtime,
        synopsis: details.overview || "",
        trailer_key: null,
      };

      return { collectionId, collectionName, movie };
    },
  );

  const collectionsMap = new Map<number, EnrichedCollection>();
  for (const result of enrichedParts) {
    if (!result) continue;
    const existing = collectionsMap.get(result.collectionId);
    if (existing) {
      existing.movies.push(result.movie);
    } else {
      collectionsMap.set(result.collectionId, {
        collection_id: result.collectionId,
        collection_name: result.collectionName,
        movies: [result.movie],
      });
    }
  }

  const collections = Array.from(collectionsMap.values()).map((collection) => ({
    ...collection,
    movies: collection.movies.sort((a, b) =>
      (a.year || "").localeCompare(b.year || ""),
    ),
  }));

  return NextResponse.json(collections, {
    headers: {
      "Cache-Control": `public, max-age=300, s-maxage=${query ? COLLECTION_SEARCH_CACHE_SECONDS : COLLECTION_DISCOVERY_CACHE_SECONDS}, stale-while-revalidate=${COLLECTION_DETAILS_CACHE_SECONDS}`,
    },
  });
}
