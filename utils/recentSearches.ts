import type { SearchKind } from "@/types/search";

export type RecentSearch = { query: string; kind: SearchKind };
const STORAGE_KEY = "twogether_recent_searches";

export function readRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((item): item is RecentSearch =>
      item && typeof item.query === "string" && item.query.trim().length > 0 && item.query.length <= 200
      && ["all", "titles", "artists"].includes(item.kind),
    ).slice(0, 6);
  } catch { return []; }
}

export function saveRecentSearch(query: string, kind: SearchKind) {
  const cleanQuery = query.trim().slice(0, 200);
  if (!cleanQuery) return;
  const next = [{ query: cleanQuery, kind }, ...readRecentSearches().filter(item =>
    item.kind !== kind || item.query.toLowerCase() !== cleanQuery.toLowerCase(),
  )].slice(0, 6);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Search works without storage. */ }
}

export function clearRecentSearches() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be disabled. */ }
}
