"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationScroll() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const preserveHistoryScroll = () => {
      // Back/Forward should restore the saved position instead of going to the top.
      previousPathname.current = window.location.pathname;
    };

    window.addEventListener("popstate", preserveHistoryScroll);
    return () => window.removeEventListener("popstate", preserveHistoryScroll);
  }, []);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    // Keep deep links focused on their anchor and leave query-only filters alone.
    if (window.location.hash) return;

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
