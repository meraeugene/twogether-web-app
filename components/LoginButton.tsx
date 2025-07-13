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
      className="group cursor-pointer relative px-4 py-2 rounded-xl flex items-center gap-2 text-base font-medium tracking-wide text-white bg-white/10 backdrop-blur border border-white/20 shadow-sm hover:bg-white/20 transition w-full"
    >
      <FaGoogle className="text-white text-base" />
      Login
    </button>
  );
};

export default LoginButton;
