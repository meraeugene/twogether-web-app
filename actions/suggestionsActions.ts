"use server";

import { createClient } from "@/utils/supabase/server";
import { Recommendation } from "@/types/recommendation";
import { getCurrentUser } from "./authActions";

export async function getSuggestions(
  currentId: string,
  genres: string[]
): Promise<Recommendation[] | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations_flattened")
    .select("*")
    .neq("recommendation_id", currentId)
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
