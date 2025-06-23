"use client";

import { useState, useTransition } from "react";
import { FaPlay } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { Recommendation } from "@/types/recommendation";
import { deleteRecommendation } from "@/actions/recommendationActions";
import ConfirmModal from "@/components/ConfirmModal"; // Make sure path is correct

export default function FilmCard({
  item,
  userId,
}: {
  item: Recommendation;
  userId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmDelete = () => {
    setShowConfirm(false);
    setIsVisible(false);
    startTransition(async () => {
      await deleteRecommendation(userId!, item.recommendation_id);
    });
  };

  return (
    <>
      <AnimatePresence mode="popLayout">
        {isVisible && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              y: 40,
              skewY: 6,
              filter: "blur(3px)",
            }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            layout
            className="group relative w-full rounded-lg overflow-hidden shadow-lg"
          >
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={item.poster_url || "/placeholder.png"}
                alt={item.title}
                priority
                fill
                className="object-cover w-full h-full transition duration-300 group-hover:brightness-50 rounded-lg"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />

              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/50 backdrop-blur-sm">
                <Link
                  href={`/watch/${item.recommendation_id}`}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md ring-1 ring-white/10 hover:ring-3 hover:ring-red-100 transition duration-300 ease-in-out transform hover:scale-110"
                >
                  <FaPlay className="text-xl" />
                </Link>
              </div>

              {userId && (
                <div
                  className="absolute top-4 right-4 z-30 
                    -translate-y-4 opacity-0 
                    group-hover:translate-y-0 group-hover:opacity-100 
                    transition-all duration-500 ease-out"
                >
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isPending}
                    className="px-3 py-1 flex cursor-pointer items-center gap-1 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white shadow"
                  >
                    <MdDelete className="text-base" />
                    {isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-4 text-white translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="text-base font-semibold truncate">
                {item.title}
              </div>

              <div className="flex items-center justify-between text-sm text-white/60 mt-2">
                <span>
                  {item.year} · {item.duration}m
                </span>
                <span className="bg-gray-700 rounded-sm px-2 py-1 text-xs capitalize">
                  {item.type}
                </span>
              </div>

              {item.recommended_by && (
                <div className="text-sm text-gray-400 italic mt-1">
                  Recommended by{" "}
                  <Link
                    href={`/profile/${item.recommended_by.username}/${item.recommended_by.id}`}
                    className="text-white font-medium hover:underline"
                  >
                    {item.recommended_by.username}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Recommendation?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isPending}
      />
    </>
  );
}
