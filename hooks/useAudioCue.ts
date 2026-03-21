"use client";

import { useCallback, useRef } from "react";

export function useAudioCue(src: string, volume = 0.6) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.preload = "auto";
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Ignore autoplay-related failures until the user has interacted.
    });
  }, [src, volume]);

  return play;
}
