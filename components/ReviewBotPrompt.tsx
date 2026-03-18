"use client";

import { submitFeedback } from "@/actions/feedbackActions";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, Heart, Send, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

const STORAGE_KEY = "twogether_review_bot_state";
const PROMPT_DELAY_MS = 10000;
const COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7;

function getStoredState() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as {
      dismissedUntil?: number;
      submittedAt?: number;
    };
  } catch {
    return null;
  }
}

function setStoredState(state: { dismissedUntil?: number; submittedAt?: number }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function ReviewBotPrompt() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get("reviewbot") === "1";
    const isDev = process.env.NODE_ENV === "development";
    const stored = getStoredState();
    const now = Date.now();

    if (!previewMode && !isDev) {
      if (stored?.submittedAt) return;
      if (stored?.dismissedUntil && stored.dismissedUntil > now) return;
    }

    if (previewMode) {
      setVisible(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      setVisible(true);
    }, PROMPT_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, []);

  const closeForNow = () => {
    setVisible(false);
    setStoredState({ dismissedUntil: Date.now() + COOLDOWN_MS });
  };

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
      setVisible(false);
      setName("");
      setComment("");
      toast.success("Thanks. Your review was sent.");
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[118] bg-black/80 backdrop-blur-[3px]"
            onClick={closeForNow}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_78%,rgba(251,44,54,0.14),transparent_18%),radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.06),transparent_28%)]" />
          </motion.div>

          <div className="pointer-events-none fixed inset-0 z-[119] flex items-end justify-center px-4 pb-4 sm:justify-end sm:px-6 sm:pb-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ delay: 0.05, duration: 0.28, ease: "easeOut" }}
              className="pointer-events-none mb-4 hidden max-w-[240px] text-right sm:block"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-black/75 px-3 py-2 text-[11px] font-medium tracking-[0.08em] text-white/82 shadow-[0_16px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                <span>leave a quick review</span>
                <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pointer-events-auto relative w-full max-w-sm sm:max-w-[380px]"
            >
              <div className="absolute -inset-3 rounded-[34px] bg-red-500/10 blur-2xl" />
              <div className="absolute -top-10 right-8 sm:hidden">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-black/80 px-3 py-2 text-[11px] font-medium text-white/82 backdrop-blur-xl">
                  <span>leave a quick review</span>
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#050505]/96 text-white shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,44,54,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_35%)]" />

                <div className="relative flex items-start justify-between px-5 pt-5 sm:px-6 sm:pt-6">
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-red-500/20" />
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/34">
                        Testimonial
                      </p>
                      <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
                        Enjoying Twogether?
                      </h3>
                      <p className="mt-1.5 max-w-xs text-sm leading-6 text-white/60">
                        Share one short comment and we may feature it on the
                        landing page.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeForNow}
                    aria-label="Close review prompt"
                    className="rounded-full p-2 text-white/42 transition hover:bg-white/6 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative mt-5 space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
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
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-red-500/35 focus:bg-white/[0.06]"
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
                      placeholder="I found something good way faster than usual."
                      className="w-full resize-none rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-white/24 focus:border-red-500/35 focus:bg-white/[0.06]"
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[118px]"
                    >
                      <Send className="h-4 w-4" />
                      {isPending ? "Sending" : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
