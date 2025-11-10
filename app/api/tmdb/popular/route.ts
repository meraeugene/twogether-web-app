import { NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

interface TMDBResult {
  id: number;
  poster_path: string | null;
  [key: string]: unknown;
}

interface TMDBResponse {
  results: TMDBResult[];
}

export async function GET() {
  try {
    const fetchImages = async (url: string): Promise<string[]> => {
      const res = await fetch(
        `${url}?api_key=${API_KEY}&language=en-US&page=1`,
        {
          cache: "force-cache",
          next: { revalidate: 86400 },
        }
      );

      if (!res.ok) throw new Error("TMDB fetch failed");

      const data: TMDBResponse = await res.json();

      return (data.results || [])
        .filter((item) => item.poster_path)
        .map((item) => `https://image.tmdb.org/t/p/w500${item.poster_path}`);
    };

    // Fetch popular movies and TV shows
    const [movies, shows] = await Promise.all([
      fetchImages(`${BASE_URL}/movie/popular`),
      fetchImages(`${BASE_URL}/tv/popular`),
    ]);

    // Combine and limit to 30 unique images
    const images = Array.from(new Set([...movies, ...shows])).slice(0, 30);

    const response = NextResponse.json(images);
    response.headers.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    console.error("TMDB Popular Covers API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular covers" },
      { status: 500 }
    );
  }
}
