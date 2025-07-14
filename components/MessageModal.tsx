"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiSendPlane2Fill } from "react-icons/ri";
import { toast } from "sonner";

export default function MessageModal({
  open,
  onClose,
  onSend,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  loading?: boolean;
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) {
      toast.info("Message cannot be empty");
      return;
    }
    onSend(message);
    setMessage("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-full max-w-xs sm:max-w-md p-4 sm:p-6 rounded-xl shadow-xl border border-white/10 bg-white/10 text-white backdrop-blur-2xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Send your flirty first move!
            </h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/20 mb-4 h-28  resize-none text-sm sm:text-base"
              placeholder="Type your message..."
              disabled={loading}
            />
            <div className="flex justify-end flex-wrap gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 cursor-pointer text-sm rounded-lg border border-white/20 bg-white/10 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="px-4 py-2 min-w-[90px] flex items-center justify-center cursor-pointer text-sm rounded-lg bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <RiSendPlane2Fill />
                    Send
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
