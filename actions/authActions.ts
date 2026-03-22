"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CURRENT_USER_COOKIE } from "@/utils/currentUserSnapshot";

export const getCurrentUser = async () => {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const user = authData.user;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || null,
    full_name: user.user_metadata?.full_name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    username: profile.username,
  };
};

export async function getUserByUsername(username: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

export const signOut = async () => {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Optional: check if user exists before signing out
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/"); // Still redirect, but gracefully
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout failed:", error.message);
    return;
  }

  cookieStore.set(CURRENT_USER_COOKIE, "", {
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  revalidatePath("/", "layout");

  redirect("/");
};
