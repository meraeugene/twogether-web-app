"use client";

import { createClient } from "@/utils/supabase/client";
import { FaGoogle } from "react-icons/fa";

const LoginButton = () => {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/browse`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-red-600 cursor-pointer hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold ml-4 flex items-center gap-2 font-[family-name:var(--font-geist-mono)]"
    >
      <FaGoogle className="text-white text-base" />
      Login
    </button>
  );
};

export default LoginButton;
