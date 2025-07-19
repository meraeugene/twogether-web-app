"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full transition-all duration-300 ease-in-out hover:scale-105 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      } 
      text-white  bg-white/70 backdrop-blur-3xl   border border-white/10
      shadow-xl hover:shadow-2xl`}
      aria-label="Back to top"
    >
      {/* Glossy reflection layer */}
      <span className="absolute inset-0 rounded-full bg-black/10 blur-sm pointer-events-none" />

      {/* Subtle top-left shine */}
      <span className="absolute top-0 left-0 w-1/2 h-1/2 bg-white/70 rounded-full blur-md opacity-40" />

      <ArrowUp className="w-5 h-5 relative z-10 text-red-500 font-extrabold drop-shadow" />
    </button>
  );
}
