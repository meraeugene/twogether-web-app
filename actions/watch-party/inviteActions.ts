"use server";

import { createClient } from "@/utils/supabase/server";
import { areFriends, getAcceptedFriendIds } from "./access";

export async function getInviteableFriends(userId: string, roomId?: string) {
  const supabase = await createClient();
  const friendIds = await getAcceptedFriendIds(supabase, userId);

  if (!friendIds.length) return [];

  const { data, error } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url")
    .in("id", friendIds)
    .order("display_name", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  const friends = data ?? [];

  if (!roomId || !friends.length) {
    return friends.map((friend) => ({ ...friend, pending_invite: false }));
  }

  const { data: pendingInvites, error: pendingError } = await supabase
    .from("watch_party_invites")
    .select("invitee_id")
    .eq("room_id", roomId)
    .eq("status", "pending")
    .in(
      "invitee_id",
      friends.map((friend) => friend.id),
    );

  if (pendingError) throw new Error(pendingError.message);

  const pendingInviteeIds = new Set(
    (pendingInvites ?? []).map((invite) => invite.invitee_id),
  );

  return friends.map((friend) => ({
    ...friend,
    pending_invite: pendingInviteeIds.has(friend.id),
  }));
}

export async function createWatchPartyInvite(input: {
  roomId: string;
  inviterId: string;
  inviteeId: string;
}) {
  const supabase = await createClient();

  if (input.inviterId === input.inviteeId) {
    throw new Error("You cannot invite yourself.");
  }

  const friends = await areFriends(supabase, input.inviterId, input.inviteeId);
  if (!friends) throw new Error("You can only invite friends.");

  const { data: inviterProfile, error: inviterError } = await supabase
    .from("users")
    .select("username, display_name")
    .eq("id", input.inviterId)
    .maybeSingle();

  if (inviterError) throw new Error(inviterError.message);

  const { data: room, error: roomError } = await supabase
    .from("watch_party_rooms")
    .select("id, host_user_id, guest_user_id, movie_title")
    .eq("id", input.roomId)
    .maybeSingle();

  if (roomError) throw new Error(roomError.message);
  if (!room) throw new Error("Watch party room not found.");
  if (room.host_user_id !== input.inviterId) {
    throw new Error("Only the host can invite friends to this room.");
  }

  if (room.host_user_id === input.inviteeId) {
    throw new Error("That user is already in the room.");
  }

  const { data: existingPresence, error: presenceError } = await supabase
    .from("watch_party_presence")
    .select("user_id, is_online, last_seen")
    .eq("room_id", input.roomId)
    .eq("user_id", input.inviteeId)
    .maybeSingle();

  if (presenceError) throw new Error(presenceError.message);

  const recentlySeen =
    existingPresence?.last_seen &&
    new Date(existingPresence.last_seen).getTime() > Date.now() - 120_000;

  if (room.guest_user_id === input.inviteeId || (existingPresence?.is_online && recentlySeen)) {
    throw new Error("That friend is already in the room.");
  }

  const { data: existingInvite, error: existingInviteError } = await supabase
    .from("watch_party_invites")
    .select("id")
    .eq("room_id", input.roomId)
    .eq("invitee_id", input.inviteeId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInviteError) throw new Error(existingInviteError.message);
  if (existingInvite) {
    throw new Error("Invite already sent to that friend.");
  }

  const { data: invite, error: inviteError } = await supabase
    .from("watch_party_invites")
    .insert({
      room_id: room.id,
      inviter_id: input.inviterId,
      invitee_id: input.inviteeId,
      status: "pending",
    })
    .select("id")
    .single();

  if (inviteError) throw new Error(inviteError.message);

  const inviterName =
    inviterProfile?.display_name || inviterProfile?.username || "A friend";

  const { error: notificationError } = await supabase.from("notifications").insert({
    recipient_user_id: input.inviteeId,
    actor_user_id: input.inviterId,
    type: "watch_party_invite",
    title: `${inviterName} invited you to watch together`,
    body: room.movie_title,
    link: `/watch-party/${room.id}?invite=${invite.id}`,
    metadata: {
      invite_id: invite.id,
      room_id: room.id,
      movie_title: room.movie_title,
    },
  });

  if (notificationError) throw new Error(notificationError.message);

  return { roomId: room.id, inviteId: invite.id };
}

export async function respondWatchPartyInvite(input: {
  inviteId: string;
  userId: string;
  action: "accepted" | "rejected";
}) {
  const supabase = await createClient();

  const { data: invite, error: inviteError } = await supabase
    .from("watch_party_invites")
    .select("*")
    .eq("id", input.inviteId)
    .eq("invitee_id", input.userId)
    .maybeSingle();

  if (inviteError) throw new Error(inviteError.message);
  if (!invite) throw new Error("Invite not found.");
  if (invite.status !== "pending") throw new Error("Invite has already been handled.");

  const respondedAt = new Date().toISOString();

  const { error: updateInviteError } = await supabase
    .from("watch_party_invites")
    .update({
      status: input.action,
      responded_at: respondedAt,
    })
    .eq("id", input.inviteId)
    .eq("invitee_id", input.userId);

  if (updateInviteError) throw new Error(updateInviteError.message);

  if (input.action === "accepted") {
    const { error: roomUpdateError } = await supabase
      .from("watch_party_rooms")
      .update({
        guest_user_id: input.userId,
        status: "active",
        started_at: respondedAt,
        last_activity_at: respondedAt,
      })
      .eq("id", invite.room_id);

    if (roomUpdateError) throw new Error(roomUpdateError.message);
  } else {
    const { error: roomUpdateError } = await supabase
      .from("watch_party_rooms")
      .update({
        status: "rejected",
        ended_at: respondedAt,
        last_activity_at: respondedAt,
      })
      .eq("id", invite.room_id)
      .eq("status", "pending");

    if (roomUpdateError) throw new Error(roomUpdateError.message);
  }

  const [{ data: guestProfile }, { data: room }] = await Promise.all([
    supabase
      .from("users")
      .select("username, display_name")
      .eq("id", input.userId)
      .maybeSingle(),
    supabase
      .from("watch_party_rooms")
      .select("movie_title")
      .eq("id", invite.room_id)
      .maybeSingle(),
  ]);

  const guestName = guestProfile?.display_name || guestProfile?.username || "Guest";

  const { error: notifyHostError } = await supabase.from("notifications").insert({
    recipient_user_id: invite.inviter_id,
    actor_user_id: input.userId,
    type:
      input.action === "accepted"
        ? "watch_party_invite_accepted"
        : "watch_party_invite_rejected",
    title:
      input.action === "accepted"
        ? `${guestName} accepted your watch invite`
        : `${guestName} rejected your watch invite`,
    body: room?.movie_title ?? null,
    link: input.action === "accepted" ? `/watch-party/${invite.room_id}` : null,
    metadata: {
      invite_id: invite.id,
      room_id: invite.room_id,
    },
  });

  if (notifyHostError) throw new Error(notifyHostError.message);

  return { roomId: invite.room_id };
}
