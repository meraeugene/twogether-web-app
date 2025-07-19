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
  const res = await fetch(discoverUrl);
  const json: { results: TMDBMovie[] } = await res.json();

  const collectionsMap: Record<number, EnrichedCollection> = {};

  await Promise.all(
    (json.results || []).map(async (movie) => {
      const detailsRes = await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`
      );
      const details: TMDBMovieDetails = await detailsRes.json();
      const collection = details.belongs_to_collection;

      if (!collection || collectionsMap[collection.id]) return;

      const colRes = await fetch(
        `${BASE_URL}/collection/${collection.id}?api_key=${API_KEY}`
      );
      const colData: TMDBCollection = await colRes.json();

      const parts: EnrichedMovie[] = [];

      for (const part of colData.parts || []) {
        const partDetailsRes = await fetch(
          `${BASE_URL}/movie/${part.id}?api_key=${API_KEY}`
        );
        const partDetails: TMDBMovieDetails = await partDetailsRes.json();

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
          media_type: "movie",
          genres: partDetails.genres?.map((g) => g.name) || [],
          duration: partDetails.runtime,
          synopsis: partDetails.overview || "",
        });
      }

      if (parts.length > 0) {
        collectionsMap[collection.id] = {
          collection_id: collection.id,
          collection_name: collection.name,
          movies: parts.sort((a, b) =>
            (a.year || "").localeCompare(b.year || "")
          ),
        };
      }
    })
  );

  return NextResponse.json(Object.values(collectionsMap), {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=60",
    },
  });
}
