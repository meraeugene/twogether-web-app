"use server";

import { createClient } from "@/utils/supabase/server";
import type { InviteFeedItem, NotificationItem } from "@/types/notification";

function getRoomIdFromNotification(item: {
  metadata: Record<string, unknown> | null;
  link: string | null;
}) {
  const metadataRoomId = item.metadata?.["room_id"];
  if (typeof metadataRoomId === "string") return metadataRoomId;

  if (!item.link) return null;

  try {
    const parsed = new URL(item.link, "https://twogether.local");
    const segments = parsed.pathname.split("/").filter(Boolean);
    const roomIdIndex = segments.findIndex((segment) => segment === "watch-party");
    return roomIdIndex >= 0 ? (segments[roomIdIndex + 1] ?? null) : null;
  } catch {
    return null;
  }
}

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
  const inviteIds = [
    ...new Set(
      data
        .map((item) => item.metadata?.["invite_id"])
        .filter((inviteId): inviteId is string => typeof inviteId === "string"),
    ),
  ];
  const roomIds = [
    ...new Set(
      data
        .map((item) => getRoomIdFromNotification(item))
        .filter((roomId): roomId is string => Boolean(roomId)),
    ),
  ];
  let actorMap = new Map<
    string,
    { id: string; username: string; display_name: string | null; avatar_url: string | null }
  >();
  let inviteMap = new Map<
    string,
    { id: string; status: "pending" | "accepted" | "rejected" | "cancelled" }
  >();
  let roomMap = new Map<
    string,
    { id: string; movie_title: string; poster_url: string | null }
  >();

  if (actorIds.length) {
    const { data: actors, error: actorError } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url")
      .in("id", actorIds);

    if (actorError) throw new Error(actorError.message);
    actorMap = new Map((actors ?? []).map((actor) => [actor.id, actor]));
  }

  if (roomIds.length) {
    const { data: rooms, error: roomError } = await supabase
      .from("watch_party_rooms")
      .select("id, movie_title, poster_url")
      .in("id", roomIds);

    if (roomError) throw new Error(roomError.message);
    roomMap = new Map((rooms ?? []).map((room) => [room.id, room]));
  }

  if (inviteIds.length) {
    const { data: invites, error: inviteError } = await supabase
      .from("watch_party_invites")
      .select("id, status")
      .in("id", inviteIds);

    if (inviteError) throw new Error(inviteError.message);
    inviteMap = new Map((invites ?? []).map((invite) => [invite.id, invite]));
  }

  return data.map((item) => ({
    ...item,
    actor: item.actor_user_id ? actorMap.get(item.actor_user_id) ?? null : null,
    movie: (() => {
      const roomId = getRoomIdFromNotification(item);
      const room = roomId ? roomMap.get(roomId) ?? null : null;
      const metadataTitle = item.metadata?.["movie_title"];

      return {
        room_id: roomId,
        title:
          room?.movie_title ??
          (typeof metadataTitle === "string" ? metadataTitle : item.body),
        poster_url: room?.poster_url ?? null,
        };
    })(),
    invite_status: (() => {
      const inviteId = item.metadata?.["invite_id"];
      return typeof inviteId === "string"
        ? (inviteMap.get(inviteId)?.status ?? null)
        : null;
    })(),
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

export async function getWatchPartyInviteFeed(
  userId: string,
  direction: "sent" | "received",
  limit = 25,
) {
  const supabase = await createClient();
  const userColumn = direction === "sent" ? "inviter_id" : "invitee_id";

  const { data, error } = await supabase
    .from("watch_party_invites")
    .select("id, room_id, inviter_id, invitee_id, status, created_at, responded_at")
    .eq(userColumn, userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!data?.length) return [] as InviteFeedItem[];

  const counterpartIds = [
    ...new Set(
      data.map((item) =>
        direction === "sent" ? item.invitee_id : item.inviter_id,
      ),
    ),
  ];
  const roomIds = [...new Set(data.map((item) => item.room_id))];

  const [{ data: users, error: usersError }, { data: rooms, error: roomsError }] =
    await Promise.all([
      supabase
        .from("users")
        .select("id, username, display_name, avatar_url")
        .in("id", counterpartIds),
      supabase
        .from("watch_party_rooms")
        .select("id, movie_title, poster_url")
        .in("id", roomIds),
    ]);

  if (usersError) throw new Error(usersError.message);
  if (roomsError) throw new Error(roomsError.message);

  const userMap = new Map((users ?? []).map((user) => [user.id, user]));
  const roomMap = new Map((rooms ?? []).map((room) => [room.id, room]));

  return data.map((item) => {
    const counterpartId =
      direction === "sent" ? item.invitee_id : item.inviter_id;
    const room = roomMap.get(item.room_id);

    return {
      id: item.id,
      room_id: item.room_id,
      status: item.status,
      created_at: item.created_at,
      responded_at: item.responded_at,
      room_link: `/watch-party/${item.room_id}?invite=${item.id}`,
      movie: {
        title: room?.movie_title ?? "Watch Party",
        poster_url: room?.poster_url ?? null,
      },
      counterpart: userMap.get(counterpartId) ?? null,
    };
  }) as InviteFeedItem[];
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
