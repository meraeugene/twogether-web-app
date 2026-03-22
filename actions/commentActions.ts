"use server";

import { createClient } from "@/utils/supabase/server";
export async function getCommentsForRecommendation(
  recId: string,
  currentUserId: string
) {
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("comments")
    .select("*, user:users(username, avatar_url)")
    .eq("rec_id", recId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch comments");

  const commentIds = (comments || []).map((comment) => comment.id);
  if (!commentIds.length) return [];

  const [{ data: reactions, error: reactionsError }, { data: userReactions, error: userReactionsError }] =
    await Promise.all([
      supabase
        .from("comment_reactions")
        .select("comment_id, type")
        .in("comment_id", commentIds),
      supabase
        .from("comment_reactions")
        .select("comment_id, type")
        .in("comment_id", commentIds)
        .eq("user_id", currentUserId),
    ]);

  if (reactionsError || userReactionsError) {
    throw new Error("Failed to fetch comment reactions");
  }

  const countsByComment = new Map<
    string,
    { likes: number; dislikes: number }
  >();

  (reactions || []).forEach((reaction) => {
    const current = countsByComment.get(reaction.comment_id) ?? {
      likes: 0,
      dislikes: 0,
    };

    if (reaction.type === "like") {
      current.likes += 1;
    } else if (reaction.type === "dislike") {
      current.dislikes += 1;
    }

    countsByComment.set(reaction.comment_id, current);
  });

  const userReactionByComment = new Map<string, string>();
  (userReactions || []).forEach((reaction) => {
    userReactionByComment.set(reaction.comment_id, reaction.type);
  });

  const enriched = (comments || []).map((comment) => {
    const counts = countsByComment.get(comment.id);

    return {
      ...comment,
      likes: counts?.likes ?? 0,
      dislikes: counts?.dislikes ?? 0,
      userReaction: userReactionByComment.get(comment.id) ?? null,
    };
  });

  return enriched;
}

export async function postComment(
  recId: string,
  content: string,
  currentUserId: string
) {
  const supabase = await createClient();

  await supabase.from("comments").insert({
    user_id: currentUserId,
    rec_id: recId,
    content,
  });
}

export async function postReply(
  recId: string,
  content: string,
  parentId: string,
  currentUserId: string
) {
  const supabase = await createClient();

  await supabase.from("comments").insert({
    user_id: currentUserId,
    rec_id: recId,
    content,
    parent_comment_id: parentId,
  });
}

export async function reactToComment(
  commentId: string,
  type: "like" | "dislike",
  currentUserId: string
) {
  const supabase = await createClient();

  // Fetch existing reaction
  const { data: existingReaction } = await supabase
    .from("comment_reactions")
    .select("type")
    .eq("user_id", currentUserId)
    .eq("comment_id", commentId)
    .maybeSingle();

  // If already reacted with the same type, remove it (toggle off)
  if (existingReaction?.type === type) {
    await supabase
      .from("comment_reactions")
      .delete()
      .eq("user_id", currentUserId)
      .eq("comment_id", commentId);
  } else {
    // Otherwise, replace existing reaction with the new one
    await supabase
      .from("comment_reactions")
      .delete()
      .eq("user_id", currentUserId)
      .eq("comment_id", commentId);

    await supabase.from("comment_reactions").insert({
      user_id: currentUserId,
      comment_id: commentId,
      type,
    });
  }
}
