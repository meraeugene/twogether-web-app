"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserThreads(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("fn_user_message_threads", {
      p_user_id: userId,
    })
    .order("last_message_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getThreadMessages(threadId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("view_thread_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function sendMessage({
  threadId,
  senderId,
  receiverId,
  content,
}: {
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
}) {
  const supabase = await createClient();

  // 1. Insert message
  const { error: insertError } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
  });

  if (insertError) throw new Error(insertError.message);

  // 2. Update thread last_message_at
  const { error: updateError } = await supabase
    .from("message_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", threadId);

  if (updateError) throw new Error(updateError.message);

  return { success: true };
}

export async function acceptMessageThread(threadId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("message_threads")
    .update({ status: "active" })
    .eq("id", threadId);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function deleteMessageThread(threadId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("message_threads")
    .delete()
    .eq("id", threadId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function markMessagesSeen(threadId: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("messages")
    .update({
      seen: true,
      status: "seen",
    })
    .eq("thread_id", threadId)
    .eq("receiver_id", userId)
    .neq("status", "seen");

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function markMessagesDelivered(threadId: string, userId: string) {
  const supabase = await createClient();

  // Step 1: Check if the receiver is online
  const { data: userStatus, error: statusError } = await supabase
    .from("user_status")
    .select("is_online")
    .eq("user_id", userId)
    .maybeSingle();

  if (statusError) throw new Error(statusError.message);

  if (!userStatus?.is_online) {
    // Skip delivery update if user is offline
    return { skipped: true };
  }

  // Step 2: Mark as delivered
  const { error } = await supabase
    .from("messages")
    .update({ status: "delivered" })
    .eq("thread_id", threadId)
    .eq("receiver_id", userId)
    .eq("status", "sent");

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function getOnlineFriends() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("view_online_friends")
    .select("*");

  if (error) throw new Error(error.message);
  return data;
}

export async function getMessageRequests() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("view_message_requests")
    .select("*");

  if (error) throw new Error(error.message);
  return data;
}

export async function getOrCreateThread(user1Id: string, user2Id: string) {
  const supabase = await createClient();
  const [u1, u2] = [user1Id, user2Id].sort();

  // Check if users are friends (before doing anything else)
  const { data: friendship, error: friendError } = await supabase
    .from("friend_requests")
    .select("id")
    .or(
      `and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`
    )
    .eq("status", "accepted")
    .maybeSingle();

  const isFriend = !!friendship;

  //  Then check if thread already exists
  const { data: existing, error: findError } = await supabase
    .from("message_threads")
    .select("*")
    .eq("user1_id", u1)
    .eq("user2_id", u2)
    .maybeSingle();

  if (findError) throw new Error(findError.message);

  if (existing) {
    // Promote to active if newly became friends
    if (existing.status === "pending" && isFriend) {
      await supabase
        .from("message_threads")
        .update({ status: "active" })
        .eq("id", existing.id);

      existing.status = "active";
    }

    return existing;
  }

  // ✅ Create new thread with correct status based on friendship
  const { data: created, error: createError } = await supabase
    .from("message_threads")
    .insert({
      user1_id: u1,
      user2_id: u2,
      status: isFriend ? "active" : "pending",
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) throw new Error(createError.message);
  return created;
}
