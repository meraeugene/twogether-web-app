"use client";

export type RoomUser = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  pending_invite?: boolean;
};

export type RoomData = {
  id: string;
  host_user_id: string;
  guest_user_id: string | null;
  movie_title: string;
  movie_type: "movie" | "tv";
  stream_url: string;
  poster_url?: string | null;
  status: string;
  access_type: "public" | "private";
  host: RoomUser | null;
  guest: RoomUser | null;
  viewers: RoomUser[];
  viewer_count: number;
  playback_started_at: string | null;
  playback_seconds: number;
  playback_updated_at: string | null;
};

export type RoomMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: RoomUser | null;
};
