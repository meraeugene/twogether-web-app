"use server";
import { FriendRequestStatus, OnlineFriend } from "@/types/friends";
import { createClient } from "@/utils/supabase/server";

export async function searchUsersByUsernamePrefix(query: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url")
    .ilike("username", `${query}%`) // case-insensitive prefix match
    .limit(10);

  if (error) throw error;

  return data;
}
export async function getFriendStats(
  currentUserId: string,
  profileUserId: string
): Promise<FriendRequestStatus> {
  const supabase = await createClient();

  if (currentUserId === profileUserId) return "self";

  // Check if already friends
  const { data: accepted } = await supabase
    .from("friend_requests")
    .select("*")
    // Check if a friend request exists between the two users in either direction:
    // - currentUserId sent a request to profileUserId
    // - OR profileUserId sent a request to currentUserId
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${profileUserId}),and(sender_id.eq.${profileUserId},receiver_id.eq.${currentUserId})`
    )
    .eq("status", "accepted")
    .maybeSingle();

  if (accepted) return "accepted";

  // Check if current user sent a pending request
  const { data: pendingSent } = await supabase
    .from("friend_requests")
    .select("*")
    .eq("sender_id", currentUserId)
    .eq("receiver_id", profileUserId)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingSent) return "pending";

  return "none";
}

export async function sendFriendRequest(senderId: string, receiverId: string) {
  const supabase = await createClient();

  // Sender id is the user who is sending the request, Receiver id is the user receiving it.

  //  Delete any rejected request first
  await supabase
    .from("friend_requests")
    .delete()
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .eq("status", "rejected");

  // Insert new friend request
  const { data, error } = await supabase
    .from("friend_requests")
    .insert([{ sender_id: senderId, receiver_id: receiverId }]);

  return { data, error };
}

export async function cancelFriendRequest(
  senderId: string,
  receiverId: string
) {
  const supabase = await createClient();

  // Sender id is the current user who sent the request, Receiver id is the user to be cancelled.

  // Cancel a pending friend request by deleting it
  const { data, error } = await supabase
    .from("friend_requests")
    .delete()
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .eq("status", "pending");

  return { data, error };
}

export async function acceptFriendRequest(
  senderId: string,
  receiverId: string
) {
  const supabase = await createClient();

  // Sender id is the user who sent the request, Receiver id is the current user accepting it.

  // Update the status of an existing friend request to 'accepted'
  const { data, error } = await supabase
    .from("friend_requests")
    .update({ status: "accepted" })
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId);

  return { data, error };
}

export async function removeFriend(currentUserId: string, userId: string) {
  const supabase = await createClient();

  // Current user is the current user removing the friend, User id is the friend being removed.

  const { error } = await supabase
    .from("friend_requests")
    .delete()
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`
    )
    .eq("status", "accepted");

  return { error };
}

export async function rejectFriendRequest(
  senderId: string,
  currentUserId: string
) {
  const supabase = await createClient();

  // Sender id is the user who sent the request, Receiver id is the current user rejecting it.

  // Update status of a friend request to 'rejected'
  const { data, error } = await supabase
    .from("friend_requests")
    .update({ status: "rejected" })
    .eq("sender_id", senderId)
    .eq("receiver_id", currentUserId);

  return { data, error };
}

export async function getFriendsOfUser(userId: string) {
  const supabase = await createClient();

  // Get all users who sent a friend request to this user that was accepted
  const { data: receivedRaw } = await supabase
    .from("friend_requests")
    .select("sender_id")
    .eq("receiver_id", userId)
    .eq("status", "accepted");

  // Fallback to empty array if no results
  const received = receivedRaw ?? [];

  // Get all users this user has sent a friend request to that was accepted
  const { data: sentRaw } = await supabase
    .from("friend_requests")
    .select("receiver_id")
    .eq("sender_id", userId)
    .eq("status", "accepted");

  // Fallback to empty array if no results
  const sent = sentRaw ?? [];

  // Combine all friend user IDs from both received and sent requests
  const friendIds = [
    ...received.map((r) => r.sender_id),
    ...sent.map((r) => r.receiver_id),
  ];

  // Return an empty list if the user has no friends
  if (friendIds.length === 0) return [];

  // Fetch user info for all friend IDs
  const { data: friends } = await supabase
    .from("users")
    .select("id, username, avatar_url, display_name")
    .in("id", friendIds);

  return friends ?? [];
}

// Fetch incoming friend requests for the current user
export async function getIncomingFriendRequests(currentUserId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("incoming_friend_requests")
    .select("avatar_url, display_name, username, id")
    .eq("receiver_id", currentUserId);

  if (error) throw error;

  return data;
}

// Fetch sent friend requests for the current user
export async function getSentFriendRequests(currentUserId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sent_friend_requests")
    .select("avatar_url, display_name, username, id")
    .eq("sender_id", currentUserId);

  if (error) throw error;

  return data;
}
