"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitFeedback(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const text = formData.get("text")?.toString().trim();

  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  if (!text) {
    return { error: "Feedback is required." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("testimonials")
    .insert([{ name, text }]);

  if (error) {
    console.error("Submit error:", error);
    return { error: "Something went wrong. Try again later." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function getTestimonials() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, text, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  const enriched = data?.map((d) => ({
    ...d,
    is_new: Date.now() - new Date(d.created_at).getTime() < 1 * 60 * 1000,
  }));

  return enriched;
}
