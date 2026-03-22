"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { WatchPartyRoom, WatchingNowItem } from "@/types/watchParty";
import {
  canAccessRoom,
  formatActiveRoomConflictError,
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
    const [
      { data: existingRoomData, error: existingRoomError },
      { data: hostPresence },
    ] = await Promise.all([
      supabase
        .from("watch_party_rooms")
        .select("id, host_user_id, guest_user_id, movie_title")
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
        formatActiveRoomConflictError(existingRoomData?.movie_title),
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

  const existingRoom = await getExistingActiveRoomForUser(supabase, userId);
  if (existingRoom && existingRoom.id !== roomId) {
    const { data: currentRoom, error: currentRoomError } = await supabase
      .from("watch_party_rooms")
      .select("movie_title")
      .eq("id", existingRoom.id)
      .maybeSingle();

    if (currentRoomError) throw new Error(currentRoomError.message);
    throw new Error(formatActiveRoomConflictError(currentRoom?.movie_title));
  }

  const hasAccess = await canAccessRoom(
    supabase,
    room as WatchPartyRoom,
    userId,
  );
  if (!hasAccess) return null;

  const recentPresenceThreshold = new Date(
    Date.now() - 2 * 60 * 1000,
  ).toISOString();
  const [profilesResult, presenceResult] = await Promise.all([
    supabase
      .from("users")
      .select("id, username, display_name, avatar_url")
      .in(
        "id",
        [room.host_user_id, room.guest_user_id].filter(Boolean) as string[],
      ),
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

  let viewers = profiles.filter((profile) =>
    presenceUserIds.includes(profile.id),
  );

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
      ? (profiles.find((profile) => profile.id === room.guest_user_id) ?? null)
      : null,
    viewers,
    viewer_count: viewers.length,
  };
}

export async function joinWatchPartyByCode(input: {
  userId: string;
  code: string;
  autoLeaveCurrentRoom?: boolean;
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

  const existingRoom = await getExistingActiveRoomForUser(
    supabase,
    input.userId,
  );
  if (existingRoom && existingRoom.id !== room.id) {
    if (input.autoLeaveCurrentRoom) {
      await leaveWatchPartyRoom({
        roomId: existingRoom.id,
        userId: input.userId,
      });
    } else {
      const { data: currentRoom, error: currentRoomError } = await supabase
        .from("watch_party_rooms")
        .select("movie_title")
        .eq("id", existingRoom.id)
        .maybeSingle();

      if (currentRoomError) throw new Error(currentRoomError.message);
      throw new Error(formatActiveRoomConflictError(currentRoom?.movie_title));
    }
  }

  const hasAccess = await canAccessRoom(
    supabase,
    room as WatchPartyRoom,
    input.userId,
  );
  if (!hasAccess) throw new Error(formatPrivateRoomJoinError());

  if (
    room.host_user_id === input.userId ||
    room.guest_user_id === input.userId
  ) {
    const acceptedAt = new Date().toISOString();
    await supabase
      .from("watch_party_invites")
      .update({
        status: "accepted",
        responded_at: acceptedAt,
      })
      .eq("room_id", room.id)
      .eq("invitee_id", input.userId)
      .eq("status", "pending");

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_user_id", input.userId)
      .eq("type", "watch_party_invite")
      .contains("metadata", { room_id: room.id });

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

  await supabase
    .from("watch_party_invites")
    .update({
      status: "accepted",
      responded_at: nowIso,
    })
    .eq("room_id", room.id)
    .eq("invitee_id", input.userId)
    .eq("status", "pending");

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_user_id", input.userId)
    .eq("type", "watch_party_invite")
    .contains("metadata", { room_id: room.id });

  return { roomId: room.id };
}

export async function getWatchingNowRooms(limit = 10, userId?: string) {
  const supabase = await createClient();
  const thresholdIso = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: rooms, error: roomError } = await supabase
    .from("watch_party_rooms")
    .select(
      "id, host_user_id, guest_user_id, movie_title, movie_slug, movie_type, movie_tmdb_id, poster_url, status, access_type",
    )
    .in("status", ["pending", "active"]);

  if (roomError) throw new Error(roomError.message);
  if (!rooms?.length) return [] as WatchingNowItem[];

  const roomIds = rooms.map((room) => room.id);
  const memberUserIds = [
    ...new Set(
      rooms.flatMap((room) =>
        [room.host_user_id, room.guest_user_id].filter(Boolean),
      ),
    ),
  ] as string[];

  const { data: presenceRows, error: presenceError } = await supabase
    .from("watch_party_presence")
    .select("room_id, user_id, is_online, last_seen")
    .in("room_id", roomIds)
    .eq("is_online", true)
    .gt("last_seen", thresholdIso);

  if (presenceError) throw new Error(presenceError.message);

  const viewerIds = [
    ...new Set(
      (presenceRows ?? [])
        .map((row) => row.user_id)
        .filter((id) => !memberUserIds.includes(id)),
    ),
  ];

  const allUserIds = [...new Set([...memberUserIds, ...viewerIds])];
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url")
    .in("id", allUserIds);

  if (usersError) throw new Error(usersError.message);

  const allowedPrivateHostIds = new Set<string>(
    userId ? [userId, ...(await getAcceptedFriendIds(supabase, userId))] : [],
  );

  const roomMap = new Map((rooms ?? []).map((room) => [room.id, room]));
  const userMap = new Map((users ?? []).map((user) => [user.id, user]));
  const grouped = new Map<string, WatchingNowItem>();

  for (const room of rooms) {
    grouped.set(room.id, {
      room_id: room.id,
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

  for (const [roomId, item] of grouped) {
    const room = roomMap.get(roomId);
    if (!room) continue;

    const memberIds = [
      room.host_user_id,
      room.guest_user_id,
      ...(presenceRows ?? [])
        .filter((row) => row.room_id === roomId)
        .map((row) => row.user_id),
    ].filter(Boolean) as string[];

    const uniqueMemberIds = [...new Set(memberIds)];
    item.watching_users = uniqueMemberIds
      .map((id) => userMap.get(id))
      .filter((user): user is NonNullable<typeof user> => Boolean(user));
    item.watching_count = item.watching_users.length;
  }

  return [...grouped.values()]
    .filter((item) => item.watching_count > 0)
    .sort((a, b) => {
      if (b.watching_count !== a.watching_count) {
        return b.watching_count - a.watching_count;
      }

      const titleCompare = a.movie_title.localeCompare(b.movie_title);
      if (titleCompare !== 0) return titleCompare;

      return a.room_id.localeCompare(b.room_id);
    })
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

  if (
    room.host_user_id !== input.userId &&
    room.guest_user_id !== input.userId
  ) {
    revalidatePath("/");
    revalidatePath("/watch-party");
    return { success: true, deleted: false };
  }

  const { data: otherPresenceRows, error: otherPresenceError } = await supabase
    .from("watch_party_presence")
    .select("user_id, is_online, last_seen")
    .eq("room_id", input.roomId)
    .eq("is_online", true)
    .neq("user_id", input.userId);

  if (otherPresenceError) throw new Error(otherPresenceError.message);

  const onlineCandidateIds = (otherPresenceRows ?? [])
    .filter((row) => {
      const recentlySeen =
        row.last_seen &&
        new Date(row.last_seen).getTime() > Date.now() - 90_000;
      return Boolean(recentlySeen);
    })
    .map((row) => row.user_id);

  const orderedCandidates = [
    room.guest_user_id,
    ...onlineCandidateIds.filter((id) => id !== room.guest_user_id),
  ].filter(Boolean) as string[];

  const uniqueCandidates = [...new Set(orderedCandidates)];
  const nextHostId = uniqueCandidates[0] ?? null;
  const nextGuestId = uniqueCandidates[1] ?? null;

  if (!nextHostId) {
    const { error: deleteMessagesError } = await supabase
      .from("watch_party_messages")
      .delete()
      .eq("room_id", input.roomId);

    if (deleteMessagesError) throw new Error(deleteMessagesError.message);

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
        host_user_id: nextHostId,
        guest_user_id: nextGuestId,
        status: nextGuestId ? "active" : "pending",
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
