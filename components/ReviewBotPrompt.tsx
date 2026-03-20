"use client";

import { submitFeedback } from "@/actions/feedbackActions";
import { MessageCircleHeart, Send, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

const STORAGE_KEY = "twogether_review_bot_state";

function getStoredState() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as {
      submittedAt?: number;
    };
  } catch {
    return null;
  }
}

function setStoredState(state: { submittedAt?: number }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function ReviewBotPrompt() {
  const [launcherVisible, setLauncherVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get("reviewbot") === "1";
    const isDev = process.env.NODE_ENV === "development";
    const stored = getStoredState();

    if (!previewMode && !isDev) {
      if (stored?.submittedAt) return;
    }

    setLauncherVisible(true);

    if (previewMode) {
      setOpen(true);
    }
  }, []);

  const closePanel = () => {
    setOpen(false);
    document.body.classList.remove("overflow-hidden");
  };

  const openPanel = () => {
    setOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  useEffect(() => {
    if (open) {
      setPanelMounted(true);
      return;
    }

    const timeout = setTimeout(() => {
      setPanelMounted(false);
    }, 180);

    return () => clearTimeout(timeout);
  }, [open]);

  const handleSubmit = () => {
    const trimmedName = name.trim() || "Guest Viewer";
    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      toast.error("Please add a short comment.");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("text", trimmedComment);

    startTransition(async () => {
      const result = await submitFeedback(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      setStoredState({ submittedAt: Date.now() });
      mutate("/api/testimonials");
      setLauncherVisible(false);
      setOpen(false);
      setName("");
      setComment("");
      toast.success("Thanks. Your review was sent.");
    });
  };

  return launcherVisible ? (
    <>
      <button
        type="button"
        aria-label="Close feedback panel"
        onClick={closePanel}
        className={`fixed inset-0 z-[118] bg-black/55 backdrop-blur-md transition-opacity duration-200 ${
          panelMounted ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span className="sr-only">Close feedback panel</span>
      </button>

      <div className="pointer-events-none fixed inset-0 z-[119]">
        {panelMounted && (
          <div
            className={`pointer-events-auto absolute left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-[22rem] -translate-x-1/2 -translate-y-1/2 transform transition-all duration-200 ease-out sm:max-w-[28rem] ${
              open ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"
            }`}
          >
            <div className="absolute -inset-2 rounded-[30px] bg-red-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#050505]/96 text-white shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,44,54,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_35%)]" />

              <div className="relative flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-7">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/34">
                    Feedback
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
                    Enjoying Twogether?
                  </h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-6 text-white/60">
                    Share one short comment or suggestion to help us improve.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="Close feedback panel"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/6 text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mt-4 space-y-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-7">
                <div>
                  <label
                    htmlFor="review-name"
                    className="mb-2 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/34"
                  >
                    Name
                  </label>
                  <input
                    id="review-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Guest Viewer"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-red-500/35 focus:bg-white/[0.06]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="review-comment"
                    className="mb-2 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/34"
                  >
                    Comment
                  </label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="ideas, feedback, or just a quick note about your experience"
                    className="w-full resize-none rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/24 focus:border-red-500/35 focus:bg-white/[0.06]"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-white/42">
                    Keep it short, honest, and personal.
                  </p>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[112px]"
                  >
                    <Send className="h-4 w-4" />
                    {isPending ? "Sending" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!open && (
          <button
            type="button"
            onClick={openPanel}
            aria-label="Open feedback panel"
            className="group fixed z-50 cursor-pointer bottom-4 right-4  h-12 w-12  overflow-hidden rounded-full border border-white/10 bg-[#080808]/95 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] sm:h-14 sm:w-14"
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/16 text-red-300 ring-1 ring-inset ring-red-400/30 sm:h-10 sm:w-10">
                <MessageCircleHeart className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </button>
        )}
      </div>
    </>
  ) : null;
}
