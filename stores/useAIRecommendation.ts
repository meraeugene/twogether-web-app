// stores/useAIRecommendation.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import CryptoJS from "crypto-js";
import { Recommendation } from "@/types/recommendation";

const SECRET_KEY = process.env.NEXT_PUBLIC_AI_RECOMMEND_SECRET!;

// Wrap sessionStorage with encryption
const encryptedStorage = {
  getItem: (name: string) => {
    const encrypted = sessionStorage.getItem(name);
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (e) {
      console.warn("Decryption failed:", e);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
    sessionStorage.setItem(name, encrypted);
  },
  removeItem: (name: string) => sessionStorage.removeItem(name),
};

type State = {
  recommendations: Recommendation[];
  prompt: string;
  reason: string;
  setRecommendations: (data: Recommendation[]) => void;
  setPrompt: (value: string) => void;
  setReason: (value: string) => void;
  clearAll: () => void;
};

export const useAIRecommendations = create<State>()(
  persist(
    (set) => ({
      recommendations: [],
      prompt: "",
      reason: "",
      setRecommendations: (data) => set({ recommendations: data }),
      setPrompt: (value) => set({ prompt: value }),
      setReason: (value) => set({ reason: value }),
      clearAll: () => set({ recommendations: [], prompt: "", reason: "" }),
    }),
    {
      name: "ai-recommendations",
      storage: createJSONStorage(() => encryptedStorage),
    }
  )
);
