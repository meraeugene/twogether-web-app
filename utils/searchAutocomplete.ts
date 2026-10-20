import type { SearchKind, SearchSuggestion } from "@/types/search";
import { getSlugFromTitle } from "@/utils/ai-recommend/getSlugFromTitle";

const CACHE_TTL = 5 * 60 * 1000;
const MAX_ENTRIES = 80;
const cache = new Map<string, { items: SearchSuggestion[]; expires: number }>();

export function searchCacheKey(query: string, kind: SearchKind): string {
  return `${kind}:${query.trim().toLowerCase().replace(/\s+/g, " ")}`;
}

export function cachedSuggestions(query: string, kind: SearchKind): SearchSuggestion[] | undefined {
  const entry = cache.get(searchCacheKey(query, kind));
  return entry && entry.expires > Date.now() ? entry.items : undefined;
}

export async function loadSearchSuggestions(query: string, kind: SearchKind, signal: AbortSignal): Promise<SearchSuggestion[]> {
  const existing = cachedSuggestions(query, kind);
  if (existing) return existing;
  const params = new URLSearchParams({ query: query.trim(), kind, v: "2" });
  const response = await fetch(`/api/tmdb/search/suggestions?${params}`, { signal });
  if (!response.ok) throw new Error("Suggestions unavailable");
  const data = await response.json() as { results?: SearchSuggestion[] };
  if (signal.aborted) throw new DOMException("Search cancelled", "AbortError");
  const items = Array.isArray(data.results) ? data.results.slice(0, 10) : [];
  const key = searchCacheKey(query, kind);
  cache.delete(key);
  cache.set(key, { items, expires: Date.now() + CACHE_TTL });
  if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value!);
  return items;
}

export function suggestionHref(suggestion: SearchSuggestion): string {
  if (suggestion.category === "person") return `/search/${encodeURIComponent(suggestion.label)}?artist=${suggestion.id}`;
  const slug = getSlugFromTitle(suggestion.label);
  return `/tmdb/watch/${suggestion.category}/${suggestion.id}/${slug}`;
}
