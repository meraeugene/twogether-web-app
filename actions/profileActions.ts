"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData, username: string) {
  const supabase = await createClient();

  const fields = [
    "username",
    "display_name",
    "avatar_url",
    "bio",
    "relationship_status",
    "prefers",
  ];
  const updates: Record<string, string | string[]> = {};

  fields.forEach((field) => {
    const value = formData.get(field);
    if (value !== null) updates[field] = value.toString();
  });

  updates.social_intent = formData.getAll("social_intent").map(String);
  updates.favorite_genres = formData.getAll("favorite_genres").map(String);
  updates.favorite_moods = formData.getAll("favorite_moods").map(String);

  const { error: updateError } = await supabase
    .from("users")
    .update(updates)
    .eq("username", username);

  if (updateError) return { error: updateError.message };

  revalidatePath("/profile");
  return { success: true };
}
