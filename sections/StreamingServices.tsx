/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import YouTube, { YouTubePlayer } from "react-youtube";
import { streamingServices } from "@/data/streamingServices";
import {
  Play,
  Power,
  ChevronRight,
  ChevronLeft,
  Volume2,
  RotateCcw,
  Pause,
} from "lucide-react";
import Link from "next/link";

type Trailer = {
  id: number;
  title: string;
  slug: string;
  overview: string;
  year: string;
  backdrop: string | null;
  trailerKey: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StreamingServices() {
  const featuredServices = streamingServices;
  const { data: trailers } = useSWR<Trailer[]>("/api/top-trailers", fetcher);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [powerOn, setPowerOn] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [repeat, setRepeat] = useState(false);

  const playerRef = useRef<YouTubePlayer | null>(null);

  const currentTrailer = trailers?.[currentIndex];

  useEffect(() => {
    setIsPlaying(true);
  }, [currentIndex]);

  const nextTrailer = () => {
    if (!trailers) return;
    setCurrentIndex((prev) => (prev + 1) % trailers.length);
  };

  const prevTrailer = () => {
    if (!trailers) return;
    setCurrentIndex((prev) => (prev - 1 + trailers.length) % trailers.length);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();

    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) playerRef.current.unMute();
    else playerRef.current.mute();

    setIsMuted(!isMuted);
  };

  return (
    <section className="relative py-14 sm:py-20 md:py-28 lg:py-32 bg-[#020202] overflow-hidden">
      {/* Ambilight */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <motion.div
          animate={{
            opacity: powerOn ? 0.4 : 0,
            scale: powerOn ? 1.2 : 0.8,
          }}
          transition={{ duration: 1 }}
          className="w-[80%] h-[50%] bg-red-500/10 blur-[150px] rounded-full"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8 mb-10 sm:mb-14 md:mb-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tighter text-white leading-[0.95]">
              Every platform,
              <br />
              <span className="text-neutral-500">seamlessly integrated.</span>
            </h2>
          </div>

          <p className="text-neutral-400 font-light text-sm sm:text-base md:text-lg max-w-sm border-l border-white/10 pl-6">
            Total control of your cinematic universe from a single, intuitive
            interface.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-0">
          {/* TV */}
          <div className="lg:col-span-10 relative">
            <div className="relative group">
              <div className="relative w-full bg-[#111] p-1.5 md:p-2.5 rounded-[1.5rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#050505] shadow-inner">
                  {/* Power Off */}
                  <AnimatePresence>
                    {!powerOn && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scaleY: 0.002, scaleX: 1.2 }}
                        transition={{ duration: 0.4, ease: "circIn" }}
                        className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center"
                      >
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_red] animate-pulse" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* YouTube Player */}
                  {powerOn && currentTrailer && (
                    <YouTube
                      key={currentTrailer.trailerKey}
                      videoId={currentTrailer.trailerKey}
                      className="w-full h-full"
                      iframeClassName="w-full h-full"
                      opts={{
                        width: "100%",
                        height: "100%",
                        playerVars: {
                          autoplay: 1,
                          controls: 1,
                          modestbranding: 1,
                          rel: 0,
                          mute: isMuted ? 1 : 0,
                          playsinline: 0,
                          fs: 1,
                        },
                      }}
                      onReady={(event) => {
                        playerRef.current = event.target;

                        event.target.playVideo();
                      }}
                      onEnd={() => {
                        if (repeat) {
                          playerRef.current?.seekTo(0);
                          playerRef.current?.playVideo();
                        } else {
                          nextTrailer();
                        }
                      }}
                    />
                  )}

                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-20" />
                </div>
              </div>

              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/80 blur-md rounded-full" />
            </div>

            {/* Info Bar */}
            <AnimatePresence mode="wait">
              {powerOn && currentTrailer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 sm:mt-8 flex flex-col md:flex-row md:items-start justify-between gap-6 border-t border-white/5 pt-6"
                >
                  <div>
                    <h4 className="text-white text-xl sm:text-2xl font-light tracking-tight">
                      {currentTrailer.title}
                    </h4>

                    <div className="flex gap-3 mt-1">
                      <span className="text-neutral-500 text-xs uppercase tracking-widest">
                        {currentTrailer.year}
                      </span>

                      <span className="text-red-500 text-xs font-bold uppercase tracking-widest">
                        4K HDR
                      </span>
                    </div>

                    <p className="text-neutral-400 text-sm mt-2 max-w-md">
                      {currentTrailer.overview}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 md:text-right md:items-end">
                    <p className="text-neutral-500 font-light leading-relaxed">
                      Streaming in Ultra-High Definition via Twogether
                    </p>

                    <Link
                      href={`/tmdb/watch/movie/${currentTrailer.id}/${currentTrailer.slug}`}
                      className="group flex items-center justify-center gap-3 bg-red-700 hover:bg-red-800 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all shadow-lg w-full md:w-auto"
                    >
                      <Play size={18} fill="white" />
                      Watch Now
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* REMOTE */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end mt-10 lg:mt-0">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              className="relative w-20 sm:w-24 h-[360px] sm:h-[440px] bg-gradient-to-b from-[#222] to-[#0a0a0a] rounded-[3rem] border border-white/10 shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-between py-8 sm:py-10"
            >
              {/* Power */}
              <button
                onClick={() => setPowerOn(!powerOn)}
                className={`w-10 h-10 sm:w-12 cursor-pointer sm:h-12 rounded-full flex items-center justify-center transition-all hover:text-white duration-500 ${
                  powerOn
                    ? "bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.6)]"
                    : "bg-white/5 text-neutral-600"
                }`}
              >
                <Power size={20} />
              </button>

              {/* Navigation */}
              <div className="flex flex-col gap-6 items-center w-full">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#111] border border-white/5 shadow-inner flex items-center justify-center">
                  <button
                    onClick={prevTrailer}
                    className="absolute left-1 cursor-pointer text-neutral-600 hover:text-white"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    onClick={nextTrailer}
                    className="absolute right-1 cursor-pointer text-neutral-600 hover:text-white"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <div className="w-4 h-4 rounded-full bg-black shadow-lg" />
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={toggleMute}
                    className={`w-8 h-8 sm:w-10 cursor-pointer sm:h-10 rounded-2xl border flex items-center justify-center transition hover:text-white ${
                      !isMuted
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-white/5 border-white/5 text-neutral-400"
                    }`}
                  >
                    <Volume2 size={18} />
                  </button>

                  <button
                    onClick={() => setRepeat(!repeat)}
                    className={`w-8 h-8 sm:w-10 cursor-pointer sm:h-10 rounded-2xl border flex items-center justify-center transition hover:text-white ${
                      repeat
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-white/5 border-white/5 text-neutral-400"
                    }`}
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 sm:w-14  cursor-pointer sm:h-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:bg-white/80 transition-all"
              >
                {isPlaying ? (
                  <Pause size={24} fill="black" />
                ) : (
                  <Play size={24} fill="black" />
                )}
              </button>
            </motion.div>
          </div>
        </div>

        {/* STREAMING SERVICES */}
        <div className="mt-20 sm:mt-28">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">
              Integrated Partners
            </h3>

            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {featuredServices.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.08,
                }}
                whileHover={{ scale: 1.08 }}
                viewport={{ once: true }}
                className="aspect-square rounded-xl bg-white border border-white/5 flex items-center justify-center p-4 hover:border-white/20"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
