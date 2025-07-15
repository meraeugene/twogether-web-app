"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { steps } from "./steps";
import {
  MultiSelectCards,
  SingleSelectCards,
  TextInputCard,
} from "../../components/StepCard";
import { toast } from "sonner";
import { Genre, OnboardingForm } from "../../types/formTypes";
import {
  genreOptions,
  moodOptions as baseMoodOptions,
  relationshipStatusOptions as baseRelationshipOptions,
  socialIntentOptions as baseSocialIntentOptions,
} from "./options";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>({
    username: "",
    relationship_status: "",
    social_intent: [],
    favorite_genres: [],
    favorite_moods: [],
    prefers: "both",
  });
  const [relationshipStatusOptions, setRelationshipStatusOptions] = useState(
    baseRelationshipOptions
  );
  const [socialIntentOptions, setSocialIntentOptions] = useState(
    baseSocialIntentOptions
  );
  const [moodsOptions, setMoodsOptions] = useState(baseMoodOptions);
  const [customMood, setCustomMood] = useState("");
  const [customRelationship, setCustomRelationship] = useState("");
  const [customSocialIntent, setCustomSocialIntent] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const next = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));

  const handleAddCustomRelationship = () => {
    const trimmed = customRelationship.trim();

    if (!trimmed) {
      return null;
    }

    if (!relationshipStatusOptions.includes(trimmed)) {
      setRelationshipStatusOptions((prev) => [...prev, trimmed]);
    }

    setForm({
      ...form,
      relationship_status: trimmed,
    });

    setCustomRelationship("");
  };

  const handleAddCustomSocialIntent = () => {
    const trimmed = customSocialIntent.trim();

    if (
      trimmed &&
      !form.social_intent.includes(trimmed) &&
      !socialIntentOptions.includes(trimmed)
    ) {
      setSocialIntentOptions((prev) => [...prev, trimmed]);
      setForm({ ...form, social_intent: [...form.social_intent, trimmed] });
    }
    setCustomSocialIntent("");
  };

  const handleAddCustomMood = () => {
    const trimmed = customMood.trim();

    if (!trimmed) {
      return null;
    }

    if (
      trimmed &&
      !form.favorite_moods.includes(trimmed) &&
      !moodsOptions.includes(trimmed)
    ) {
      setMoodsOptions((prev) => [...prev, trimmed]);
      setForm({ ...form, favorite_moods: [...form.favorite_moods, trimmed] });
    }
    setCustomMood("");
  };

  const handleFinish = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user?.user_metadata;

    if (!user) {
      console.error("User not found");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("users").upsert({
      id: userData?.user?.id,
      display_name: user?.full_name,
      avatar_url: user?.avatar_url,
      ...form,
      onboarding_complete: true,
    });

    if (error) {
      console.log(error);
      toast.error("Something went wrong.");
      setLoading(false);
      return;
    }

    toast.success("Welcome to Twogether — your movie journey starts now! 🍿✨");
    router.push("/recos");
  };

  const currentKey = steps[step].key;

  const renderStep = () => {
    switch (currentKey) {
      case "username":
        return (
          <TextInputCard
            value={form.username}
            onChange={(v) => setForm({ ...form, username: v })}
            placeholder="Enter your username"
          />
        );
      case "relationship_status":
        return (
          <div className="space-y-6">
            <SingleSelectCards
              options={relationshipStatusOptions}
              columns={2}
              value={form.relationship_status}
              onChange={(v) =>
                setForm({
                  ...form,
                  relationship_status:
                    v as OnboardingForm["relationship_status"],
                })
              }
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCustomRelationship();
              }}
              className="flex gap-4 items-stretch"
            >
              <div className="flex-1">
                <TextInputCard
                  value={customRelationship}
                  onChange={(val) => setCustomRelationship(val)}
                  placeholder="Add your option here..."
                />
              </div>

              <button
                type="submit"
                className="px-4 w-[20%] uppercase rounded-lg bg-gray-100 text-black hover:bg-gray-300 font-[family-name:var(--font-geist-mono)] italic cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        );
      case "social_intent":
        return (
          <div className="space-y-6">
            <MultiSelectCards
              options={socialIntentOptions}
              columns={2}
              values={form.social_intent}
              onChange={(v) => setForm({ ...form, social_intent: v })}
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCustomSocialIntent();
              }}
              className="flex gap-4 items-stretch"
            >
              <div className="flex-1">
                <TextInputCard
                  value={customSocialIntent}
                  onChange={(val) => setCustomSocialIntent(val)}
                  placeholder="Add social intent..."
                />
              </div>
              <button
                type="submit"
                className="px-4 w-[20%] uppercase rounded-lg bg-gray-100 text-black hover:bg-gray-300 font-[family-name:var(--font-geist-mono)] italic cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        );
      case "favorite_genres":
        return (
          <MultiSelectCards
            options={genreOptions}
            columns={3}
            values={form.favorite_genres}
            onChange={(v) =>
              setForm({ ...form, favorite_genres: v as Genre[] })
            }
          />
        );
      case "favorite_moods":
        return (
          <div className="space-y-6">
            <MultiSelectCards
              options={moodsOptions}
              columns={3}
              values={form.favorite_moods}
              onChange={(v) => setForm({ ...form, favorite_moods: v })}
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCustomMood();
              }}
              className="flex gap-4 items-stretch"
            >
              <div className="flex-1">
                <TextInputCard
                  value={customMood}
                  onChange={(val) => setCustomMood(val)}
                  placeholder="Add here if you want..."
                />
              </div>
              <button
                type="submit"
                className="px-4 w-[20%] uppercase rounded-lg bg-gray-100 text-black hover:bg-gray-300 font-[family-name:var(--font-geist-mono)] italic cursor-pointer"
                disabled={!customMood.trim()}
              >
                Add
              </button>
            </form>
          </div>
        );
      case "prefers":
        return (
          <SingleSelectCards
            options={["movies", "shows", "both"]}
            value={form.prefers}
            columns={3}
            onChange={(v) =>
              setForm({ ...form, prefers: v as OnboardingForm["prefers"] })
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center  bg-black text-white  pb-16  pt-28 px-7 lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 overflow-hidden">
      {/* STEPS PROGESS */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 text-sm">
        {steps.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => i <= step && setStep(i)}
            className={`uppercase tracking-wide px-3 py-1 rounded  font-[family-name:var(--font-geist-mono)] transition-all duration-200 font-medium
        ${
          i === step
            ? "bg-gray-100 text-black hover:bg-gray-200 cursor-pointer"
            : i < step
            ? "bg-gray-400 text-black hover:bg-gray-300 cursor-pointer"
            : "text-gray-600 cursor-not-allowed"
        }
      `}
            disabled={i > step}
          >
            {s.key.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* TITLE */}
      <h1 className="text-2xl lg:text-3xl font-semibold mb-2 text-center font-[family-name:var(--font-geist-sans)]">
        {steps[step].prompt}
      </h1>

      {/* SUBTITLE */}
      <p className="text-gray-400 mb-8 text-center font-[family-name:var(--font-geist-sans)]">
        Question {step + 1} of {steps.length}
      </p>

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentKey}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl "
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* BUTTONS */}
      <div className=" w-full max-w-2xl   mt-8 font-[family-name:var(--font-geist-mono)]">
        {step < steps.length - 1 ? (
          <button
            onClick={() => {
              if (step === 0 && !form.username.trim()) {
                toast.error(
                  "Oops! No username? Trying to vanish into thin air? 👻"
                );
                return;
              }

              if (step === 1 && !form.relationship_status.trim()) {
                toast.error(" At least tell us your situationship status 😩");
                return;
              }

              if (step === 2 && !form.social_intent.length) {
                toast.error(
                  "You forgot your social intent... introvert detected 😅"
                );
                return;
              }

              if (step === 3 && !form.favorite_genres.length) {
                toast.error(
                  "Pick at least one genre 🎬 No one likes a flavorless film fan."
                );
                return;
              }

              if (step === 4 && !form.favorite_moods.length) {
                toast.error(
                  "Adding empty mood? That’s *so* emotionally unavailable of you 💅"
                );
                return;
              }

              next();
            }}
            className="px-5 uppercase w-full py-4 bg-gray-200 text-black hover:bg-gray-300 cursor-pointer rounded-xl"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={loading}
            className="px-5 uppercase w-full py-4 bg-gray-200 text-black hover:bg-gray-300 cursor-pointer  rounded-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent " />
                <span>Hold on...</span>
              </div>
            ) : (
              "Finish"
            )}
          </button>
        )}
      </div>
    </main>
  );
}
