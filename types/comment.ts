export type Comment = {
  id: string;
  user: { username: string; avatar_url: string | null };
  content: string;
  created_at: string;
  parent_comment_id: string | null;
  likes?: number | null;
  dislikes?: number | null;
  rec_id: string;
};

export type CommentReaction = {
  id: string;
  user_id: string;
  comment_id: string;
  type: "like" | "dislike";
  created_at: string;
};
