"use server";

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

  const { data, error } = await supabase
    .from("watchlist_items")
    .insert({
      user_id: currentUserId,
      recommendation_id: null,
      ...metadata,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/watchlist");

  return data.id;
}
