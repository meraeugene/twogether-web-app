"use client";

import { useState } from "react";
import MessageThreadList from "./MessageThreadList";
import MessageThreadView from "./MessageThreadView";
import OnlineFriendsList from "./OnlineFriendsList";
import MessageRequestList from "./MessageRequestList";
import { HiArrowLeft } from "react-icons/hi";

export default function MessagesClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [tab, setTab] = useState<"Online" | "Inbox" | "Requests" | "Sent">(
    "Inbox"
  );
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string | null>(
    null
  );
  const [selectedUserDisplayName, setSelectedUserDisplayName] =
    useState<string>("");
  const [selectedUserUsername, setSelectedUserUsername] = useState<string>("");
  const [selectedUserMessageStatus, setSelectedUserMessageStatus] = useState<
    "active" | "pending" | undefined
  >(undefined);

  return (
    <div className="flex flex-col  lg:grid lg:grid-cols-[400px_1fr]  rounded-xl border border-white/10">
      {/* Left Panel - Thread List */}
      <div
        className={`bg-black/20 lg:border-r border-r-0  border-white/10 ${
          selectedThreadId ? "hidden lg:block" : "block"
        }`}
      >
        <div className="grid grid-cols-2 border-b border-white/10">
          {/* Friends Section */}
          <div className="border-r border-white/10 px-2 py-4">
            <p className="text-xs text-white/40 pb-2 text-center uppercase tracking-wider">
              Friends
            </p>
            <div className="flex   gap-2 ">
              {["Online", "Inbox"].map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setTab(t as "Online" | "Inbox" | "Requests" | "Sent")
                  }
                  className={`px-3 py-1 w-full cursor-pointer rounded-full text-sm transition ${
                    tab === t
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Message Requests Section */}
          <div className="px-2 py-4">
            <p className="text-xs text-white/40 pb-2 text-center uppercase tracking-wider">
              Message Requests
            </p>
            <div className="flex   gap-2 ">
              {["Requests", "Sent"].map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setTab(t as "Online" | "Inbox" | "Requests" | "Sent")
                  }
                  className={`px-3 py-1 w-full cursor-pointer rounded-full text-sm transition ${
                    tab === t
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {tab === "Inbox" && (
          <MessageThreadList
            userId={currentUserId}
            onSelectThread={(
              id,
              otherId,
              avatar,
              username,
              displayName,
              threadStatus
            ) => {
              setSelectedThreadId(id);
              setSelectedUserId(otherId);
              setActiveThreadId(id);
              setSelectedUserAvatar(avatar);
              setSelectedUserUsername(username);
              setSelectedUserDisplayName(displayName);
              setSelectedUserMessageStatus(threadStatus);
            }}
            activeThreadId={activeThreadId}
          />
        )}

        {tab === "Requests" && (
          <MessageRequestList
            direction="incoming"
            currentUserId={currentUserId}
            onSelectThread={(
              id,
              otherId,
              avatar,
              displayName,
              username,
              threadStatus
            ) => {
              setSelectedThreadId(id);
              setSelectedUserId(otherId);
              setActiveThreadId(id);
              setSelectedUserAvatar(avatar);
              setSelectedUserDisplayName(displayName);
              setSelectedUserUsername(username);
              setSelectedUserMessageStatus(threadStatus);
            }}
            activeThreadId={activeThreadId}
          />
        )}

        {tab === "Sent" && (
          <MessageRequestList
            direction="sent"
            currentUserId={currentUserId}
            onSelectThread={(
              id,
              otherId,
              avatar,
              displayName,
              username,
              threadStatus
            ) => {
              setSelectedThreadId(id);
              setSelectedUserId(otherId);
              setActiveThreadId(id);
              setSelectedUserAvatar(avatar);
              setSelectedUserDisplayName(displayName);
              setSelectedUserUsername(username);
              setSelectedUserMessageStatus(threadStatus);
            }}
            activeThreadId={activeThreadId}
          />
        )}

        {tab === "Online" && (
          <OnlineFriendsList
            currentUserId={currentUserId}
            onStartChat={(
              threadId,
              otherUserId,
              avatar,
              displayName,
              username,
              threadStatus
            ) => {
              setTab("Inbox");
              setSelectedThreadId(threadId);
              setSelectedUserId(otherUserId);
              setActiveThreadId(threadId);
              setSelectedUserAvatar(avatar);
              setSelectedUserDisplayName(displayName);
              setSelectedUserUsername(username);
              setSelectedUserMessageStatus(threadStatus);
            }}
          />
        )}
      </div>

      {/* Right Panel - Thread View */}
      <div className="bg-black/10 relative">
        {selectedThreadId && selectedUserId && (
          <>
            {/* Mobile Back Button */}
            <div className="lg:hidden p-2 border-b border-white/10 ">
              <button
                onClick={() => {
                  setSelectedThreadId(null);
                  setSelectedUserId(null);
                }}
                className="text-white hover:text-red-500 transition p-2"
                aria-label="Back"
              >
                <HiArrowLeft className="text-xl" />
              </button>
            </div>

            <MessageThreadView
              threadId={selectedThreadId}
              currentUserId={currentUserId}
              otherUserId={selectedUserId}
              otherUserAvatar={selectedUserAvatar}
              otherUserDisplayName={selectedUserDisplayName}
              otherUserUsername={selectedUserUsername}
              threadStatus={selectedUserMessageStatus}
            />
          </>
        )}
      </div>
    </div>
  );
}
