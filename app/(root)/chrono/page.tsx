"use client";

import useSWR from "swr";
import Image from "next/image";
import { Timeline } from "@/components/ui/Timeline";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineFieldTime } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { FRANCHISE_GROUPS } from "./data";
import { Recommendation } from "@/types/recommendation";
import { FaPlay } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ChronologicalPage() {
  const [selectedFranchise, setSelectedFranchise] = useState<string>(
    "marvel-cinematic-universe"
  );
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { data, error, isLoading } = useSWR<{
    name: string;
    movies: Recommendation[];
  }>(`/api/tmdb/chronological?franchise=${selectedFranchise}`, fetcher);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );

  if (error || !data) return <ErrorMessage />;

  const getSlugFromTitle = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleWatchNow = (movie: Recommendation) => {
    const slug = getSlugFromTitle(movie.title);
    if (movie.is_tmdb_recommendation && movie.recommended_by.id === "tmdb") {
      router.push(`/tmdb/watch/${movie.type}/${movie.tmdb_id}/${slug}`);
    }
  };

  const timelineData = data.movies.map((movie, index) => {
    return {
      order: index + 1,
      title: movie.title,
      content: (
        <div className="nft   border border-white/10 rounded-lg shadow-[0_7px_20px_5px_rgba(0,0,0,0.5)]bg-gradient-to-t from-[#1e1e1e] to-[#333] backdrop-blur-md">
          <div className="p-4 flex flex-col gap-3 group relative">
            {/* Poster */}
            <div className="relative">
              <Image
                src={
                  movie.poster_url?.startsWith("http")
                    ? movie.poster_url
                    : `https://image.tmdb.org/t/p/w500${movie.poster_url}`
                }
                alt={movie.title}
                unoptimized
                width={500}
                height={750}
                className="rounded-md w-full object-cover lg:group-hover:brightness-50 transition duration-300"
              />

              {/* Hover play button */}
              <div className="hidden lg:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/5 z-10">
                <button
                  onClick={() => handleWatchNow(movie)}
                  className="flex cursor-pointer items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md ring-1 ring-white/10 hover:ring-2 hover:ring-red-100 transition duration-300 ease-in-out transform hover:scale-110"
                >
                  <FaPlay className="text-xl" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-white font-bold text-xl">{movie.title}</h2>

            {/* Year + Duration */}
            {(movie.year || movie.duration) && (
              <div className="flex items-center gap-2 text-neutral-300 text-sm">
                {movie.year && (
                  <span className="text-neutral-200">{movie.year}</span>
                )}
                {movie.year && movie.duration && <span>・</span>}
                {movie.duration && <span>{movie.duration} min</span>}
              </div>
            )}

            {/* Description */}
            {movie.comment && (
              <p className="text-neutral-300 text-sm">{movie.comment}</p>
            )}

            {/* Mobile-only play button */}
            <button
              onClick={() => handleWatchNow(movie)}
              className="lg:hidden w-full cursor-pointer flex items-center gap-3 text-white bg-red-600 hover:bg-red-700 transition p-2 rounded-md font-[family-name:var(--font-geist-mono)]text-sm mt-2 mb-4"
            >
              <FaPlay className="text-white text-xs" />
              Watch Now
            </button>
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="min-h-screen  relative bg-black text-white pt-28 pb-16 px-6 lg:px-24 xl:px-32 font-[family-name:var(--font-geist-sans)] md:pt-34">
      {/* Combined Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Dots */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />
      </div>

      {/* Timeline Section */}
      <div className="mb-24   mx-auto">
        <h2 className="text-3xl  font-bold  md:text-4xl lg:text-5xl text-center    ">
          {data.name}
        </h2>
        <Timeline data={timelineData} />
      </div>

      {/* Floating Button with Franchise Picker */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer text-black p-3 rounded-full shadow-lg flex items-center gap-2 font-semibold"
        >
          <AiOutlineFieldTime className="w-5 h-5 text-red-500 font-extrabold" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed  border border-white/10 inset-0 z-50 overflow-y-auto p-6
             bg-black/40 backdrop-blur-3xl text-white space-y-4
             md:top-0 md:right-0 md:bottom-0 md:left-auto md:w-[400px]
             md:shadow-xl"
            >
              <div className="flex items-center mb-0 justify-between">
                <li>
                  <span className="text-lg font-bold">
                    Chronological Movies
                  </span>
                </li>

                <li
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer  text-right"
                >
                  <span className="w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-white/10 transition">
                    <IoClose className="w-6 h-6" />
                  </span>
                </li>
              </div>
              {FRANCHISE_GROUPS.map(({ genre, items }) => (
                <div key={genre} className="space-y-3">
                  <li className="uppercase text-xs tracking-wider text-white/60 px-2 pt-4">
                    {genre}
                  </li>
                  {items.map(({ key, label }) => (
                    <li
                      key={key}
                      onClick={() => {
                        setSelectedFranchise(key);
                        setIsOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`group cursor-pointer relative text-lg font-semibold tracking-wide px-5 py-3.5 rounded-lg border backdrop-blur-xl transition-all flex items-center gap-3
        ${
          selectedFranchise === key
            ? "bg-white text-black border-white/20"
            : "text-white/90 border-white/10 bg-white/5 hover:bg-white/20"
        }`}
                    >
                      {label}
                    </li>
                  ))}
                </div>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
