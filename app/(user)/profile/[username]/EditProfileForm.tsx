"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition, useEffect } from "react";
import { updateUserProfile } from "@/actions/profileActions";
import { User } from "@/types/user";
import {
  MultiSelectCards,
  SingleSelectCards,
  TextInputCard,
} from "@/components/StepCard";
import {
  genreOptions,
  moodOptions as moodOptionsBase,
  relationshipStatusOptions as relationshipStatusOptionsBase,
  socialIntentOptions as socialIntentOptionsBase,
} from "@/app/onboarding/options";
import { Genre, OnboardingForm } from "@/types/formTypes";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/utils/cloudinary/uploadToCloudinary";
import Image from "next/image";

export default function EditProfileForm({ user }: { user: User }) {
  const router = useRouter();

  const [form, setForm] = useState<OnboardingForm>({
    username: user.username || "",
    display_name: user.display_name || "",
    avatar_url: user.avatar_url || "",
    bio: user.bio || "",
    relationship_status: user.relationship_status || "",
    social_intent: user.social_intent || [],
    favorite_genres: user.favorite_genres || [],
    favorite_moods: user.favorite_moods || [],
    prefers: user.prefers,
  });

  const [isPending, startTransition] = useTransition();
  const [relationshipStatusOptions, setRelationshipStatusOptions] = useState(
    relationshipStatusOptionsBase
  );
  const [moodsOptions, setMoodsOptions] = useState(moodOptionsBase);
  const [socialIntentOptions, setSocialIntentOptions] = useState(
    socialIntentOptionsBase
  );
  const [customRelationship, setCustomRelationship] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [customSocialIntent, setCustomSocialIntent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showStickySubmit, setShowStickySubmit] = useState(false);

  useEffect(() => {
    setMoodsOptions(() =>
      Array.from(new Set([...moodOptionsBase, ...user.favorite_moods]))
    );

    setSocialIntentOptions(() =>
      Array.from(
        new Set([...socialIntentOptionsBase, ...(user.social_intent || [])])
      )
    );

    setRelationshipStatusOptions((prev) =>
      Array.from(new Set([...prev, user.relationship_status as string]))
    );
  }, [user.favorite_moods, user.social_intent, user.relationship_status]);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 10;
      setShowStickySubmit(shouldShow);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddCustomRelationship = () => {
    const trimmed = customRelationship.trim();
    if (!trimmed) return null;

    if (!relationshipStatusOptions.includes(trimmed)) {
      setRelationshipStatusOptions((prev) => [...prev, trimmed]);
    }
    setForm({ ...form, relationship_status: trimmed });
    setCustomRelationship("");
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

  const handleAddCustomSocialIntent = () => {
    const trimmed = customSocialIntent.trim();
    if (!trimmed) return null;

    if (!socialIntentOptions.includes(trimmed)) {
      setSocialIntentOptions((prev) => [...prev, trimmed]);
    }
    setForm({ ...form, social_intent: [...form.social_intent, trimmed] });
    setCustomSocialIntent("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.set("username", form.username);
    formData.set("display_name", form.display_name || "");
    formData.set("bio", form.bio || "");
    formData.set("relationship_status", form.relationship_status);
    formData.set("prefers", form.prefers as "movies" | "shows" | "both");

    form.social_intent.forEach((v) => formData.append("social_intent", v));
    form.favorite_genres.forEach((v) => formData.append("favorite_genres", v));
    form.favorite_moods.forEach((v) => formData.append("favorite_moods", v));

    startTransition(async () => {
      try {
        let avatarUrl = form.avatar_url;
        if (selectedImage) {
          avatarUrl = await uploadToCloudinary(selectedImage);
          setForm((prev) => ({ ...prev, avatar_url: avatarUrl }));
        }

        formData.set("avatar_url", avatarUrl || "");

        await updateUserProfile(formData, user.username);
        router.push(`/profile/${user.username}/${user.id}`);
      } catch (err) {
        console.error("Error updating profile:", err);
      }
    });
  };

  const preview = selectedImage
    ? URL.createObjectURL(selectedImage)
    : form.avatar_url || user.avatar_url || null;

  return (
    <div className="relative min-h-screen max-w-2xl mx-auto  ">
      <form
        id="edit-profile-form"
        onSubmit={handleSubmit}
        className=" space-y-8  text-white"
      >
        <h2 className="text-2xl font-semibold">Edit Profile</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Profile Picture
          </label>

          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-white/5 shadow-md bg-white/10">
              {preview ? (
                selectedImage ? (
                  <Image
                    src={preview}
                    alt="Avatar"
                    unoptimized
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src={preview}
                    alt="Avatar"
                    unoptimized
                    fill
                    className="object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                  No Image
                </div>
              )}
            </div>

            <label className="relative inline-block group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedImage(file);
                }}
                className="absolute inset-0 opacity-0"
              />
              <span className="inline-block px-4 py-2 rounded-md bg-white text-black text-sm font-medium shadow-sm transition group-hover:bg-neutral-300">
                Change Profile
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-white">
            Username
          </label>
          <p className="text-xs md:text-sm text-white/50 mb-2">
            This cannot be changed after onboarding.
          </p>
          <input
            value={form.username}
            readOnly
            className="w-full p-3 rounded bg-black/20 text-white/70 border border-white/10 cursor-not-allowed outline-none"
          />
        </div>

        <div>
          <label className="block mb-3 text-sm">Display Name</label>
          <input
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            className="w-full p-3 rounded bg-black/30 border border-white/10"
          />
        </div>

        <div>
          <label className="block mb-3 text-sm">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full p-3 rounded bg-black/30 border border-white/10"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-3 text-sm">Relationship Status</label>
          <SingleSelectCards
            options={relationshipStatusOptions}
            columns={2}
            value={form.relationship_status}
            onChange={(v) =>
              setForm({
                ...form,
                relationship_status: v as OnboardingForm["relationship_status"],
              })
            }
          />

          <div className="flex gap-4 items-stretch mt-4">
            <div className="flex-1">
              <TextInputCard
                value={customRelationship}
                onChange={(val) => setCustomRelationship(val)}
                placeholder="Add your option here..."
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomRelationship}
              className="px-4 w-[20%] uppercase rounded-lg bg-gray-100 text-black hover:bg-gray-300 font-[family-name:var(--font-geist-mono)] italic cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-3 text-sm">Prefers</label>
          <SingleSelectCards
            options={["movies", "shows", "both"]}
            value={form.prefers}
            columns={3}
            onChange={(v) =>
              setForm({ ...form, prefers: v as OnboardingForm["prefers"] })
            }
          />
        </div>

        <div>
          <label className="block mb-3 text-sm">Favorite Genres</label>
          <MultiSelectCards
            options={genreOptions}
            columns={3}
            values={form.favorite_genres}
            onChange={(v) =>
              setForm({ ...form, favorite_genres: v as Genre[] })
            }
          />
        </div>

        <div>
          <label className="block mb-3 text-sm">Favorite Moods</label>
          <MultiSelectCards
            options={moodsOptions}
            values={form.favorite_moods}
            onChange={(moods) => setForm({ ...form, favorite_moods: moods })}
            columns={2}
          />

          <div className="flex gap-4 mt-4 items-stretch">
            <div className="flex-1">
              <TextInputCard
                value={customMood}
                onChange={(val) => setCustomMood(val)}
                placeholder="Add here if you want..."
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomMood}
              className="px-4 w-[20%] uppercase rounded-lg bg-gray-100 text-black hover:bg-gray-300 font-[family-name:var(--font-geist-mono)] italic cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-3 text-sm">Social Intent</label>
          <MultiSelectCards
            options={socialIntentOptions}
            columns={2}
            values={form.social_intent}
            onChange={(v) => setForm({ ...form, social_intent: v })}
          />

          <div className="flex gap-4 mt-4 items-stretch">
            <div className="flex-1">
              <TextInputCard
                value={customSocialIntent}
                onChange={(val) => setCustomSocialIntent(val)}
                placeholder="Add social intent..."
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomSocialIntent}
              className="px-4 w-[20%] uppercase rounded-lg bg-gray-100 text-black hover:bg-gray-300 font-[family-name:var(--font-geist-mono)] italic cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showStickySubmit && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed bottom-4 left-0 right-0 z-50 w-[90%] md:w-[30%] lg:w-[25%] xl:w-[20%] mx-auto
             bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-2"
          >
            <button
              type="submit"
              form="edit-profile-form"
              disabled={isPending}
              className="w-full cursor-pointer  py-3 font-semibold text-black bg-white hover:bg-gray-200 backdrop-blur-2xl border border-white/40 rounded-xl shadow-xl transition"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
