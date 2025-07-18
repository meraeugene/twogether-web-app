"use client";

import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import RecommendStepMovieSearch from "./RecommendStepMovieSearch";
import { SingleSelectCards, TextareaCard } from "@/components/StepCard";
import { useState } from "react";
import { RecommendationForm } from "@/types/formTypes";
import { createRecommendation } from "@/actions/recommendationActions";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import Image from "next/image";

const steps = [
  { key: "movie", prompt: "What do you wanna recommend?" },
  { key: "comment", prompt: "What’s the vibe? Why do you love it?" },
  { key: "visibility", prompt: "Who can see this recommendation?" },
] as const;

const defaultForm: RecommendationForm = {
  title: "",
  poster_url: "",
  tmdb_id: 0,
  type: "movie",
  stream_url: [],
  comment: "",
  visibility: "public",
};

const visibilityOptions = ["public", "private"];

interface RecommendFormsProps {
  userId: string;
}

const RecommendForm = ({ userId }: RecommendFormsProps) => {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RecommendationForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);

  const currentKey = steps[step].key;

  const next = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));

  const handleFinish = async () => {
    setLoading(true);

    const { error } = await createRecommendation(userId, form);

    if (error) {
      console.error(error);
      toast.error("Failed to submit recommendation.");
      setLoading(false);
      return;
    }

    toast.success("Boom! Your recommendation just hit the screen 🎬✨");
    router.push("/browse");
  };

  const nextStepCheck = () => {
    if (currentKey === "movie" && !form.tmdb_id) {
      toast.error("No title? No tale! Pick a film to start the magic ✨");
      return;
    }

    if (currentKey === "comment" && !form.comment.trim()) {
      toast.error("Say something! Your thoughts deserve the spotlight 💬✨");
      return;
    }

    if (step < steps.length - 1) {
      next();
    } else {
      handleFinish();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStepCheck();
  };

  const renderStep = () => {
    switch (currentKey) {
      case "movie":
        return (
          <RecommendStepMovieSearch
            query={query}
            setQuery={setQuery}
            debouncedQuery={debouncedQuery}
            onSelect={(movie) =>
              setForm({
                ...form,
                ...movie,
              })
            }
          />
        );
      case "comment":
        return (
          <div className="space-y-6 flex flex-col items-center">
            {form.poster_url && (
              <div className="w-32 relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/10 shadow-xl backdrop-blur-md">
                <Image
                  src={form.poster_url}
                  alt={form.title}
                  fill
                  sizes="(max-width: 768px) 50vw"
                  className="object-cover"
                />
              </div>
            )}
            <TextareaCard
              value={form.comment}
              onChange={(v) => setForm({ ...form, comment: v })}
              placeholder="Write your thoughts or why you're recommending this..."
              onEnter={nextStepCheck}
            />
          </div>
        );

      case "visibility":
        return (
          <SingleSelectCards
            options={visibilityOptions}
            value={form.visibility}
            onChange={(v) =>
              setForm({
                ...form,
                visibility: v as RecommendationForm["visibility"],
              })
            }
            columns={2}
          />
        );
      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen flex flex-col justify-center items-center pt-28 pb-16 bg-black text-white px-7 overflow-hidden lg:pt-32 "
    >
      {/* Steps Progress */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 text-sm">
        {steps.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => i <= step && setStep(i)}
            className={`uppercase tracking-wide px-3 py-1 rounded transition-all duration-200 font-[family-name:var(--font-geist-mono)] font-medium ${
              i === step
                ? "bg-gray-100 text-black hover:bg-gray-200"
                : i < step
                ? "bg-gray-400 text-black hover:bg-gray-300"
                : "text-gray-600 cursor-not-allowed"
            }`}
            disabled={i > step}
          >
            {s.key}
          </button>
        ))}
      </div>

      <h1 className="text-3xl font-semibold mb-2 text-center font-[family-name:var(--font-geist-sans)]">
        {steps[step].prompt}
      </h1>

      <p className="text-gray-400 mb-8 text-center font-[family-name:var(--font-geist-sans)]">
        Step {step + 1} of {steps.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentKey}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="w-full  max-w-lg font-[family-name:var(--font-geist-mono)]">
        <button
          type="submit"
          disabled={loading}
          className="px-5 uppercase w-full py-4 mt-6 bg-gray-200 text-black hover:bg-gray-300 cursor-pointer rounded-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Submitting...</span>
            </div>
          ) : step < steps.length - 1 ? (
            "Next"
          ) : (
            "Recommend"
          )}
        </button>
      </div>
    </form>
  );
};

export default RecommendForm;
