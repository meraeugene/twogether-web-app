"use client";

import useSWR, { mutate } from "swr";
import { useRef, useState } from "react";
import { BiSend } from "react-icons/bi";

import {
  AiFillLike,
  AiFillDislike,
  AiOutlineDislike,
  AiOutlineLike,
} from "react-icons/ai";
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
  } = useSWR(
    ["comments", recId],
    () => getCommentsForRecommendation(recId, currentUserId),
    {
      refreshInterval: 1000, // Auto-refresh every 5 seconds
      refreshWhenHidden: false,
    }
  );

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
    // Optimistically update the UI by modifying the local state
    const updated = comments.map((comment) => {
      if (comment.id !== commentId) return comment;

      const updatedComment = { ...comment };

      const alreadyReacted = comment.userReaction === type;

      if (alreadyReacted) {
        // User is removing their existing reaction
        if (type === "like") {
          updatedComment.likes = Math.max((comment.likes || 1) - 1, 0);
        } else {
          updatedComment.dislikes = Math.max((comment.dislikes || 1) - 1, 0);
        }
        updatedComment.userReaction = null;
      } else {
        // User is adding a new reaction or switching from the opposite type
        if (type === "like") {
          updatedComment.likes = (comment.likes || 0) + 1;

          // If user previously disliked, decrease dislike count
          if (comment.userReaction === "dislike") {
            updatedComment.dislikes = Math.max((comment.dislikes || 1) - 1, 0);
          }
        } else {
          updatedComment.dislikes = (comment.dislikes || 0) + 1;

          // If user previously liked, decrease like count
          if (comment.userReaction === "like") {
            updatedComment.likes = Math.max((comment.likes || 1) - 1, 0);
          }
        }
        updatedComment.userReaction = type;
      }

      return updatedComment;
    });

    // Optimistically update the local SWR cache without revalidation
    mutate(["comments", recId], () => updated, false);

    try {
      // Send the reaction to the server
      await reactToComment(commentId, type, currentUserId);

      // Optional: Skip revalidation since UI is already updated optimistically
      // await mutate(["comments", recId]);
    } catch (error) {
      // On error, fallback by refetching the data
      console.error("Reaction failed", error);
      await mutate(["comments", recId]); // revalidate
    }
  };

  return (
    <div className="space-y-5">
      {/* New Comment Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <input
          ref={inputRef}
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
          placeholder={`Add a public comment as ${username}`}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/40
               backdrop-blur-md border border-white/10 focus:outline-none
               focus:ring-2 focus:ring-red-500 transition"
        />

        <button
          onClick={handlePostComment}
          className="px-5 py-2 flex items-center justify-center gap-2 text-sm font-medium
               rounded-lg bg-red-600 hover:bg-red-700 text-white transition
               shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newComment.trim()}
        >
          <BiSend className="text-base" />
          Post
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
                <div
                  key={comment.id}
                  className="space-y-4 border-b border-white/5 pb-6"
                >
                  {/* Top-level Comment */}
                  <div className="flex gap-3 text-sm">
                    <div>
                      <Image
                        src={comment.user?.avatar_url || "/default-avatar.png"}
                        alt={comment.user?.username || "User"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover aspect-square"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white">
                          {comment.user?.username}
                        </p>
                        <span className="text-white/50 text-xs">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-white/80">{comment.content}</p>
                      <div className="flex gap-4 text-xs text-white/60 mt-2">
                        <button
                          onClick={() => handleReaction(comment.id, "like")}
                          className={`flex cursor-pointer items-center gap-1 transition ${
                            comment.userReaction === "like"
                              ? "text-red-500"
                              : "text-white/60 hover:text-white"
                          }`}
                        >
                          {comment.userReaction === "like" ? (
                            <AiFillLike className="text-base" />
                          ) : (
                            <AiOutlineLike className="text-base" />
                          )}
                          {comment.likes || 0}
                        </button>

                        <button
                          onClick={() => handleReaction(comment.id, "dislike")}
                          className={`flex cursor-pointer items-center gap-1 transition ${
                            comment.userReaction === "dislike"
                              ? "text-blue-400"
                              : "text-white/60 hover:text-white"
                          }`}
                        >
                          {comment.userReaction === "dislike" ? (
                            <AiFillDislike className="text-base" />
                          ) : (
                            <AiOutlineDislike className="text-base" />
                          )}
                          {comment.dislikes || 0}
                        </button>

                        <button
                          onClick={() =>
                            setReplyTo({
                              username: comment.user?.username ?? "",
                              commentId: comment.id,
                            })
                          }
                          className="hover:text-white cursor-pointer transition"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  <div className="space-y-3 ml-10">
                    {replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3 text-sm">
                        <div>
                          <Image
                            src={
                              reply.user?.avatar_url || "/default-avatar.png"
                            }
                            alt={reply.user?.username || "User"}
                            width={32}
                            height={32}
                            className="rounded-full object-cover aspect-square"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-white">
                              {reply.user?.username}
                            </p>
                            <span className="text-white/50 text-xs">
                              {formatDistanceToNow(new Date(reply.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-white/80">{reply.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Reply Skeleton (Loading) */}
                    {replySubmittingId === comment.id && (
                      <div className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-24 bg-white/10 rounded" />
                          <div className="h-2 w-1/2 bg-white/5 rounded" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Inline Reply Box */}
                  {replyTo?.commentId === comment.id && (
                    <div className="ml-10 mt-3 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handlePostReply()
                        }
                        placeholder={`Reply to @${replyTo?.username}`}
                        className="flex-1 px-4 py-2 rounded-md bg-white/10 text-white border border-white/10 backdrop-blur-sm placeholder:text-white/40 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handlePostReply}
                          className="px-4 cursor-pointer py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm flex items-center gap-1"
                        >
                          <BiSend className="text-base" />
                          Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyTo(null);
                            setReplyText("");
                          }}
                          className="px-4 cursor-pointer py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
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
