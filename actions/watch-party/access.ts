import { createClient } from "@/utils/supabase/server";
import type { WatchPartyRoom } from "@/types/watchParty";

export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function areFriends(
  supabase: ServerSupabaseClient,
  userA: string,
  userB: string,
) {
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id")
    .or(
      `and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`,
    )
    .eq("status", "accepted")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
}

export async function canAccessRoom(
  supabase: ServerSupabaseClient,
  room: Pick<WatchPartyRoom, "id" | "host_user_id" | "guest_user_id"> & {
    access_type?: "public" | "private" | null;
  },
  userId: string,
) {
  if (room.host_user_id === userId || room.guest_user_id === userId) {
    return true;
  }

  if ((room.access_type ?? "public") === "public") {
    return true;
  }

  return areFriends(supabase, room.host_user_id, userId);
}

export function formatPrivateRoomJoinError() {
  return "This private party is only open to the host's friends. Add each other first, then try the code again.";
}

export function formatActiveRoomConflictError(movieTitle?: string | null) {
  return movieTitle
    ? `You are already in "${movieTitle}". Leave that room first before joining or creating another one.`
    : "You are already in another watch party. Leave that room first before joining or creating another one.";
}

export async function getExistingActiveRoomForUser(
  supabase: ServerSupabaseClient,
  userId: string,
) {
  const recentThresholdIso = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data: ownedRoom, error: ownedRoomError } = await supabase
    .from("watch_party_rooms")
    .select("id")
    .or(`host_user_id.eq.${userId},guest_user_id.eq.${userId}`)
    .in("status", ["pending", "active"])
    .order("last_activity_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ownedRoomError) throw new Error(ownedRoomError.message);
  if (ownedRoom) return ownedRoom;

  const { data: recentPresence, error: presenceError } = await supabase
    .from("watch_party_presence")
    .select("room_id, last_seen")
    .eq("user_id", userId)
    .eq("is_online", true)
    .gt("last_seen", recentThresholdIso)
    .order("last_seen", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (presenceError) throw new Error(presenceError.message);
  if (!recentPresence?.room_id) return null;

  const { data: activeRoom, error: activeRoomError } = await supabase
    .from("watch_party_rooms")
    .select("id")
    .eq("id", recentPresence.room_id)
    .in("status", ["pending", "active"])
    .maybeSingle();

  if (activeRoomError) throw new Error(activeRoomError.message);
  return activeRoom;
}

export async function getAcceptedFriendIds(
  supabase: ServerSupabaseClient,
  userId: string,
) {
  const [{ data: receivedRaw }, { data: sentRaw }] = await Promise.all([
    supabase
      .from("friend_requests")
      .select("sender_id")
      .eq("receiver_id", userId)
      .eq("status", "accepted"),
    supabase
      .from("friend_requests")
      .select("receiver_id")
      .eq("sender_id", userId)
      .eq("status", "accepted"),
  ]);

  return [
    ...(receivedRaw ?? []).map((row) => row.sender_id),
    ...(sentRaw ?? []).map((row) => row.receiver_id),
  ] as string[];
}
