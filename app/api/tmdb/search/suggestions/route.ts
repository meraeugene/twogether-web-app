import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";

function formatDepartment(department?: string) {
  switch ((department || "").toLowerCase()) {
    case "acting":
      return "Actor/Actress";
    case "directing":
      return "Director";
    case "writing":
      return "Writer";
    case "production":
      return "Producer";
    case "camera":
      return "Cinematographer";
    case "editing":
      return "Editor";
    case "art":
      return "Art Department";
    default:
      return department || "Artist";
  }
}

type MultiResult = {
  id: number;
  media_type: "movie" | "tv" | "person";
  name?: string;
  title?: string;
  profile_path?: string | null;
  poster_path?: string | null;
  known_for_department?: string;
  release_date?: string;
  first_air_date?: string;
  popularity?: number;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  try {
    const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
      query,
    )}&include_adult=false&language=en-US&page=1`;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const data = (await response.json()) as { results?: MultiResult[] };

    const results = (data.results || [])
      .filter((item) => item.media_type === "movie" || item.media_type === "tv" || item.media_type === "person")
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, 10)
      .map((item) => {
        const label = item.title || item.name || "Untitled";
        const year =
          item.media_type === "movie"
            ? item.release_date?.slice(0, 4)
            : item.media_type === "tv"
              ? item.first_air_date?.slice(0, 4)
              : "";

        return {
          id: item.id,
          label,
          category: item.media_type,
          subtitle:
            item.media_type === "person"
              ? formatDepartment(item.known_for_department)
              : year || item.media_type.toUpperCase(),
          image_url:
            item.media_type === "person"
              ? item.profile_path
                ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                : null
              : item.poster_path
                ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                : null,
        };
      });

    return NextResponse.json({ results }, { status: 200 });
  } catch {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
