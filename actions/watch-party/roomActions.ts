"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { WatchPartyRoom, WatchingNowItem } from "@/types/watchParty";
import {
  canAccessRoom,
  formatPrivateRoomJoinError,
  getAcceptedFriendIds,
  getExistingActiveRoomForUser,
  slugify,
} from "./access";

export async function createWatchPartyRoom(input: {
  hostUserId: string;
  movieTmdbId: number;
  movieTitle: string;
  movieType: "movie" | "tv";
  streamUrl: string;
  posterUrl?: string | null;
  accessType: "public" | "private";
}) {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const movieSlug = slugify(input.movieTitle);

  const existingRoom = await getExistingActiveRoomForUser(
    supabase,
    input.hostUserId,
  );

  if (existingRoom) {
    const [{ data: existingRoomData, error: existingRoomError }, { data: hostPresence }] =
      await Promise.all([
        supabase
          .from("watch_party_rooms")
          .select("id, host_user_id, guest_user_id")
          .eq("id", existingRoom.id)
          .maybeSingle(),
        supabase
          .from("watch_party_presence")
          .select("is_online, last_seen")
          .eq("room_id", existingRoom.id)
          .eq("user_id", input.hostUserId)
          .maybeSingle(),
      ]);

    if (existingRoomError) throw new Error(existingRoomError.message);

    const hostRecentlySeen =
      hostPresence?.last_seen &&
      new Date(hostPresence.last_seen).getTime() > Date.now() - 90_000;

    if (
      existingRoomData &&
      existingRoomData.host_user_id === input.hostUserId &&
      !existingRoomData.guest_user_id &&
      !hostPresence?.is_online &&
      !hostRecentlySeen
    ) {
      const { error: staleDeleteError } = await supabase
        .from("watch_party_rooms")
        .delete()
        .eq("id", existingRoom.id);

      if (staleDeleteError) throw new Error(staleDeleteError.message);
    } else {
      throw new Error(
        "You already have an active watch party. Leave your current room before creating another one.",
      );
    }
  }

  const { data: room, error } = await supabase
    .from("watch_party_rooms")
    .insert({
      host_user_id: input.hostUserId,
      guest_user_id: null,
      movie_tmdb_id: input.movieTmdbId,
      movie_title: input.movieTitle,
      movie_slug: movieSlug,
      movie_type: input.movieType,
      stream_url: input.streamUrl,
      poster_url: input.posterUrl ?? null,
      access_type: input.accessType,
      status: "pending",
      last_activity_at: nowIso,
      playback_seconds: 0,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/watch-party");
  return { roomId: room.id };
}

export async function getWatchPartyRoom(roomId: string, userId: string) {
  const supabase = await createClient();
  const { data: room, error: roomError } = await supabase
    .from("watch_party_rooms")
    .select("*")
    .eq("id", roomId)
    .maybeSingle();

  if (roomError) throw new Error(roomError.message);
  if (!room) return null;

  const hasAccess = await canAccessRoom(supabase, room as WatchPartyRoom, userId);
  if (!hasAccess) return null;

  const recentPresenceThreshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const [profilesResult, presenceResult] = await Promise.all([
    supabase
      .from("users")
      .select("id, username, display_name, avatar_url")
      .in("id", [room.host_user_id, room.guest_user_id].filter(Boolean) as string[]),
    supabase
      .from("watch_party_presence")
      .select("user_id, is_online, last_seen")
      .eq("room_id", roomId)
      .eq("is_online", true)
      .gt("last_seen", recentPresenceThreshold),
  ]);

  const profiles = profilesResult.data ?? [];
  const presenceRows = presenceResult.data ?? [];
  const presenceUserIds = [
    ...new Set(presenceRows.map((row) => row.user_id).filter(Boolean)),
  ] as string[];

  let viewers = profiles.filter((profile) => presenceUserIds.includes(profile.id));

  if (presenceUserIds.length > profiles.length) {
    const missingViewerIds = presenceUserIds.filter(
      (id) => !profiles.some((profile) => profile.id === id),
    );

    if (missingViewerIds.length) {
      const { data: extraProfiles } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url")
        .in("id", missingViewerIds);

      viewers = [...viewers, ...(extraProfiles ?? [])];
    }
  }

  return {
    ...(room as WatchPartyRoom),
    host: profiles.find((profile) => profile.id === room.host_user_id) ?? null,
    guest: room.guest_user_id
      ? profiles.find((profile) => profile.id === room.guest_user_id) ?? null
      : null,
    viewers,
    viewer_count: viewers.length,
  };
}

export async function joinWatchPartyByCode(input: {
  userId: string;
  code: string;
}) {
  const supabase = await createClient();
  const normalized = input.code.trim().toLowerCase();
  const roomCode = normalized.replace(/[^a-f0-9-]/g, "");

  if (!normalized) throw new Error("Room code is required.");

  const { data: rooms, error } = await supabase
    .from("watch_party_rooms")
    .select("*")
    .in("status", ["pending", "active"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  const room = (rooms ?? []).find((candidate) => {
    const id = String(candidate.id).toLowerCase();
    return id === roomCode || id.replace(/-/g, "").startsWith(roomCode);
  });

  if (!room) throw new Error("Room code not found.");

  const hasAccess = await canAccessRoom(supabase, room as WatchPartyRoom, input.userId);
  if (!hasAccess) throw new Error(formatPrivateRoomJoinError());

  if (room.host_user_id === input.userId || room.guest_user_id === input.userId) {
    return { roomId: room.id };
  }

  const nowIso = new Date().toISOString();
  if (!room.guest_user_id) {
    const { error: joinError } = await supabase
      .from("watch_party_rooms")
      .update({
        guest_user_id: input.userId,
        status: "active",
        started_at: room.started_at ?? nowIso,
        last_activity_at: nowIso,
      })
      .eq("id", room.id)
      .is("guest_user_id", null);

    if (joinError) throw new Error(joinError.message);
  } else {
    const { error: roomTouchError } = await supabase
      .from("watch_party_rooms")
      .update({
        status: "active",
        started_at: room.started_at ?? nowIso,
        last_activity_at: nowIso,
      })
      .eq("id", room.id);

    if (roomTouchError) throw new Error(roomTouchError.message);
  }

  return { roomId: room.id };
}

export async function getWatchingNowRooms(limit = 10, userId?: string) {
  const supabase = await createClient();
  const thresholdIso = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data: presenceRows, error: presenceError } = await supabase
    .from("watch_party_presence")
    .select("room_id, user_id, is_online, last_seen")
    .eq("is_online", true)
    .gt("last_seen", thresholdIso);

  if (presenceError) throw new Error(presenceError.message);
  if (!presenceRows?.length) return [] as WatchingNowItem[];

  const roomIds = [...new Set(presenceRows.map((row) => row.room_id))];
  const userIds = [...new Set(presenceRows.map((row) => row.user_id))];

  const [{ data: rooms, error: roomError }, { data: users, error: usersError }] =
    await Promise.all([
      supabase
        .from("watch_party_rooms")
        .select(
          "id, host_user_id, movie_title, movie_slug, movie_type, movie_tmdb_id, poster_url, status, access_type",
        )
        .in("id", roomIds)
        .in("status", ["pending", "active"]),
      supabase
        .from("users")
        .select("id, username, display_name, avatar_url")
        .in("id", userIds),
    ]);

  if (roomError) throw new Error(roomError.message);
  if (usersError) throw new Error(usersError.message);

  const allowedPrivateHostIds = new Set<string>(
    userId ? [userId, ...(await getAcceptedFriendIds(supabase, userId))] : [],
  );

  const roomMap = new Map((rooms ?? []).map((room) => [room.id, room]));
  const userMap = new Map((users ?? []).map((user) => [user.id, user]));
  const grouped = new Map<string, WatchingNowItem>();

  for (const row of presenceRows) {
    const room = roomMap.get(row.room_id);
    const user = userMap.get(row.user_id);
    if (!room || !user) continue;

    if (!grouped.has(row.room_id)) {
      grouped.set(row.room_id, {
        room_id: row.room_id,
        movie_title: room.movie_title,
        movie_slug: room.movie_slug,
        movie_type: room.movie_type,
        movie_tmdb_id: room.movie_tmdb_id,
        poster_url: room.poster_url ?? null,
        access_type: (room.access_type ?? "public") as "public" | "private",
        is_accessible:
          (room.access_type ?? "public") === "public" ||
          (!!userId && allowedPrivateHostIds.has(room.host_user_id)),
        watching_users: [],
        watching_count: 0,
      });
    }

    const item = grouped.get(row.room_id)!;
    item.watching_users.push(user);
    item.watching_count = item.watching_users.length;
  }

  return [...grouped.values()]
    .sort((a, b) => b.watching_count - a.watching_count)
    .slice(0, limit);
}

export async function leaveWatchPartyRoom(input: {
  roomId: string;
  userId: string;
}) {
  const supabase = await createClient();
  const room = await getWatchPartyRoom(input.roomId, input.userId);
  if (!room) throw new Error("Room not found.");

  const nowIso = new Date().toISOString();
  const otherUserId =
    room.host_user_id === input.userId ? room.guest_user_id : room.host_user_id;

  const { error: presenceError } = await supabase
    .from("watch_party_presence")
    .upsert(
      {
        room_id: input.roomId,
        user_id: input.userId,
        is_online: false,
        last_seen: nowIso,
      },
      { onConflict: "room_id,user_id" },
    );

  if (presenceError) throw new Error(presenceError.message);

  if (room.host_user_id !== input.userId && room.guest_user_id !== input.userId) {
    revalidatePath("/");
    revalidatePath("/watch-party");
    return { success: true, deleted: false };
  }

  let otherIsOnline = false;
  if (otherUserId) {
    const { data: otherPresence, error: otherPresenceError } = await supabase
      .from("watch_party_presence")
      .select("is_online, last_seen")
      .eq("room_id", input.roomId)
      .eq("user_id", otherUserId)
      .maybeSingle();

    if (otherPresenceError) throw new Error(otherPresenceError.message);

    const recentlySeen =
      otherPresence?.last_seen &&
      new Date(otherPresence.last_seen).getTime() > Date.now() - 90_000;

    otherIsOnline = Boolean(otherPresence?.is_online && recentlySeen);
  }

  if (!otherIsOnline) {
    const { error: deleteRoomError } = await supabase
      .from("watch_party_rooms")
      .delete()
      .eq("id", input.roomId);

    if (deleteRoomError) throw new Error(deleteRoomError.message);

    revalidatePath("/");
    return { success: true, deleted: true };
  }

  if (room.host_user_id === input.userId) {
    const { error: promoteError } = await supabase
      .from("watch_party_rooms")
      .update({
        host_user_id: otherUserId,
        guest_user_id: null,
        status: "pending",
        last_activity_at: nowIso,
      })
      .eq("id", input.roomId);

    if (promoteError) throw new Error(promoteError.message);
  } else if (room.guest_user_id === input.userId) {
    const { error: guestLeaveError } = await supabase
      .from("watch_party_rooms")
      .update({
        guest_user_id: null,
        status: "pending",
        last_activity_at: nowIso,
      })
      .eq("id", input.roomId);

    if (guestLeaveError) throw new Error(guestLeaveError.message);
  }

  revalidatePath("/");
  return { success: true, deleted: false };
}

export async function updateWatchPartyPlayback(input: {
  roomId: string;
  userId: string;
  seconds: number;
}) {
  const supabase = await createClient();
  const room = await getWatchPartyRoom(input.roomId, input.userId);
  if (!room) throw new Error("Room not found.");
  if (room.host_user_id !== input.userId) {
    throw new Error("Only the host can update playback sync.");
  }

  const nowIso = new Date().toISOString();
  const nextSeconds = Math.max(0, Math.floor(input.seconds));

  const { error } = await supabase
    .from("watch_party_rooms")
    .update({
      started_at: room.started_at ?? nowIso,
      status: room.status === "pending" ? "active" : room.status,
      playback_started_at: room.playback_started_at ?? nowIso,
      playback_seconds: nextSeconds,
      playback_updated_at: nowIso,
      last_activity_at: nowIso,
    })
    .eq("id", input.roomId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/watch-party/${input.roomId}`);
  return {
    success: true,
    playback_seconds: nextSeconds,
    playback_updated_at: nowIso,
    playback_started_at: room.playback_started_at ?? nowIso,
  };
}
