"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 md:px-8 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            className="w-full max-w-xs sm:max-w-sm md:max-w-md p-5 sm:p-6 rounded-2xl shadow-xl border border-white/10 bg-white/10 text-white backdrop-blur-2xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-2">{title}</h2>
            <p className="text-sm sm:text-base text-white/70 mb-6">
              {description}
            </p>

            <div className="flex flex-wrap sm:flex-nowrap justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white"
              >
                {loading ? "Processing..." : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
