import { useCallback, useRef, useEffect } from "react";

export function useMessageSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const interactedRef = useRef(false);

  useEffect(() => {
    const handleUserGesture = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/message.mp3");
        audioRef.current.preload = "auto";
        audioRef.current.loop = false;
        audioRef.current.load();
      }
      interactedRef.current = true;
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };

    window.addEventListener("pointerdown", handleUserGesture);
    window.addEventListener("keydown", handleUserGesture);
    return () => {
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
      audioRef.current?.pause();
      audioRef.current = null;
      interactedRef.current = false;
    };
  }, []);

  return useCallback(() => {
    const audio = audioRef.current;
    if (!interactedRef.current || !audio) return;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => { /* Browser sound permissions may still block playback. */ });
  }, []);
}
