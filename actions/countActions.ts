"use server";

import { createClient } from "@/utils/supabase/server";

export const getTotalActiveUser = async () => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error("Failed to fetch total active users");

  return count ?? 0;
};
