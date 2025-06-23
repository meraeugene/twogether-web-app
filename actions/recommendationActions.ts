"use server";

import { createClient } from "@/utils/supabase/server";
import { Recommendation } from "@/types/recommendation";
import { revalidatePath } from "next/cache";

export const getRecommendations = async (): Promise<
  Recommendation[] | null
> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations_flattened")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }

  return data;
};

export async function getRecommendationById(
  recommendation_id: string
): Promise<Recommendation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations_flattened")
    .select("*")
    .eq("recommendation_id", recommendation_id)
    .single<Recommendation>();

  if (error || !data) {
    console.error("Error fetching recommendation:", error);
    return null;
  }

  return data;
}

export async function getUserRecommendationsById(
  userId: string
): Promise<Recommendation[] | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations_flattened")
    .select("*")
    .eq("recommended_by->>id", userId) // JSON field query
    .order("created_at", { ascending: false }); // optional: latest first

  if (error || !data) {
    console.error("Error fetching recommendation:", error);
    return null;
  }

  return data as Recommendation[];
}

export async function deleteRecommendation(
  userId: string,
  recommendationId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("recommendations")
    .delete()
    .match({ id: recommendationId, user_id: userId }); // secure: only if user owns it

  if (error) {
    console.error("Error deleting recommendation:", error);
    throw new Error("Failed to delete recommendation");
  }

  revalidatePath("/my-recommendations");
  return { success: true };
}
