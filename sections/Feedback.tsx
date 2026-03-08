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
  const [cardsPerView, setCardsPerView] = useState(3);

  // Detect screen size
  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 640) setCardsPerView(1);
      else if (window.innerWidth < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const handleNext = useCallback(() => {
    if (!testimonials) return;

    setCurrentIndex((prev) =>
      prev >= testimonials.length - cardsPerView ? 0 : prev + 1,
    );
  }, [testimonials, cardsPerView]);

  const handlePrev = useCallback(() => {
    if (!testimonials) return;

    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - cardsPerView : prev - 1,
    );
  }, [testimonials, cardsPerView]);

  useEffect(() => {
    if (!testimonials || isPaused || testimonials.length <= cardsPerView)
      return;

    const interval = setInterval(handleNext, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [testimonials, isPaused, handleNext, cardsPerView]);

  if (!testimonials) return null;

  const progress = (currentIndex / (testimonials.length - cardsPerView)) * 100;

  const translate = 100 / cardsPerView;

  return (
    <section className="relative py-20 md:py-28 lg:py-32 bg-[#030303] overflow-hidden border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#fb2c36_0.8px,transparent_0.8px)] [background-size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[700px] lg:w-[800px] h-[350px] md:h-[450px] lg:h-[500px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 md:mb-20 lg:mb-24">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 mb-6"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
                Community
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tighter text-white leading-[0.95]">
              Trusted by
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                True Cinephiles.
              </span>
            </h2>
          </div>

          <div className="flex flex-col lg:items-end gap-6">
            <p className="text-neutral-400 font-light text-sm sm:text-base md:text-lg max-w-sm lg:text-right">
              Hear from the community that’s changing how we watch together.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="p-3 md:p-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={handleNext}
                className="p-3 md:p-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            animate={{ x: `-${currentIndex * translate}%` }}
            transition={{ type: "spring", stiffness: 150, damping: 22 }}
            className="flex"
          >
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="shrink-0 w-full sm:w-1/2 lg:w-1/3 px-3"
              >
                <div className="relative h-full p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-neutral-900/40 border border-white/10 flex flex-col justify-between group transition-all duration-500 hover:border-red-500/40">
                  <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div>
                    <Quote
                      className="text-red-500 mb-6 md:mb-8 opacity-40 group-hover:opacity-100 transition-opacity"
                      size={30}
                      fill="currentColor"
                    />

                    <p className="text-base md:text-lg text-white font-light leading-relaxed mb-10 md:mb-12 italic min-h-[80px]">
                      &quot;{t.text}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-t border-white/5 pt-6 md:pt-8">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl text-red-400 border-red-500/20 bg-red-500/5 flex items-center justify-center font-bold uppercase text-sm">
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

        {/* Progress */}
        <div className="mt-12 md:mt-16 relative h-[1px] w-full bg-white/5">
          <motion.div
            initial={false}
            animate={{ width: `${progress}%`, left: 0 }}
            className="absolute top-0 h-full bg-gradient-to-r from-transparent via-red-500 to-transparent"
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />

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
