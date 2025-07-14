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

  const enriched = await Promise.all(
    (comments || []).map(async (comment) => {
      const [{ count: likes }, { count: dislikes }, { data: userReaction }] =
        await Promise.all([
          supabase
            .from("comment_reactions")
            .select("*", { count: "exact", head: true })
            .eq("comment_id", comment.id)
            .eq("type", "like"),

          supabase
            .from("comment_reactions")
            .select("*", { count: "exact", head: true })
            .eq("comment_id", comment.id)
            .eq("type", "dislike"),

          supabase
            .from("comment_reactions")
            .select("type")
            .eq("comment_id", comment.id)
            .eq("user_id", currentUserId)
            .maybeSingle(),
        ]);

      return {
        ...comment,
        likes: likes ?? 0,
        dislikes: dislikes ?? 0,
        userReaction: userReaction?.type ?? null,
      };
    })
  );

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
