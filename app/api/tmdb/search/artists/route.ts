import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

type TMDBArtistResult = {
  id: number;
  name: string;
  profile_path?: string | null;
  known_for_department?: string;
  popularity?: number;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  try {
    const url = `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(
      query,
    )}&include_adult=false&language=en-US&page=1`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const data = (await response.json()) as { results?: TMDBArtistResult[] };

    const results = (data.results || [])
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, 8)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        profile_url: artist.profile_path
          ? `https://image.tmdb.org/t/p/w185${artist.profile_path}`
          : null,
        known_for_department: artist.known_for_department || "",
      }));

    return NextResponse.json({ results }, { status: 200 });
  } catch {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
