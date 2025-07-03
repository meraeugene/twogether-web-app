"use client";
import { TbPlayerPlayFilled } from "react-icons/tb";
import { useState } from "react";

export default function WatchPlayer({ urls }: { urls: string[] }) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="aspect-video rounded-md overflow-hidden shadow-lg">
        <iframe
          key={currentUrlIndex} // Force reload when switching
          src={urls[currentUrlIndex]}
          className="w-full h-full"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Server Buttons */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {urls.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentUrlIndex(index)}
              className={`px-4 flex items-center gap-2 cursor-pointer py-2 text-sm rounded-md font-mono transition border
              ${
                currentUrlIndex === index
                  ? "bg-red-600 text-white border-transparent"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              <TbPlayerPlayFilled />
              Stream {index + 1}
            </button>
          ))}
        </div>
        <p className="text-gray-400 text-sm">
          {" "}
          Having issues? Switch servers using the buttons at the top-left corner
          of the video player.
        </p>
      </div>
    </div>
  );
}
