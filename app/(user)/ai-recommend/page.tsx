"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextInputCard } from "@/components/StepCard";
import { recommendMoviesListWithAI } from "@/actions/geminiActions";
import { TMDBEnrichedResult } from "@/types/tmdb";
import FilmCard from "@/components/FilmCard";
import { adaptTMDBToRecommendation } from "@/utils/ai-recommend/adaptTMDBToRecommendation";
import { useEffect } from "react";
import { formatPromptTitle } from "@/utils/ai-recommend/formatPromptTitle";
import { useAIRecommendations } from "@/stores/useAIRecommendation";
import { toast } from "sonner";

export default function AIRecommendForm() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TMDBEnrichedResult[]>([]);
  const [reason, setReason] = useState("");
  const loadingMessages = useMemo(
    () => [
      "Curating a masterpiece just for you...",
      "Exploring hidden gems in the movie universe...",
      "Summoning stories that match your vibe...",
      "Piecing together your perfect watchlist...",
      "Projecting your perfect movie night...",
    ],
    []
  );

  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

  const { setRecommendations } = useAIRecommendations();

  useEffect(() => {
    if (!loading) return;

    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setCurrentMessage(loadingMessages[i]);
    }, 2000);

    return () => clearInterval(interval);
  }, [loading, loadingMessages]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const { titles, reason } = await recommendMoviesListWithAI(prompt);

      if (!titles.length) {
        toast.error("AI couldn't find any matching movies for your prompt.");
        return;
      }

      const fetched = await Promise.all(
        titles.map(async (title) => {
          const res = await fetch(
            `/api/recommend?query=${encodeURIComponent(title)}`
          );
          const data: TMDBEnrichedResult[] = await res.json();
          return data[0];
        })
      );

      const uniqueById = (arr: TMDBEnrichedResult[]) => {
        const seen = new Set();
        return arr.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      };

      const filtered = uniqueById(fetched.filter(Boolean));
      if (filtered.length === 0) {
        toast.error("No matching movies found for your prompt.");
        return;
      }

      // Update Zustand store with recommendations
      setRecommendations(
        filtered.map((m) => ({
          ...adaptTMDBToRecommendation(m),
          generated_by_ai: true,
        }))
      );
      setResults(filtered);

      setReason(reason);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPrompt("");
    setResults([]);
  };

  const displayPrompt = formatPromptTitle(prompt);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-15 bg-black text-white font-[family-name:var(--font-geist-sans)]">
      <AnimatePresence mode="wait">
        {!results.length && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl text-center"
          >
            <h1 className="text-3xl font-bold mb-6">AI Recommend</h1>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <TextInputCard
                value={prompt}
                onChange={(v) => {
                  setPrompt(v);
                }}
                placeholder="e.g. I want a romantic comedy films 2000 vibes..."
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-3 rounded-xl cursor-pointer bg-gradient-to-br from-red-600 to-pink-600 hover:from-pink-700 hover:to-red-700 transition text-white font-semibold text-lg shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                {loading && (
                  <motion.svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-white animate-pulse"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" />
                  </motion.svg>
                )}
                {loading ? (
                  <motion.span
                    key={currentMessage}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                  >
                    {currentMessage}
                  </motion.span>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Gemini Icon */}
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      width="1em"
                      height="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" />
                    </svg>
                    <span>Magic Recommendations</span>
                  </div>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <div className="flex justify-center mt-4">
              <button
                onClick={resetForm}
                className="px-6 py-2 text-sm rounded-md cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/10 transition font-medium backdrop-blur-sm"
              >
                Recommend Me Again
              </button>
            </div>

            <h2 className="text-2xl font-semibold mt-6 mb-3 text-center">
              {displayPrompt} AI Picks for You
            </h2>

            {reason && (
              <p className="text-center text-sm text-white/70 max-w-2xl mx-auto mb-12">
                {reason}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4">
              {results.map((movie) => (
                <FilmCard
                  key={movie.id}
                  item={{
                    ...adaptTMDBToRecommendation(movie),
                    generated_by_ai: true,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
