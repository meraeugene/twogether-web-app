export type UserPreview = {
  id: string;
  username: string;
  avatar_url: string | null;
  display_name: string;
};

export type FriendRequestStatus = "accepted" | "pending" | "none" | "self";

export type OnlineFriend = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_online: boolean;
  last_seen: string | null;
};
