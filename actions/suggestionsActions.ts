"use server";

import { createClient } from "@/utils/supabase/server";
import { Recommendation } from "@/types/recommendation";

export async function getSuggestions(
  currentId: number,
  genres: string[]
): Promise<Recommendation[] | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations_flattened")
    .select("*")
    .neq("tmdb_id", currentId)
    .overlaps("genres", genres)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }

  return data || [];
}
