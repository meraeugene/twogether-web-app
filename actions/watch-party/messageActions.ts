"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { WatchPartyMessage } from "@/types/watchParty";
import { getWatchPartyRoom } from "./roomActions";

export async function getWatchPartyMessages(roomId: string, userId: string) {
  const supabase = await createClient();
  const room = await getWatchPartyRoom(roomId, userId);
  if (!room) throw new Error("Room not found.");

  const { data, error } = await supabase
    .from("watch_party_messages")
    .select("id, room_id, sender_id, content, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const senderIds = [...new Set((data ?? []).map((message) => message.sender_id))];
  let senderMap = new Map<
    string,
    { id: string; username: string; display_name: string | null; avatar_url: string | null }
  >();

  if (senderIds.length) {
    const { data: senders } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url")
      .in("id", senderIds);

    senderMap = new Map((senders ?? []).map((sender) => [sender.id, sender]));
  }

  return (data ?? []).map((message) => ({
    ...(message as WatchPartyMessage),
    sender: senderMap.get(message.sender_id) ?? null,
  }));
}

export async function sendWatchPartyMessage(input: {
  roomId: string;
  senderId: string;
  content: string;
}) {
  const supabase = await createClient();
  const trimmed = input.content.trim();
  if (!trimmed) return { success: true };

  const room = await getWatchPartyRoom(input.roomId, input.senderId);
  if (!room) throw new Error("Room not found.");

  const { error: insertError } = await supabase.from("watch_party_messages").insert({
    room_id: input.roomId,
    sender_id: input.senderId,
    content: trimmed,
  });

  if (insertError) throw new Error(insertError.message);

  const { error: roomError } = await supabase
    .from("watch_party_rooms")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", input.roomId);

  if (roomError) throw new Error(roomError.message);

  revalidatePath("/");
  return { success: true };
}

export async function updateWatchPartyPresence(input: {
  roomId: string;
  userId: string;
  isOnline: boolean;
}) {
  const supabase = await createClient();
  const room = await getWatchPartyRoom(input.roomId, input.userId);
  if (!room) {
    return { success: true, roomMissing: true };
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabase.from("watch_party_presence").upsert(
    {
      room_id: input.roomId,
      user_id: input.userId,
      is_online: input.isOnline,
      last_seen: nowIso,
    },
    { onConflict: "room_id,user_id" },
  );

  if (error) throw new Error(error.message);

  await supabase
    .from("watch_party_rooms")
    .update({ last_activity_at: nowIso })
    .eq("id", input.roomId);

  revalidatePath("/");
  return { success: true, roomMissing: false };
}
