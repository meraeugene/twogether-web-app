export type NotificationType =
  | "watch_party_invite"
  | "watch_party_invite_accepted"
  | "watch_party_invite_rejected";

export type NotificationItem = {
  id: string;
  recipient_user_id: string;
  actor_user_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  actor: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  movie: {
    room_id: string | null;
    title: string | null;
    poster_url: string | null;
  } | null;
  invite_status?: "pending" | "accepted" | "rejected" | "cancelled" | null;
};

export type InviteFeedItem = {
  id: string;
  room_id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  responded_at: string | null;
  room_link: string;
  movie: {
    title: string;
    poster_url: string | null;
  };
  counterpart: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};
