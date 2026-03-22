"use server";
import { createClient } from "@/utils/supabase/server";

export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<void> {
  const supabase = await createClient();

  // Check if the follower is already following the target user
  const { data } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (data) {
    await supabase
      // If a follow entry exists, delete it (unfollow)
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
  } else {
    // If no entry exists, insert a new follow (follow)
    await supabase.from("follows").insert({
      follower_id: followerId,
      following_id: followingId,
    });
  }
}

export async function getFollowStatsWithStatus(
  userId: string,
  currentUserId: string
) {
  const supabase = await createClient();

  const [{ count: followers }, { count: following }, { data }] =
    await Promise.all([
      // Count how many users are following `userId`
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId),

      // Count how many users `userId` is following
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId),

      // Check if the `currentUserId` is already following `userId`
      supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)
        .maybeSingle(),
    ]);

  return {
    followers: followers ?? 0,
    following: following ?? 0,
    isFollowing: !!data,
  };
}
