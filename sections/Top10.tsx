/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { fetcher } from "@/utils/swr/fetcher";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Disc,
  VolumeX,
  Volume2,
} from "lucide-react";
import Link from "next/link";

interface Movie {
  id: string | number;
  title: string;
  overview: string;
  backdrop: string;
  releaseDate?: string;
  trailerKey?: string;
  slug: string;
}

export default function UltraWideCinema() {
  const { data, isLoading } = useSWR<Movie[]>("/api/top-ten", fetcher);
  const movies = data || [];

  const [index, setIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const activeMovie = movies[index];

  const handleNext = () => setIndex((prev) => (prev + 1) % movies.length);
  const handlePrev = () =>
    setIndex((prev) => (prev - 1 + movies.length) % movies.length);

  if (isLoading)
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Disc className="animate-spin text-white" size={40} strokeWidth={1} />
        <span className="text-[10px] tracking-[0.5em] text-zinc-500 uppercase">
          Calibrating_Stream
        </span>
      </div>
    );

  if (!activeMovie) return null;

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden font-sans flex flex-col">
      {/* TRAILER SECTION */}
      <div className="relative w-full h-[45vh]   lg:h-screen lg:absolute lg:inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMovie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="relative w-full h-full"
          >
            {activeMovie.trailerKey ? (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${activeMovie.trailerKey}?autoplay=1&mute=${
                    isMuted ? 1 : 0
                  }&controls=0&modestbranding=1&rel=0&loop=1&playlist=${
                    activeMovie.trailerKey
                  }&vq=hd1080`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                 h-[180vh] w-full  md:h-[115vh] object-cover"
                  allow="autoplay; encrypted-media"
                />
              </div>
            ) : (
              <img
                src={activeMovie.backdrop}
                alt=""
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/40" />
            <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-transparent md:block hidden" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CONTENT SECTION */}
      <div className="relative z-20 flex flex-col gap-12 lg:gap-0 lg:flex-row  lg:items-end justify-between  px-6 sm:px-8 lg:px-20 md:py-10   lg:h-screen">
        {/* MOVIE CONTENT */}
        <div className="max-w-4xl ">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${activeMovie.id}`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center lg:hidden justify-between mb-4">
                <div className="flex items-end gap-4 ">
                  <span className="text-4xl md:text-5xl font-black opacity-20 italic">
                    0{index + 1}
                  </span>

                  <div className="w-24 md:w-32 h-0.5 bg-zinc-800 mb-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ x: "-100%" }}
                      animate={{
                        x: `${((index + 1) / movies.length) * 100 - 100}%`,
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 md:p-4 cursor-pointer rounded-full border border-white/10 hover:bg-white hover:text-black transition-all"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-7xl  font-black uppercase tracking-tighter mb-6 leading-none italic">
                {activeMovie.title}
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base md:text-lg max-w-xl md:max-w-2xl mb-8 line-clamp-4 leading-relaxed">
                {activeMovie.overview}
              </p>

              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <Link
                  href={`/tmdb/watch/movie/${activeMovie.id}/${activeMovie.slug}`}
                  className="flex items-center gap-2 sm:gap-4 h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-10 bg-white text-black font-black uppercase text-xs sm:text-sm tracking-widest hover:bg-white/90 transition-transform"
                >
                  <Play size={18} className="sm:w-5 sm:h-5" fill="black" />
                  Watch Feature
                </Link>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    className="h-10 cursor-pointer w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex items-center justify-center border border-white/20 hover:bg-white/10"
                  >
                    <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="h-10 cursor-pointer w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex items-center justify-center border border-white/20 hover:bg-white/10"
                  >
                    <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="lg:flex flex-col hidden  items-end">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 md:p-4 cursor-pointer rounded-full border border-white/10 hover:bg-white hover:text-black transition-all"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="flex items-end gap-4">
            <span className="text-4xl md:text-5xl font-black opacity-20 italic">
              0{index + 1}
            </span>

            <div className="w-24 md:w-32 h-0.5 bg-zinc-800 mb-2 overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ x: "-100%" }}
                animate={{
                  x: `${((index + 1) / movies.length) * 100 - 100}%`,
                }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
