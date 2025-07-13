"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaGlobe } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { useState } from "react";

export function PrivacyModal({
  open,
  currentVisibility,
  onClose,
  onChange,
  loading,
}: {
  open: boolean;
  currentVisibility: "private" | "public";
  onClose: () => void;
  onChange: (newVisibility: "private" | "public") => void;
  loading?: boolean;
}) {
  const [pendingTarget, setPendingTarget] = useState<
    "private" | "public" | null
  >(null);

  const options = [
    { label: "Private", value: "private", icon: <FaLock /> },
    { label: "Public", value: "public", icon: <FaGlobe /> },
  ];

  const handleChange = (value: "private" | "public") => {
    setPendingTarget(value);
    onChange(value);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            className="w-full max-w-xs sm:max-w-sm md:max-w-md p-5 sm:p-6 rounded-2xl shadow-xl border border-white/10 bg-white/10 text-white backdrop-blur-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Edit Privacy
            </h2>

            <div className="space-y-2">
              {options.map((opt) => {
                const isPending = loading && pendingTarget === opt.value;

                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      handleChange(opt.value as "private" | "public")
                    }
                    disabled={loading}
                    className={`w-full flex cursor-pointer items-center justify-between px-4 py-2 rounded-lg border text-left transition-all
                      ${
                        currentVisibility === opt.value
                          ? "bg-white/10 border-white/30"
                          : "border-white/10 hover:bg-white/5"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {opt.icon}
                      <span className="text-sm sm:text-base">{opt.label}</span>
                    </div>

                    {isPending && (
                      <ImSpinner2 className="animate-spin text-white/80 text-sm" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => !loading && onClose()}
                disabled={loading}
                className="px-4 py-2 cursor-pointer text-sm rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
