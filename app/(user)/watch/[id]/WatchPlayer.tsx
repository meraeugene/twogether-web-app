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
    <div className="space-y-6">
      {/* Video Player */}
      <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10">
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
            className={`px-4 flex items-center gap-2 cursor-pointer py-2 text-sm rounded-xl font-mono border transition
  ${
    currentUrlIndex === index
      ? "bg-red-600 text-white border-transparent font-semibold"
      : "bg-white/10 text-white/60 border-white/20 hover:bg-white/20"
  }`}
          >
            <TbPlayerPlayFilled />
            Server {index + 1}
          </button>
        ))}
      </div>

      {/* TV Controls */}
      {type === "tv" && (
        <div className="space-y-4 border-t border-white/10 pt-6">
          {/* Season Buttons */}
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
                  className={`px-4 py-2 text-sm font-mono rounded-xl border transition cursor-pointer
  ${
    isActive
      ? "bg-red-600 text-white border-transparent font-semibold"
      : "bg-white/10 text-white/60 border-white/20 hover:bg-white/20"
  }`}
                >
                  Season {season}
                </button>
              );
            })}
          </div>

          {/* Episode Buttons */}
          <div className="flex flex-wrap gap-3">
            {episodeTitlesPerSeason?.[selectedSeason]?.map((title, i) => {
              const ep = i + 1;
              return (
                <button
                  key={ep}
                  onClick={() => setSelectedEpisode(ep)}
                  className={`px-4 flex items-center gap-2 cursor-pointer py-2 rounded-xl text-sm font-mono border transition
  ${
    selectedEpisode === ep
      ? "bg-red-600 text-white border-transparent font-semibold"
      : "bg-white/10 text-white/60 border-white/20 hover:bg-white/20"
  }`}
                >
                  <TbPlayerPlayFilled />
                  Ep {ep}
                  <span>- {title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Info */}
      <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left font-mono">
        Having issues? Try switching servers or episodes.
      </p>
    </div>
  );
}
