"use client";

import Image from "next/image";
import { Copy, Crown, Globe2, LoaderCircle, Lock, Share2 } from "lucide-react";
import WatchPartyChatPanel from "./WatchPartyChatPanel";
import WatchPartyInviteModal from "./WatchPartyInviteModal";
import type { RoomData, RoomUser } from "../../../../types/watchPartyRoomTypes";
import { useWatchPartyRoomClient } from "@/hooks/useWatchPartyRoomClient";
import WatchPlayer from "@/app/(user)/watch/[id]/[movieTitle]/WatchPlayer";
import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";
import type { Recommendation } from "@/types/recommendation";

type TMDBWatchResponse = {
  recommendation: Recommendation;
};

export default function WatchPartyRoomClient({
  room,
  currentUserId,
  initialWatchMetadata,
}: {
  room: RoomData;
  currentUserId: string;
  initialWatchMetadata: Recommendation | null;
}) {
  const roomClient = useWatchPartyRoomClient({ room, currentUserId });
  const roomParticipants = [
    roomClient.currentRoom.host,
    roomClient.currentRoom.guest,
    ...(roomClient.currentRoom.viewers ?? []),
  ].filter((participant): participant is RoomUser => Boolean(participant));
  const otherParticipants = roomParticipants.filter(
    (participant, index, array) =>
      participant.id !== currentUserId &&
      array.findIndex((candidate) => candidate.id === participant.id) === index,
  );
  const participantHeading =
    otherParticipants.length === 0
      ? "Just you in the room right now"
      : otherParticipants.length === 1
        ? "In a room with 1 other person"
        : `In a room with ${otherParticipants.length} other people`;
  const { data: watchMetadata } = useSWR<TMDBWatchResponse>(
    roomClient.currentRoom.movie_tmdb_id
      ? `/api/tmdb/${roomClient.currentRoom.movie_tmdb_id}/?type=${roomClient.currentRoom.movie_type}`
      : null,
    fetcher,
    {
      fallbackData: initialWatchMetadata
        ? { recommendation: initialWatchMetadata }
        : undefined,
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    },
  );
  const watchRecommendation = watchMetadata?.recommendation;
  const playerUrl =
    roomClient.currentRoom.stream_url ||
    (Array.isArray(watchRecommendation?.stream_url)
      ? watchRecommendation.stream_url[0]
      : null);
  const episodeTitlesPerSeason = watchRecommendation?.episode_titles_per_season
    ? Object.fromEntries(
        Object.entries(watchRecommendation.episode_titles_per_season).map(
          ([season, episodes]) => [
            Number(season),
            episodes.map((episode) => episode.title),
          ],
        ),
      )
    : undefined;
  const hasEpisodeControls = Boolean(
    episodeTitlesPerSeason && Object.keys(episodeTitlesPerSeason).length > 0,
  );
  const isEpisodeMetadataLoading =
    roomClient.currentRoom.movie_type === "tv" &&
    !watchMetadata &&
    !hasEpisodeControls;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505] px-7 pb-24 pt-28 text-white lg:px-24 xl:px-32 xl:pb-32 xl:pt-34 2xl:px-26">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-red-900/20 blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-red-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur-xl ${
                  roomClient.currentRoom.access_type === "public"
                    ? "bg-emerald-500 text-white shadow-[0_10px_24px_-16px_rgba(34,197,94,0.95)]"
                    : "border border-white/12 bg-white/[0.06] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                }`}
              >
                {roomClient.currentRoom.access_type === "private" ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe2 className="h-3.5 w-3.5" />
                    Public
                  </>
                )}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live Party
              </span>
            </div>

            <h1 className="mt-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-black italic tracking-tighter text-transparent md:text-6xl">
              {roomClient.currentRoom.movie_title.toUpperCase()}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {roomClient.privateRoomCode ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.14em] text-white/55">
                    Room Code
                  </span>
                  <span className="text-sm font-semibold tracking-widest text-white">
                    {roomClient.privateRoomCode}
                  </span>
                  <button
                    onClick={roomClient.copyRoomKey}
                    className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-md border border-white/10 bg-white/[0.05] px-3 text-xs text-white/80 transition hover:bg-white/[0.1]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Key
                  </button>
                </div>
              ) : null}

              {roomClient.currentRoom.access_type === "public" ? (
                <>
                  <button
                    onClick={roomClient.shareRoomUrl}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share URL
                  </button>
                  <button
                    onClick={roomClient.copyRoomUrl}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy URL
                  </button>
                </>
              ) : null}

              {roomClient.isHost && (
                <button
                  onClick={roomClient.openInviteModal}
                  className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white px-3 text-xs font-semibold text-black transition hover:bg-white/90"
                >
                  Invite Friends
                </button>
              )}

              <button
                onClick={roomClient.handleLeave}
                disabled={roomClient.isLeaving}
                className="inline-flex h-9 cursor-pointer items-center rounded-md border border-white/10 bg-red-500/30 px-3 text-xs font-semibold transition hover:bg-red-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-1.5 leading-none">
                  {roomClient.isLeaving ? (
                    <>
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      Leaving...
                    </>
                  ) : (
                    "Leave Room"
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="w-full xl:max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              {participantHeading}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherParticipants.length > 0 ? (
                otherParticipants.map((participant) => {
                  const isHost =
                    participant.id === roomClient.currentRoom.host_user_id;
                  const participantName =
                    participant.display_name || participant.username;

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.05] px-3 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    >
                      <div className="relative shrink-0 overflow-visible">
                        <Image
                          src={participant.avatar_url || "/default-avatar.png"}
                          alt={participant.username}
                          width={44}
                          height={44}
                          unoptimized
                          className="h-11 w-11 rounded-full border border-white/15 object-cover"
                        />
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#111] bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.75)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {participantName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                          <span>@{participant.username}</span>
                          <span className="text-green-400/90">Online</span>
                          {isHost ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.2em] text-amber-200 lg:px-2.5">
                              <Crown className="h-3 w-3 shrink-0" />
                              Host
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex min-h-20 items-center rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 text-sm text-white/45 backdrop-blur-xl sm:col-span-2">
                  Waiting for someone else to join the room.
                </div>
              )}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">
              {roomClient.currentRoom.access_type === "private"
                ? "Only the host's friends can enter this room with the code."
                : "Anyone can join this party from the live public rooms list or direct link."}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(430px,500px)] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_450px]">
          <div className="group relative transition-all duration-700 ease-in-out">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-transparent blur-2xl opacity-100 transition duration-1000" />
            <div className="relative w-full">
              <WatchPlayer
                urls={playerUrl ? [playerUrl] : []}
                type={roomClient.currentRoom.movie_type}
                episodeTitlesPerSeason={
                  hasEpisodeControls ? episodeTitlesPerSeason : undefined
                }
                showServerSelector={false}
                isEpisodeMetadataLoading={isEpisodeMetadataLoading}
              />
            </div>
          </div>

          <WatchPartyChatPanel
            messages={roomClient.messages}
            currentUserId={currentUserId}
            currentUser={roomClient.currentUser}
            otherUser={roomClient.otherUser}
            hostUserId={roomClient.currentRoom.host_user_id}
            typingUserId={roomClient.typingUserId}
            typingUserName={roomClient.typingUserName}
            input={roomClient.input}
            showEmojiPicker={roomClient.showEmojiPicker}
            messagesEndRef={roomClient.messagesEndRef}
            onInputChange={roomClient.handleInputChange}
            onSubmit={roomClient.handleSend}
            onToggleEmojiPicker={() =>
              roomClient.setShowEmojiPicker((prev) => !prev)
            }
            onEmojiSelect={roomClient.handleEmojiSelect}
          />
        </div>
      </div>

      <WatchPartyInviteModal
        open={roomClient.isInviteOpen}
        inviteQuery={roomClient.inviteQuery}
        selectedFriendId={roomClient.selectedFriendId}
        friends={roomClient.filteredFriends}
        isLoadingFriends={roomClient.isLoadingFriends}
        isInviting={roomClient.isInviting}
        alreadyInRoomIds={roomClient.alreadyInRoomIds}
        onClose={roomClient.closeInviteModal}
        onQueryChange={roomClient.setInviteQuery}
        onSelectFriend={roomClient.setSelectedFriendId}
        onInvite={roomClient.handleInvite}
      />
    </main>
  );
}
