"use server";

import { TMDBMovieReview } from "@/types/tmdbMovieReview";
import { createClient } from "@/utils/supabase/server";

export type ReviewActionResult = {
  message?: string;
  errors?: { comment?: string; rating?: string };
};

export async function createMovieReviewAction(
  formData: FormData,
  { userId, tmdbId }: { userId: string; tmdbId: number }
): Promise<ReviewActionResult> {
  const supabase = await createClient();

  const comment = String(formData.get("comment") ?? "").trim();
  const rating = Number(formData.get("rating"));

  const errors: ReviewActionResult["errors"] = {};
  if (!comment) errors.comment = "Please write a comment.";
  if (!rating || rating < 1 || rating > 10) {
    errors.rating = "Rating must be between 1 and 10.";
  }
  if (Object.keys(errors).length) return { errors };

  const { error } = await supabase.from("movie_reviews").insert({
    user_id: userId,
    tmdb_id: tmdbId,
    comment,
    rating,
  });

  if (error) return { message: error.message };

  return { message: "Review submitted successfully!" };
}

export async function getMovieReviews(
  tmdbId: number
): Promise<TMDBMovieReview[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("movie_reviews_with_users")
    .select("*")
    .eq("tmdb_id", tmdbId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching movie reviews:", error.message);
    return [];
  }

  return data || [];
}
