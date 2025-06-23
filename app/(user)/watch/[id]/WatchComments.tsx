"use client";

import useSWR from "swr";
import { useRef, useState } from "react";
import { BiSend, BiLike, BiDislike } from "react-icons/bi";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import {
  getCommentsForRecommendation,
  postComment,
  postReply,
  reactToComment,
} from "@/actions/commentActions";

export default function WatchComments({
  recId,
  currentUserId,
  username,
}: {
  recId: string;
  currentUserId: string;
  username: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<{
    username: string;
    commentId: string;
  } | null>(null);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(
    null
  );

  const {
    data: comments = [],
    error,
    isLoading,
    mutate: refetchComments,
  } = useSWR(["comments", recId], () => getCommentsForRecommendation(recId), {
    refreshInterval: 5000, // Auto-refresh every 5 seconds
    refreshWhenHidden: false,
  });

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsPostingComment(true);
    await postComment(recId, newComment.trim(), currentUserId);
    setNewComment("");
    inputRef.current?.blur();
    await refetchComments();
    setIsPostingComment(false);
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || !replyTo) return;
    setReplySubmittingId(replyTo.commentId);
    await postReply(
      recId,
      `@${replyTo.username} ${replyText.trim()}`,
      replyTo.commentId,
      currentUserId
    );
    setReplyText("");
    setReplyTo(null);
    await refetchComments();
    setReplySubmittingId(null);
  };

  const handleReaction = async (
    commentId: string,
    type: "like" | "dislike"
  ) => {
    await reactToComment(commentId, type, currentUserId);
    refetchComments(); // Refetch after reacting
  };

  return (
    <div className="space-y-5">
      {/* New Comment Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
          placeholder={`Add a public comment as ${username}`}
          className="flex-1 px-4 py-2 bg-white/10 text-white rounded-md backdrop-blur-sm border border-white/10"
        />
        <button
          onClick={handlePostComment}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm flex items-center gap-2"
        >
          <BiSend /> Post
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 bg-red-900/20 border border-red-500/20 p-4 rounded">
          Failed to load comments. Please try again later.
        </p>
      ) : (
        <>
          {/* Top-level loading skeleton */}
          {isPostingComment && (
            <div className="flex gap-3 mt-1 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-white/20" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-white/20 rounded" />
                <div className="h-3 w-full bg-white/10 rounded" />
                <div className="h-3 w-[10%] bg-white/10 rounded" />
              </div>
            </div>
          )}

          {/* Render Comments & Replies */}
          {comments
            .filter((c) => !c.parent_comment_id)
            .map((comment) => {
              const replies = comments.filter(
                (r) => r.parent_comment_id === comment.id
              );

              return (
                <div key={comment.id} className="space-y-3">
                  {/* Top-level comment */}
                  <div className="flex gap-3 text-sm mb-4">
                    <div>
                      <Image
                        src={comment.user?.avatar_url || "/default-avatar.png"}
                        alt={comment.user?.username || "User"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        style={{ aspectRatio: "1 / 1" }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">
                          {comment.user?.username}
                        </p>
                        <span className="text-white/50 text-xs">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-white/80">{comment.content}</p>
                      <div className="flex gap-4 text-xs text-white/60 mt-1">
                        <button
                          onClick={() => handleReaction(comment.id, "like")}
                          className="flex items-center cursor-pointer gap-1 hover:text-white"
                        >
                          <BiLike className="text-lg" /> {comment.likes || 0}
                        </button>
                        <button
                          onClick={() => handleReaction(comment.id, "dislike")}
                          className="flex items-center cursor-pointer gap-1 hover:text-white"
                        >
                          <BiDislike className="text-lg" />{" "}
                          {comment.dislikes || 0}
                        </button>
                        <button
                          onClick={() =>
                            setReplyTo({
                              username: comment.user?.username ?? "",
                              commentId: comment.id,
                            })
                          }
                          className="hover:text-white cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {replies.map((reply) => (
                    <div key={reply.id} className="ml-12 flex gap-3 text-sm ">
                      <div>
                        <Image
                          src={reply.user?.avatar_url || "/default-avatar.png"}
                          alt={reply.user?.username || "User"}
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {reply.user?.username}
                          <span className="text-white/50 ml-2 text-xs">
                            {formatDistanceToNow(new Date(reply.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </p>
                        <p className="text-white/80">{reply.content}</p>
                      </div>
                    </div>
                  ))}

                  {replySubmittingId === comment.id && (
                    <div className="ml-12 mt-4 flex gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-white/20" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-28 bg-white/20 rounded" />
                        <div className="h-2 w-3/5 bg-white/10 rounded" />
                      </div>
                    </div>
                  )}

                  {/* Inline Reply */}
                  {replyTo?.commentId === comment.id && (
                    <div className="ml-12 mt-4 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handlePostReply()
                        }
                        placeholder={`Reply to @${replyTo?.username}`}
                        className="flex-1 border border-white/10 py-2 bg-white/10 text-white px-4 rounded-md backdrop-blur-sm"
                      />
                      <button
                        onClick={handlePostReply}
                        className="px-6 flex items-center gap-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                      >
                        <BiSend /> Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyTo(null);
                          setReplyText("");
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}
