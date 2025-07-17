"use client";

import { TbPlayerPlayFilled } from "react-icons/tb";
import { useState } from "react";

export default function WatchPlayer({
  urls,
  type,
  episodeTitlesPerSeason,
}: {
  urls: string[];
  type?: string;
  episodeTitlesPerSeason?: Record<number, string[]>;
}) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const streamSrc =
    type === "tv"
      ? urls[currentUrlIndex].replace(/\/tv\/\d+\/\d+\/\d+/, (match) => {
          const parts = match.split("/");
          return `/tv/${parts[2]}/${selectedSeason}/${selectedEpisode}`;
        })
      : urls[currentUrlIndex];

  return (
    <div className="space-y-8 font-[family-name:var(--font-geist-mono)]">
      {/* Video Player */}
      <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/10">
        <iframe
          key={streamSrc}
          src={streamSrc}
          className="w-full h-full"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Server Selector */}
      <div className="flex flex-wrap gap-2">
        {urls.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentUrlIndex(index)}
            className={`px-4 cursor-pointer py-2 text-sm flex items-center gap-2 rounded-xl transition font-medium
              ${
                currentUrlIndex === index
                  ? "bg-red-600 text-white font-semibold"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
          >
            <TbPlayerPlayFilled className="text-lg" />
            Server {index + 1}
          </button>
        ))}
      </div>

      {/* TV Controls */}
      {type === "tv" && (
        <div className="space-y-6 border-t border-white/10 pt-6">
          {/* Season Selector */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(episodeTitlesPerSeason ?? {}).map((seasonStr) => {
              const season = Number(seasonStr);
              const isActive = selectedSeason === season;
              return (
                <button
                  key={season}
                  onClick={() => {
                    setSelectedSeason(season);
                    setSelectedEpisode(1);
                  }}
                  className={`px-4 py-2 cursor-pointer text-sm rounded-xl transition font-medium
                    ${
                      isActive
                        ? "bg-red-600 text-white font-semibold"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                >
                  Season {season}
                </button>
              );
            })}
          </div>

          {/* Episode Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {episodeTitlesPerSeason?.[selectedSeason]?.map((title, i) => {
              const ep = i + 1;
              const isActive = selectedEpisode === ep;
              return (
                <button
                  key={ep}
                  onClick={() => setSelectedEpisode(ep)}
                  className={`px-4 cursor-pointer  py-2 text-xs sm:text-sm rounded-xl flex-wrap flex items-center gap-2 transition
                    ${
                      isActive
                        ? "bg-red-600 text-white font-semibold"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                >
                  <TbPlayerPlayFilled className="text-base" />
                  Ep {ep}
                  <span className=" text-left">- {title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Note */}
      <p className="text-left text-white/40 text-xs sm:text-sm mt-4">
        Having issues? Try switching servers or episodes.
      </p>
    </div>
  );
}
