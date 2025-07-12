"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Recommendation } from "@/types/recommendation";
import FilmCard from "@/components/FilmCard";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const ITEMS_PER_PAGE = 6;

export default function GenreRecoRow({
  genre,
  items,
}: {
  genre: string;
  items: Recommendation[];
}) {
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
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold">{genre} Picks</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={page === 0}
            className="bg-white/10 cursor-pointer hover:bg-white/20 disabled:opacity-30 text-white p-2 rounded-full transition"
          >
            <HiChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            disabled={page === maxPage}
            className="bg-white/10 cursor-pointer hover:bg-white/20 disabled:opacity-30 text-white p-2 rounded-full transition"
          >
            <HiChevronRight size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={page}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mt-6"
        >
          {paginated.map((item) => (
            <FilmCard key={item.recommendation_id} item={item} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
