"use server";

import {
  createWatchPartyInvite as createWatchPartyInviteImpl,
  getInviteableFriends as getInviteableFriendsImpl,
  respondWatchPartyInvite as respondWatchPartyInviteImpl,
} from "./watch-party/inviteActions";
import {
  getWatchPartyMessages as getWatchPartyMessagesImpl,
  sendWatchPartyMessage as sendWatchPartyMessageImpl,
  updateWatchPartyPresence as updateWatchPartyPresenceImpl,
} from "./watch-party/messageActions";
import {
  getUnreadNotificationCount as getUnreadNotificationCountImpl,
  getUserNotifications as getUserNotificationsImpl,
  markAllNotificationsRead as markAllNotificationsReadImpl,
  markNotificationRead as markNotificationReadImpl,
} from "./watch-party/notificationActions";
import {
  createWatchPartyRoom as createWatchPartyRoomImpl,
  getWatchPartyRoom as getWatchPartyRoomImpl,
  getWatchingNowRooms as getWatchingNowRoomsImpl,
  joinWatchPartyByCode as joinWatchPartyByCodeImpl,
  leaveWatchPartyRoom as leaveWatchPartyRoomImpl,
  updateWatchPartyPlayback as updateWatchPartyPlaybackImpl,
} from "./watch-party/roomActions";

export async function getInviteableFriends(userId: string, roomId?: string) {
  return getInviteableFriendsImpl(userId, roomId);
}

export async function createWatchPartyRoom(input: {
  hostUserId: string;
  movieTmdbId: number;
  movieTitle: string;
  movieType: "movie" | "tv";
  streamUrl: string;
  posterUrl?: string | null;
  accessType: "public" | "private";
}) {
  return createWatchPartyRoomImpl(input);
}

export async function createWatchPartyInvite(input: {
  roomId: string;
  inviterId: string;
  inviteeId: string;
}) {
  return createWatchPartyInviteImpl(input);
}

export async function respondWatchPartyInvite(input: {
  inviteId: string;
  userId: string;
  action: "accepted" | "rejected";
}) {
  return respondWatchPartyInviteImpl(input);
}

export async function getUserNotifications(userId: string, limit = 25) {
  return getUserNotificationsImpl(userId, limit);
}

export async function getUnreadNotificationCount(userId: string) {
  return getUnreadNotificationCountImpl(userId);
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return markNotificationReadImpl(notificationId, userId);
}

export async function markAllNotificationsRead(userId: string) {
  return markAllNotificationsReadImpl(userId);
}

export async function getWatchPartyRoom(roomId: string, userId: string) {
  return getWatchPartyRoomImpl(roomId, userId);
}

export async function joinWatchPartyByCode(input: {
  userId: string;
  code: string;
}) {
  return joinWatchPartyByCodeImpl(input);
}

export async function getWatchPartyMessages(roomId: string, userId: string) {
  return getWatchPartyMessagesImpl(roomId, userId);
}

export async function sendWatchPartyMessage(input: {
  roomId: string;
  senderId: string;
  content: string;
}) {
  return sendWatchPartyMessageImpl(input);
}

export async function updateWatchPartyPresence(input: {
  roomId: string;
  userId: string;
  isOnline: boolean;
}) {
  return updateWatchPartyPresenceImpl(input);
}

export async function getWatchingNowRooms(limit = 10, userId?: string) {
  return getWatchingNowRoomsImpl(limit, userId);
}

export async function leaveWatchPartyRoom(input: {
  roomId: string;
  userId: string;
}) {
  return leaveWatchPartyRoomImpl(input);
}

export async function updateWatchPartyPlayback(input: {
  roomId: string;
  userId: string;
  seconds: number;
}) {
  return updateWatchPartyPlaybackImpl(input);
}
