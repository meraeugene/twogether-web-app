import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import CryptoJS from "crypto-js";
import { Recommendation } from "@/types/recommendation";

const SECRET_KEY = process.env.NEXT_PUBLIC_AI_RECOMMEND_SECRET!;

// 🔐 Encrypted sessionStorage wrapper
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

type TMDBTempStore = {
  currentTMDB: Recommendation | null;
  setCurrentTMDB: (rec: Recommendation) => void;
  clear: () => void;
};

export const useTMDBWatch = create<TMDBTempStore>()(
  persist(
    (set) => ({
      currentTMDB: null,
      setCurrentTMDB: (rec) => set({ currentTMDB: rec }),
      clear: () => set({ currentTMDB: null }),
    }),
    {
      name: "tmdb-watch-session",
      storage: createJSONStorage(() => encryptedStorage),
    }
  )
);
