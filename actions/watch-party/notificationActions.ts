"use server";

import { createClient } from "@/utils/supabase/server";
import type { NotificationItem } from "@/types/notification";

export async function getUserNotifications(userId: string, limit = 25) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, recipient_user_id, actor_user_id, type, title, body, link, metadata, is_read, created_at",
    )
    .eq("recipient_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!data?.length) return [] as NotificationItem[];

  const actorIds = [...new Set(data.map((item) => item.actor_user_id).filter(Boolean))] as string[];
  let actorMap = new Map<
    string,
    { id: string; username: string; display_name: string | null; avatar_url: string | null }
  >();

  if (actorIds.length) {
    const { data: actors, error: actorError } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url")
      .in("id", actorIds);

    if (actorError) throw new Error(actorError.message);
    actorMap = new Map((actors ?? []).map((actor) => [actor.id, actor]));
  }

  return data.map((item) => ({
    ...item,
    actor: item.actor_user_id ? actorMap.get(item.actor_user_id) ?? null : null,
  })) as NotificationItem[];
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("recipient_user_id", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return { success: true };
}
