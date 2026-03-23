"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Recommendation } from "@/types/recommendation";
import FilmCard from "@/components/FilmCard";
import {
  buttonVariants,
  containerVariants,
  itemVariants,
} from "@/utils/suggestionsAnimation";

const ITEMS_PER_PAGE = 6;

export default function LatestRecoRow({ items }: { items: Recommendation[] }) {
  const [page, setPage] = useState(0);
  const maxPage = Math.ceil(items.length / ITEMS_PER_PAGE) - 1;

  const handleNext = () => {
    if (page < maxPage) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const paginated = items.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Latest Reco</h2>{" "}
        <div className="flex gap-3">
          <motion.button
            onClick={handlePrev}
            disabled={page === 0}
            className="p-2 md:p-3 rounded-full cursor-pointer bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-gray-800 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={handleNext}
            disabled={page === maxPage}
            className="p-2 md:p-3 rounded-full cursor-pointer bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-gray-800 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={page}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 xl:grid-cols-5 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {paginated.map((item) => (
            <motion.div
              key={`${item.recommendation_id}-${page}`}
              variants={itemVariants}
              layout
            >
              <FilmCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {maxPage > 0 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: maxPage + 1 }, (_, index) => (
            <motion.button
              key={index}
              onClick={() => setPage(index)}
              className={`w-2 h-2 cursor-pointer rounded-full transition-all duration-300 ${
                page === index
                  ? "bg-red-500 w-6"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
