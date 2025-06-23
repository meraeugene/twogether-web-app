export type UserPreview = {
  id: string;
  username: string;
  avatar_url: string | null;
  display_name: string;
};

export type FriendRequestStatus = "accepted" | "pending" | "none" | "self";
