"use server";

import { getCurrentUser } from "@/actions/authActions";
import { createClient } from "@/utils/supabase/server";
import { Recommendation } from "@/types/recommendation";
import { revalidatePath } from "next/cache";
import { WatchlistMetadata } from "@/types/watchlist";

// Fetch watchlist by user ID
export async function getWatchlistByUserId(
  userId: string
): Promise<Recommendation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlist_flattened")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }

  return data || [];
}

export async function getMyWatchlist(): Promise<{
  userId: string;
  items: Recommendation[];
} | null> {
  const user = await getCurrentUser();

  if (!user) return null;

  const items = await getWatchlistByUserId(user.id);

  return {
    userId: user.id,
    items,
  };
}

// Check if a recommendation is in the watchlist
export async function checkIfInWatchlist(
  tmdbid: number,
  currentUserId: string
) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("watchlist_flattened")
    .select("id")
    .eq("user_id", currentUserId)
    .eq("tmdb_id", tmdbid)
    .maybeSingle();

  return {
    inWatchlist: !!data,
    id: data?.id || null,
  };
}

// Add to watchlist
export async function addToWatchlist(
  recommendationId: string,
  currentUserId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlist_items")
    .insert({
      user_id: currentUserId,
      recommendation_id: recommendationId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/watchlist");

  return data.id;
}

// Remove from watchlist
export async function removeFromWatchlist(id: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .match({ id, user_id: userId });

  if (error) throw new Error(error.message);

  revalidatePath("/watchlist");

  return true;
}

// IF ITS A AI GENERATED OR A SEARCH MOVIE
export async function addToWatchlistWithMetadata(
  currentUserId: string,
  metadata: WatchlistMetadata
) {
  const supabase = await createClient();
  const watchlistPayload = {
    tmdb_id: metadata.tmdb_id,
    title: metadata.title,
    poster_url: metadata.poster_url,
    type: metadata.type,
    stream_url: metadata.stream_url,
    year: metadata.year,
    duration: metadata.duration,
    synopsis: metadata.synopsis,
    genres: metadata.genres,
    seasons: metadata.seasons,
    episodes: metadata.episodes,
    episode_titles_per_season: metadata.episode_titles_per_season,
  };

  const { data, error } = await supabase
    .from("watchlist_items")
    .insert({
      user_id: currentUserId,
      recommendation_id: null,
      ...watchlistPayload,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/watchlist");

  return data.id;
}
