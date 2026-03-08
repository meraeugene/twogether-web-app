"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/utils/swr/fetcher";

type Testimonials = {
  id: string;
  name: string;
  text: string;
  is_new: boolean;
};

const AUTO_PLAY_INTERVAL = 3000;

const Feedback = () => {
  const { data: testimonials } = useSWR<Testimonials[]>(
    "/api/testimonials",
    fetcher,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    if (!testimonials) return;
    setCurrentIndex((prev) => (prev >= testimonials.length - 3 ? 0 : prev + 1));
  }, [testimonials]);

  const handlePrev = useCallback(() => {
    if (!testimonials) return;
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 3 : prev - 1,
    );
  }, [testimonials]);

  useEffect(() => {
    if (!testimonials || isPaused || testimonials.length <= 3) return;
    const interval = setInterval(handleNext, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [testimonials, isPaused, handleNext]);

  if (!testimonials) return null;

  // Calculate progress percentage
  const progress = (currentIndex / (testimonials.length - 3)) * 100;

  return (
    <section className="relative py-32 bg-[#030303] overflow-hidden border-t border-white/5">
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#fb2c36_0.8px,transparent_0.8px)] [background-size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto ">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-24">
          <div className="max-w-2xl w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-6"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
                Community
              </span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-white leading-[0.9]">
              Trusted by <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                True Cinephiles.
              </span>
            </h2>
          </div>

          <div className="flex flex-col items-end gap-6 w-full md:w-auto">
            <p className="text-neutral-400 font-light text-lg max-w-xs text-right hidden md:block">
              Hear from the community that’s changing how we watch together.
            </p>

            {/* NEW INDICATOR & NAV DESIGN */}

            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="p-4 cursor-pointer rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={handleNext}
                className="p-4 cursor-pointer rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* --- 3-CARD VIEWPORT --- */}
        <div
          className="relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            animate={{ x: `-${currentIndex * 33.3333}%` }}
            transition={{ type: "spring", stiffness: 150, damping: 22 }}
            className="flex -ml-3"
          >
            {testimonials.map((t) => (
              <div key={t.id} className="w-full md:w-1/3 shrink-0 px-3">
                <div className="relative h-full p-10 rounded-[2.5rem] bg-neutral-900/40 border border-white/10 flex flex-col justify-between group transition-all duration-500 hover:border-red-500/40">
                  <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div>
                    <Quote
                      className="text-red-500 mb-8 opacity-40 group-hover:opacity-100 transition-opacity"
                      size={32}
                      fill="currentColor"
                    />
                    <p className="text-lg text-white font-light leading-relaxed mb-12 italic min-h-[100px]">
                      &quot;{t.text}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-t border-white/5 pt-8">
                    <div className="h-10 w-10 rounded-xl text-red-400 border-red-500/20 bg-red-500/5 flex items-center justify-center font-bold uppercase text-sm">
                      {t.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm tracking-tight">
                        {t.name}
                      </span>
                      <span className="text-red-500/80 text-[10px] font-bold tracking-[0.2em] uppercase">
                        Verified Member
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* --- NEW PROGRESS TRACK --- */}
        <div className="mt-16 relative h-[1px] w-full bg-white/5">
          <motion.div
            initial={false}
            animate={{ width: `${progress}%`, left: 0 }}
            className="absolute top-0 h-full bg-gradient-to-r from-transparent via-red-500 to-transparent"
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
          {/* Subtle marks like a ruler */}
          <div className="absolute top-0 w-full flex justify-between px-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-1 w-[1px] bg-white/10 -translate-y-1/2"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feedback;
