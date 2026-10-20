import { NextRequest, NextResponse } from "next/server";
import type { SearchSuggestion } from "@/types/search";

const BASE_URL = "https://api.themoviedb.org/3";
// Typeahead should be fresh, but a short cache protects TMDB during repeated queries.
const SEARCH_SUGGESTIONS_CACHE_SECONDS = 600; // 10 minutes
const suggestionCache = new Map<string, { results: SearchSuggestion[]; expires: number }>();

function suggestionsResponse(results: SearchSuggestion[]) {
  return NextResponse.json({ results }, {
    headers: { "Cache-Control": `public, max-age=${SEARCH_SUGGESTIONS_CACHE_SECONDS}, stale-while-revalidate=60` },
  });
}

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
  adult?: boolean;
};

function relevance(label: string, query: string): number {
  const normalized = label.toLowerCase().replace(/\s+/g, " ").trim();
  const search = query.toLowerCase().replace(/\s+/g, " ").trim();
  if (normalized === search) return 100;
  if (normalized.startsWith(search)) return 80;
  if (normalized.split(" ").some((word) => word.startsWith(search))) return 60;
  if (normalized.includes(search)) return 40;
  return 0;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim().slice(0, 200);
  const kind = request.nextUrl.searchParams.get("kind") ?? "all";
  if (!["all", "titles", "artists"].includes(kind)) return NextResponse.json({ results: [] }, { status: 400 });

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ results: [] }, { status: 503 });
  const cacheKey = `${kind}:${query.toLowerCase().replace(/\s+/g, " ")}`;
  const cached = suggestionCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return suggestionsResponse(cached.results);

  try {
    const url = `${BASE_URL}/search/${kind === "artists" ? "person" : "multi"}?api_key=${apiKey}&query=${encodeURIComponent(
      query,
    )}&include_adult=false&language=en-US&page=1`;

    const response = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: SEARCH_SUGGESTIONS_CACHE_SECONDS },
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) {
      return NextResponse.json({ results: [] }, { status: 502 });
    }

    const data = (await response.json()) as { results?: MultiResult[] };

    const results = (data.results || [])
      .map((item) => kind === "artists" ? { ...item, media_type: "person" as const } : item)
      .filter((item) => !item.adult && (item.media_type === "movie" || item.media_type === "tv" || item.media_type === "person"))
      .filter((item) => kind !== "titles" || item.media_type !== "person")
      .sort((a, b) => relevance(b.title || b.name || "", query) - relevance(a.title || a.name || "", query) || (b.popularity ?? 0) - (a.popularity ?? 0))
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

    suggestionCache.delete(cacheKey);
    suggestionCache.set(cacheKey, { results, expires: Date.now() + SEARCH_SUGGESTIONS_CACHE_SECONDS * 1000 });
    if (suggestionCache.size > 200) suggestionCache.delete(suggestionCache.keys().next().value!);
    return suggestionsResponse(results);
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
