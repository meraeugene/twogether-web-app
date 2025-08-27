"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaGlobe } from "react-icons/fa";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { HeartRating } from "./HeartRating";

export default function RecommendModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    comment: string;
    rating: number;
    visibility: "public" | "private";
  }) => void;
  loading?: boolean;
}) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast.error("You forgot the comment! Your voice deserves a scene. 🎬");
      return;
    }

    if (!rating) {
      toast.error("Please provide a rating! Your opinion matters. ❤️");
      return;
    }

    onSubmit({ comment, rating, visibility });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 md:px-8 bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            className="w-full max-w-xs sm:max-w-sm md:max-w-md p-5 sm:p-6 rounded-xl  text-white border border-white/10 bg-white/5 shadow-xl "
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Recommend This
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm mb-1 block text-white/70">
                  Comment
                </label>
                <textarea
                  rows={3}
                  className="w-full  p-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white resize-none"
                  placeholder="Why do you recommend this?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm mb-1 block text-white/70">
                  Visibility
                </label>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setVisibility("public")}
                    className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm rounded-lg border transition ${
                      visibility === "public"
                        ? "bg-red-600 text-white border-red-500"
                        : "bg-white/5 text-white/70 border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <FaGlobe />
                    Public
                  </button>

                  <button
                    onClick={() => setVisibility("private")}
                    className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm rounded-lg border transition ${
                      visibility === "private"
                        ? "bg-red-600 text-white border-red-500"
                        : "bg-white/5 text-white/70 border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <FaLock />
                    Private
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm mb-1 block text-white/70">
                  Rating
                </label>
                <HeartRating value={rating} onChange={setRating} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 cursor-pointer text-sm rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 cursor-pointer py-2 text-sm rounded-lg bg-white hover:bg-white/90 text-black transition-colors duration-200 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recommending...
                  </>
                ) : (
                  <div className="flex gap-2 items-center">
                    <Sparkles size={12} />
                    Recommend
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
