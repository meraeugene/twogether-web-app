"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import { HiPaperAirplane } from "react-icons/hi2";
import { askGemini } from "@/actions/geminiActions";
import ReactMarkdown from "react-markdown";
import { CurrentUser } from "@/types/user";

export default function WatchGemeni({
  title,
  currentUser,
}: {
  title: string;
  currentUser: CurrentUser | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "gemini"; content: string }[]
  >([
    {
      role: "gemini",
      content: `Hi! What would you like to know about “${title}”?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const handleSend = () => {
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");

    startTransition(async () => {
      const reply = await askGemini(question, title);
      setMessages((prev) => [...prev, { role: "gemini", content: reply }]);
    });
  };

  console.log(currentUser);

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed z-50 cursor-pointer bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        {/* Gemini Icon */}
        <svg
          fill="currentColor"
          viewBox="0 0 24 24"
          width="1.5em"
          height="1.5em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" />
        </svg>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            layout
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed bottom-0 right-0 w-full md:w-[400px] h-[70vh] bg-black/90 border-t md:border-l border-white/10 z-50 rounded-t-2xl md:rounded-l-none md:rounded-tl-2xl shadow-lg flex flex-col overflow-hidden backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/80">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  width="1em"
                  height="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" />
                </svg>
                Chat with Gemini
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer p-2 rounded-full hover:bg-white/10 transition"
              >
                <RxCross2 className="text-white text-xl" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 text-sm space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`max-w-[80%] ${
                    msg.role === "user"
                      ? "ml-auto bg-red-600 text-white rounded-lg p-3"
                      : "mr-auto bg-white/10 text-white rounded-lg p-3 border border-white/10"
                  }`}
                >
                  <div className="prose prose-invert text-sm max-w-full">
                    <ReactMarkdown
                      components={{
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {isPending && (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-left text-white/50 italic"
                >
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-300 animate-ping opacity-75" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white border border-blue-400 z-10" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {currentUser ? (
              <div className="p-3 border-t border-white/10 bg-black/80">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      target.style.height = "auto"; // Reset height
                      const maxHeight = 96; // Tailwind h-24 = 6rem = ~4 lines
                      target.style.height =
                        target.scrollHeight > maxHeight
                          ? `${maxHeight}px`
                          : `${target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask Gemini about this movie..."
                    className="flex-1 resize-none overflow-auto max-h-24 bg-white/10 text-white px-3 py-2 text-sm rounded-2xl focus:outline-none focus:ring-1 ring-white/20 placeholder:text-white/50"
                  />

                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition disabled:opacity-50"
                  >
                    <HiPaperAirplane className="text-lg" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="w-full text-center font-[family-name:var(--font-geist-sans)]">
                <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2  text-sm border border-white/10 shadow-lg">
                  Please <span className="text-red-500 font-medium">login</span>{" "}
                  to chat with Gemini.
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
