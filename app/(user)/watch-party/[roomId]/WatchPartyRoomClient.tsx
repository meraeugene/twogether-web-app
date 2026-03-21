"use client";

import Image from "next/image";
import { Copy, Globe2, LoaderCircle, Lock } from "lucide-react";
import WatchPartyChatPanel from "./WatchPartyChatPanel";
import WatchPartyInviteModal from "./WatchPartyInviteModal";
import type { RoomData } from "./watchPartyRoomTypes";
import { useWatchPartyRoomClient } from "./hooks/useWatchPartyRoomClient";

export default function WatchPartyRoomClient({
  room,
  currentUserId,
}: {
  room: RoomData;
  currentUserId: string;
}) {
  const roomClient = useWatchPartyRoomClient({ room, currentUserId });

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505] px-7 pb-16 pt-28 text-white lg:px-24 xl:px-32 xl:pt-34 2xl:px-26">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-red-900/20 blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-red-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
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
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.14em] text-white/55">
                    Room Code
                  </span>
                  <span className="text-sm font-semibold tracking-widest text-white">
                    {roomClient.privateRoomCode}
                  </span>
                  <button
                    onClick={roomClient.copyRoomKey}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/[0.1]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Key
                  </button>
                </div>
              ) : null}

              {roomClient.isHost && (
                <button
                  onClick={roomClient.openInviteModal}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-white/90"
                >
                  Invite Friends
                </button>
              )}

              <button
                onClick={roomClient.handleLeave}
                disabled={roomClient.isLeaving}
                className="rounded-md cursor-pointer border border-white/10 bg-red-500/30 px-3 py-1.5 text-[11px] font-semibold transition hover:bg-red-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-1.5">
                  {roomClient.isLeaving ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Leaving...
                    </>
                  ) : (
                    "Leave Room"
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="w-full xl:max-w-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              You&apos;re watching with
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                {roomClient.visibleViewers.slice(0, 5).map((viewer) => (
                  <Image
                    key={viewer.id}
                    src={viewer.avatar_url || "/default-avatar.png"}
                    alt={viewer.username}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-full border-2 border-[#050505] object-cover"
                  />
                ))}
                {roomClient.visibleViewers.length === 0 && (
                  <div className="flex h-10 items-center rounded-full border border-dashed border-white/10 bg-black/20 px-4 text-xs text-white/45">
                    Waiting for people to join
                  </div>
                )}
              </div>
              {roomClient.visibleViewers.length > 5 && (
                <span className="text-xs text-white/55">
                  +{roomClient.visibleViewers.length - 5} more
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">
              {roomClient.currentRoom.access_type === "private"
                ? "Only the host's friends can enter this room with the code."
                : "Anyone can join this party from the live public rooms list or direct link."}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
          <div className="group relative transition-all duration-700 ease-in-out">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-transparent blur-2xl opacity-100 transition duration-1000" />
            <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] border border-white/5 bg-black">
              <iframe
                src={roomClient.currentRoom.stream_url}
                className="h-full w-full scale-[1.01]"
                allowFullScreen
              />
            </div>
          </div>

          <WatchPartyChatPanel
            messages={roomClient.messages}
            currentUserId={currentUserId}
            currentUser={roomClient.currentUser}
            otherUser={roomClient.otherUser}
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
