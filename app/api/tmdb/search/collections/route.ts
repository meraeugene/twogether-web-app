import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

type CollectionResult = {
  id: number;
  name: string;
  poster_path?: string | null;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  try {
    const url = `${BASE_URL}/search/collection?api_key=${API_KEY}&query=${encodeURIComponent(
      query,
    )}&language=en-US&page=1`;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const data = (await response.json()) as { results?: CollectionResult[] };

    const results = (data.results || []).slice(0, 10).map((item) => ({
      id: item.id,
      label: item.name,
      category: "collection",
      subtitle: "Collection",
      image_url: item.poster_path
        ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
        : null,
    }));

    return NextResponse.json({ results }, { status: 200 });
  } catch {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
