"use server";

import { createClient } from "@/utils/supabase/server";
import { Recommendation } from "@/types/recommendation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./authActions";

interface RecommendationFormData {
  title: string;
  comment: string;
  poster_url?: string;
  tmdb_id: number;
  type: "movie" | "tv";
  stream_url: string[];
  year?: string;
  duration?: number;
  genres?: string[];
  visibility?: "public" | "private";
  synopsis?: string;
  seasons?: number | null;
  episodes?: number | null;
  episode_titles_per_season?: Record<
    number,
    { episode_number: number; title: string }[]
  >;
  rating: number;
}

export const createRecommendation = async (form: RecommendationFormData) => {
  const supabase = await createClient();

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("recommendations").insert({
    user_id: user.id,
    ...form,
  });

  return { error };
};

export const getRecommendations = async (): Promise<
  Recommendation[] | null
> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations_flattened")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(18);

  if (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }

  return data;
};

export async function getRecommendationById(
  tmdbId: number
): Promise<Recommendation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations_flattened")
    .select("*")
    .eq("tmdb_id", tmdbId)
    .single<Recommendation>();

  if (error || !data) {
    console.error("Error fetching recommendation:", error);
    return null;
  }

  return data;
}
export async function getMyRecommendations(userId: string): Promise<{
  public: Recommendation[];
  private: Recommendation[];
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations_flattened")
    .select("*")
    .eq("recommended_by->>id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching recommendation:", error);
    return { public: [], private: [] };
  }

  return {
    public: data.filter((item) => item.visibility === "public"),
    private: data.filter((item) => item.visibility === "private"),
  };
}

export async function getUserRecommendationsById(
  userId: string
): Promise<Recommendation[] | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations_flattened")
    .select("*")
    .eq("recommended_by->>id", userId) // JSON field query
    .eq("visibility", "public")
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

export async function toggleRecommendationVisibility(
  userId: string,
  recommendationId: string,
  visibility: "public" | "friends" | "private"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("recommendations")
    .update({ visibility })
    .eq("id", recommendationId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to toggle visibility:", error);
    throw new Error("Failed to toggle visibility");
  }

  revalidatePath("/my-recommendations");
  return { success: true };
}

export async function hasUserRecommendedFilm(
  userId: string,
  tmdbId: number
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations")
    .select("id")
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId);

  if (error) {
    console.error("Error checking recommendation:", error);
    return false;
  }

  return !!data?.length;
}
