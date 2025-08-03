"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import { RiLogoutCircleLine } from "react-icons/ri";
import { signOut } from "@/actions/authActions";

interface Props {
  user: {
    avatar_url: string;
    full_name: string;
    email: string | null;
  };
}

export const ProfileMenu = ({ user }: Props) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="relative font-[family-name:var(--font-geist-sans)] rounded-full w-9 h-9  "
      ref={ref}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-full rounded-full focus:outline-none cursor-pointer"
      >
        <Image
          src={user.avatar_url}
          alt="Avatar"
          unoptimized
          width={40}
          height={40}
          className="w-full h-full object-cover rounded-full "
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 bg-white text-black rounded-md shadow-xl z-50 w-48"
          >
            <div className="text-sm font-medium py-2 px-3">
              {user.full_name}
              <div className="text-gray-500 text-xs">{user.email}</div>
            </div>
            <hr className="mt-2 border-gray-200" />
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full text-left cursor-pointer hover:bg-gray-100 p-2 text-sm flex items-center gap-2 rounded-b-md"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Logging out
                </>
              ) : (
                <>
                  <RiLogoutCircleLine />
                  Logout
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
