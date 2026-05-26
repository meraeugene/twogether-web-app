"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { CURRENT_USER_COOKIE } from "@/utils/currentUserSnapshot";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteAccount(
  confirmation: string,
): Promise<{ error?: string } | void> {
  if (confirmation !== "DELETE") {
    return { error: "Type DELETE to confirm account deletion." };
  }

  const supabase = await createClient();
  const cookieStore = await cookies();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You need to be signed in to delete your account." };
  }

  const admin = createAdminClient();

  if (!admin) {
    return {
      error:
        "Account deletion is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY on the server.",
    };
  }

  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteAuthError) {
    return { error: deleteAuthError.message };
  }

  await admin.from("users").delete().eq("id", user.id);
  await supabase.auth.signOut();

  cookieStore.set(CURRENT_USER_COOKIE, "", {
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  revalidatePath("/", "layout");
  redirect("/");
}
