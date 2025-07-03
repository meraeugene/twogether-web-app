"use server";

import { createClient } from "@/utils/supabase/server";
import { Recommendation } from "@/types/recommendation";
import { getCurrentUser } from "./authActions";
import { revalidatePath } from "next/cache";
import { match } from "assert";

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
  currentUserId: string,
  filmId: string
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

  revalidatePath(`/watch/${filmId}`);
  return data.id;
}

// Remove from watchlist
export async function removeFromWatchlist(
  id: string,
  userId: string,
  filmId?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .match({ id, user_id: userId }); // secure: only if user owns it

  if (error) throw new Error(error.message);
  revalidatePath(`/watch/${filmId}`);
  revalidatePath("/watchlist");
  return true;
}
