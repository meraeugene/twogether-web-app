// utils/useMessageSound.ts
import { useRef, useEffect } from "react";

export function useMessageSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const interactedRef = useRef(false);

  // Attach global click listener once to unlock audio
  useEffect(() => {
    const handleUserGesture = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/message.mp3");
      }
      audioRef.current.load(); // Ensures it's initialized

      // Try to play silently just to unlock
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      interactedRef.current = true;

      // Cleanup listener after first interaction
      window.removeEventListener("click", handleUserGesture);
    };

    window.addEventListener("click", handleUserGesture);
    return () => window.removeEventListener("click", handleUserGesture);
  }, []);

  return () => {
    if (interactedRef.current && audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().catch((err) => {
        console.warn("Audio play blocked", err);
      });
    }
  };
}
