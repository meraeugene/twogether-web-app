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
// Genre collection discovery should update daily, while collection internals are stable.
const COLLECTION_DISCOVERY_CACHE_SECONDS = 86400; // 24 hours
const COLLECTION_DETAILS_CACHE_SECONDS = 604800; // 7 days

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

export async function GET(req: NextRequest) {
  const genreName = req.nextUrl.searchParams.get("genre");
  const page = req.nextUrl.searchParams.get("page") || "1";

  if (!genreName) {
    return NextResponse.json({ error: "Genre is required" }, { status: 400 });
  }

  const genreId = GENRE_NAME_TO_ID[genreName];
  if (!genreId) {
    return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
  }

  const discoverUrl = `${BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&include_adult=false&certification_country=US&certification.lte=PG-13&api_key=${API_KEY}&page=${page}`;
  const res = await fetch(discoverUrl, {
    cache: "force-cache",
    next: { revalidate: COLLECTION_DISCOVERY_CACHE_SECONDS },
  });
  const json: { results: TMDBMovie[] } = await res.json();

  const collectionsMap: Record<number, EnrichedCollection> = {};

  await Promise.all(
    (json.results || []).map(async (movie) => {
      const detailsRes = await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`,
        {
          cache: "force-cache",
          next: { revalidate: COLLECTION_DETAILS_CACHE_SECONDS },
        },
      );
      const details: TMDBMovieDetails = await detailsRes.json();
      const collection = details.belongs_to_collection;

      if (!collection || collectionsMap[collection.id]) return;

      const colRes = await fetch(
        `${BASE_URL}/collection/${collection.id}?api_key=${API_KEY}`,
        {
          cache: "force-cache",
          next: { revalidate: COLLECTION_DETAILS_CACHE_SECONDS },
        },
      );
      const colData: TMDBCollection = await colRes.json();

      const parts: EnrichedMovie[] = [];

      for (const part of colData.parts || []) {
        const partDetailsRes = await fetch(
          `${BASE_URL}/movie/${part.id}?api_key=${API_KEY}&append_to_response=videos`,
          {
            cache: "force-cache",
            next: { revalidate: COLLECTION_DETAILS_CACHE_SECONDS },
          },
        );
        const partDetails: TMDBMovieDetails = await partDetailsRes.json();

        const trailer =
          partDetails.videos?.results?.find(
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
          partDetails.videos?.results?.find(
            (video: { key: string; site: string; type: string }) =>
              video.site === "YouTube" && video.type === "Trailer",
          ) ||
          partDetails.videos?.results?.find(
            (video: { key: string; site: string; type: string }) =>
              video.site === "YouTube",
          );

        // Skip movies with 0 or missing runtime
        if (!partDetails.runtime || partDetails.runtime === 0) continue;

        parts.push({
          id: part.id,
          tmdb_id: part.id,
          title: part.title,
          poster_url: part.poster_path
            ? `https://image.tmdb.org/t/p/w500${part.poster_path}`
            : null,
          year: part.release_date?.slice(0, 4),
          type: "movie",
          genres: partDetails.genres?.map((g) => g.name) || [],
          duration: partDetails.runtime,
          synopsis: partDetails.overview || "",
          trailer_key: trailer?.key || null,
        });
      }

      if (parts.length > 0) {
        collectionsMap[collection.id] = {
          collection_id: collection.id,
          collection_name: collection.name,
          movies: parts.sort((a, b) =>
            (a.year || "").localeCompare(b.year || ""),
          ),
        };
      }
    }),
  );

  return NextResponse.json(Object.values(collectionsMap), {
    headers: {
      "Cache-Control": `public, max-age=${COLLECTION_DISCOVERY_CACHE_SECONDS}, stale-while-revalidate=300`,
    },
  });
}
