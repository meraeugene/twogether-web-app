"use client";

export const RECENT_WATCH_STORAGE_KEY = "twogether_recent_watch";
export const RECENT_WATCH_UPDATED_EVENT = "twogether:recent-watch-updated";

export type RecentWatchEntry = {
  tmdbId: number;
  title: string;
  href: string;
  posterUrl?: string;
  synopsis?: string;
  type: "movie" | "tv";
  year?: string;
  season?: number;
  episode?: number;
  serverIndex?: number;
  updatedAt: string;
};

export function getRecentWatch(): RecentWatchEntry | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(RECENT_WATCH_STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as RecentWatchEntry;
  } catch {
    return null;
  }
}

export function saveRecentWatch(entry: RecentWatchEntry) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(RECENT_WATCH_STORAGE_KEY, JSON.stringify(entry));
  window.dispatchEvent(new CustomEvent(RECENT_WATCH_UPDATED_EVENT));
}
