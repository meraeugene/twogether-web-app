export type WatchPartyInviteStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export type WatchPartyRoomStatus =
  | "pending"
  | "active"
  | "ended"
  | "rejected";

export type WatchPartyRoomAccess = "public" | "private";

export type WatchPartyRoom = {
  id: string;
  host_user_id: string;
  guest_user_id: string | null;
  movie_tmdb_id: number;
  movie_title: string;
  movie_slug: string;
  movie_type: "movie" | "tv";
  stream_url: string;
  poster_url?: string | null;
  access_type: WatchPartyRoomAccess;
  status: WatchPartyRoomStatus;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  last_activity_at: string;
  playback_started_at: string | null;
  playback_seconds: number;
  playback_updated_at: string | null;
};

export type WatchPartyMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type WatchPartyPresence = {
  room_id: string;
  user_id: string;
  is_online: boolean;
  last_seen: string;
};

export type WatchingNowItem = {
  room_id: string;
  movie_title: string;
  movie_slug: string;
  movie_type: "movie" | "tv";
  movie_tmdb_id: number;
  poster_url: string | null;
  access_type: WatchPartyRoomAccess;
  is_accessible: boolean;
  watching_users: Array<{
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  }>;
  watching_count: number;
};
