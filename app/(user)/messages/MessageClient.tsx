"use client";

import { useState } from "react";
import MessageThreadList from "./MessageThreadList";
import MessageThreadView from "./MessageThreadView";
import OnlineFriendsList from "./OnlineFriendsList";
import MessageRequestList from "./MessageRequestList";

export default function MessagesClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [tab, setTab] = useState<"Online" | "Inbox" | "Requests">("Inbox");
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
    <div className="grid grid-cols-[400px_1fr]   rounded-xl  border border-white/10  ">
      <div className="bg-black/20 border-r   border-white/10 ">
        <div className="flex gap-2   p-4 ">
          {["Online", "Inbox", "Requests"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as "Online" | "Inbox" | "Requests")}
              className={`px-3 py-1 w-full cursor-pointer rounded-full text-sm transition
                ${
                  tab === t
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                }`}
            >
              {t}
            </button>
          ))}
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

      <div className="bg-black/10">
        {selectedThreadId && selectedUserId ? (
          <MessageThreadView
            threadId={selectedThreadId}
            currentUserId={currentUserId}
            otherUserId={selectedUserId}
            otherUserAvatar={selectedUserAvatar}
            otherUserDisplayName={selectedUserDisplayName}
            otherUserUsername={selectedUserUsername}
            threadStatus={selectedUserMessageStatus}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/50">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
