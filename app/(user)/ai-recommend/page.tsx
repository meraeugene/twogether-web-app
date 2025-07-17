"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextInputCard } from "@/components/StepCard";
import { recommendMoviesListWithAI } from "@/actions/geminiActions";
import { TMDBEnrichedResult } from "@/types/tmdb";
import FilmCard from "@/components/FilmCard";
import { adaptAIGeneratedToRecommendation } from "@/utils/ai-recommend/adaptAIGeneratedToRecommendation";
import { formatPromptTitle } from "@/utils/ai-recommend/formatPromptTitle";
import { useAIRecommendations } from "@/stores/useAIRecommendation";
import { toast } from "sonner";
import { uniqueById } from "@/utils/ai-recommend/uniqueById";
import { FiRefreshCcw } from "react-icons/fi";

export default function AIRecommendForm() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  const {
    recommendations,
    prompt,
    reason,
    setRecommendations,
    setPrompt,
    setReason,
    clearAll,
  } = useAIRecommendations();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to get recommendations.");
      return;
    }

    setLoading(true);
    setProgress(5);
    setLoadingMessage("Summoning hidden gems from the movie multiverse...");

    try {
      const { titles, reason } = await recommendMoviesListWithAI(prompt);

      if (!titles.length) {
        toast.error("AI couldn't find any matching movies for your prompt.");
        return;
      }

      const total = titles.length;
      const results: TMDBEnrichedResult[] = [];

      setLoadingMessage("Hunting across galaxies for your match...");

      for (let i = 0; i < total; i++) {
        const title = titles[i];

        setLoadingMessage(`Fetching "${title}" from the vault...`);

        try {
          const res = await fetch(
            `/api/recommend?query=${encodeURIComponent(title)}`
          );
          const data: TMDBEnrichedResult[] = await res.json();
          if (data[0]) results.push(data[0]);
        } catch (err) {
          console.error(`Failed to fetch ${title}`, err);
        }

        setProgress(Math.round(((i + 1) / total) * 100));
      }

      const filtered = uniqueById(results);

      setLoadingMessage("Magic complete. Let’s hit play!");

      setRecommendations(
        filtered.map((m) => ({
          ...adaptAIGeneratedToRecommendation(m),
          generated_by_ai: true,
        }))
      );

      setReason(reason);
      setLoadingMessage("✅ Ready! Enjoy your curated list.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    clearAll();
    sessionStorage.removeItem("ai-recommendations");
  };

  const displayPrompt = formatPromptTitle(prompt);

  return (
    <div className="min-h-screen  flex flex-col px-7 md:px-15 items-center justify-center pt-24 pb-16  lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 bg-black text-white font-[family-name:var(--font-geist-sans)]">
      <AnimatePresence mode="wait">
        {!loading && recommendations.length === 0 && (
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

              <div className="bg-white/20 mt-6 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex justify-center items-center">
                <button
                  type="submit"
                  disabled={loading && !prompt.trim()}
                  className="w-full  py-3 rounded-xl 
      bg-white text-black 
      hover:bg-neutral-200 
      transition font-semibold text-lg 
      shadow-md flex items-center justify-center gap-2 
      backdrop-blur-sm 
      disabled:opacity-60 disabled:cursor-not-allowed 
      cursor-pointer"
                >
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
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {(loading || recommendations.length > 0) && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {/* Reset Button */}
            {!loading && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 text-sm lg:text-base rounded-md cursor-pointer bg-white text-black hover:bg-neutral-200 border border-black/10 transition font-medium backdrop-blur-sm flex items-center gap-2"
                >
                  <FiRefreshCcw className="text-base" />
                  Recommend Me Again
                </button>
              </div>
            )}

            {/* Heading Section */}
            {!loading && (
              <header className="mt-6 mb-10 text-center">
                <h2 className="text-3xl md:text-4xl  font-semibold">
                  {displayPrompt} <span className="text-red-600">AI Picks</span>{" "}
                  for You
                </h2>
                {reason && (
                  <p className="mt-4 text-sm md:text-base  text-white/70 max-w-2xl mx-auto">
                    {reason}
                  </p>
                )}
              </header>
            )}

            {/* Grid Section */}
            <section aria-label="AI Recommendations">
              <div className=" mt-6">
                {loading ? (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center px-6">
                    <div className="flex flex-col items-center justify-center py-8 pb-4 gap-3 text-center">
                      <div className="relative flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                      </div>
                      <p className="text-white/80 text-sm sm:text-base md:text-lg text-center px-4 animate-pulse break-words max-w-xl mx-auto">
                        {loadingMessage}
                      </p>
                    </div>

                    <div className="w-full max-w-sm">
                      <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-white/60 mt-2 text-center">
                        {progress}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {recommendations.map((item) => (
                      <FilmCard key={item.recommendation_id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
