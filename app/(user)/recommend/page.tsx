"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { SingleSelectCards, TextareaCard } from "@/components/StepCard";
import { RecommendationForm } from "@/types/formTypes";
import RecommendStepMovieSearch from "./RecommendStepMovieSearch";

const steps = [
  { key: "movie", prompt: "Search for a movie or show to recommend" },
  { key: "comment", prompt: "Add a personal comment or message" },
  { key: "visibility", prompt: "Who can see this recommendation?" },
] as const;

const defaultForm: RecommendationForm = {
  title: "",
  imdb_id: "",
  poster_url: "",
  type: "movie",
  stream_url: "",
  comment: "",
  visibility: "public",
};

const visibilityOptions = ["public", "friends", "private"];

export default function RecommendPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RecommendationForm>(defaultForm);
  const [loading, setLoading] = useState(false);

  const next = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));

  const nextStepCheck = () => {
    if (currentKey === "movie" && !form.imdb_id) {
      toast.error("Please choose a movie.");
      return;
    }

    if (currentKey === "comment" && !form.comment.trim()) {
      toast.error("Please write a comment.");
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

  const handleFinish = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    if (!user_id) {
      toast.error("User not found");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("recommendations").insert({
      user_id,
      ...form,
    });

    if (error) {
      console.error(error);
      toast.error("Failed to submit recommendation.");
      setLoading(false);
      return;
    }

    toast.success("Recommendation added!");
    router.push("/browse");
  };

  const currentKey = steps[step].key;

  const renderStep = () => {
    switch (currentKey) {
      case "movie":
        return (
          <RecommendStepMovieSearch
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
          <TextareaCard
            value={form.comment}
            onChange={(v) => setForm({ ...form, comment: v })}
            placeholder="Write your thoughts or why you're recommending this..."
            onEnter={nextStepCheck}
          />
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
            columns={3}
          />
        );
      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen flex flex-col justify-center items-center pt-28 pb-16 bg-black text-white"
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
          className="w-full max-w-2xl"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-2xl mt-8 font-[family-name:var(--font-geist-mono)]">
        <button
          type="submit"
          disabled={loading}
          className="px-5 uppercase w-full py-4 bg-gray-200 text-black hover:bg-gray-300 cursor-pointer rounded-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Submitting...</span>
            </div>
          ) : step < steps.length - 1 ? (
            "Next"
          ) : (
            "Finish"
          )}
        </button>
      </div>
    </form>
  );
}
