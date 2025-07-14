"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  const variants = {
    initial: { y: 50, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        stiffness: 300,
        damping: 30,
        mass: 0.5,
        delay: 1, // Entrance delay only
      },
    },
    exit: {
      y: 20,
      opacity: 0,
      scale: 0.98,
      transition: {
        stiffness: 300,
        damping: 30,
        mass: 0.5,
        delay: 0, // No exit delay
      },
    },
  } as const;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          layout
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed font-[family-name:var(--font-geist-sans)] bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[450px] bg-white/10 backdrop-blur-lg border border-white/20 text-white px-5 py-4 rounded-xl shadow-xl z-50"
        >
          <div className="text-sm md:text-base mb-4">
            We uses cookies to keep you logged in, remember your preferences,
            and improve your experience. By continuing, you agree to our use of
            cookies.
          </div>
          <div className="bg-white/20 mt-6 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex  items-center justify-end w-full ">
            <button
              onClick={handleAccept}
              className="px-8 py-2 text-sm font-medium backdrop-blur-lg rounded-lg bg-white text-black  w-full
      hover:bg-neutral-200 cursor-pointer  transition"
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
