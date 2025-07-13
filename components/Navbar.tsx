"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import LoginButton from "./LoginButton";
import { HiOutlineMenuAlt3, HiOutlineUserCircle, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { primaryNavItems, secondaryNavItems } from "./NavItems";
import { signOut } from "@/actions/authActions";
import { RiLogoutCircleLine } from "react-icons/ri";
import {
  HiOutlineInformationCircle,
  HiOutlineSparkles,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi";
import type { Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { CurrentUser } from "@/types/user";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.8,
    },
  },
};

export function Navbar({ user }: { user: CurrentUser }) {
  const [isPending, startTransition] = useTransition();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => {
    if (!menuOpen) setIsExpanded(true);
    setMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  const pathname = usePathname();

  return (
    <motion.header
      animate={{ height: "auto" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={` overflow-hidden fixed top-6  left-1/2 -translate-x-1/2 w-[90%] md:w-[60%] lg:w-[50%] xl:w-[40%] 2xl:w-[90%]  max-w-full z-50 
        bg-black/60 backdrop-blur-3xl border border-white/10 shadow-xl
        font-[family-name:var(--font-geist-sans)]
        ${isExpanded ? "rounded-3xl" : "rounded-full"}`}
    >
      {/* Desktop Menu */}
      <div className="relative z-10 flex justify-between items-center px-4 md:px-8 py-3">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="text-xl font-extrabold font-[family-name:var(--font-geist-mono)] uppercase text-white"
        >
          <span className="text-red-600">Two</span>gether
        </Link>

        <button
          className="2xl:hidden text-white text-2xl"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <HiX /> : <HiOutlineMenuAlt3 />}
        </button>

        <nav className="hidden 2xl:flex items-center gap-3">
          {user ? (
            <>
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative px-4 py-2 rounded-xl flex items-center gap-2 text-base font-medium tracking-wide transition backdrop-blur border border-white/20 shadow-sm
    ${
      pathname === item.href
        ? "bg-white text-black font-semibold"
        : "text-white bg-white/10 hover:bg-white/20"
    }`}
                >
                  <span
                    className={`drop-shadow-[0_0_3px_rgba(255,0,0,0.3)] ${
                      pathname === item.href ? "text-black" : "text-white/80"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
              {secondaryNavItems.map((item) => (
                <motion.div key={item.href} variants={fadeUp}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group relative px-4 py-2 rounded-xl flex items-center gap-2 text-base font-medium tracking-wide transition backdrop-blur border border-white/20 shadow-sm
      ${
        pathname === item.href
          ? "bg-white text-black font-semibold"
          : "text-white bg-white/10 hover:bg-white/20"
      }`}
                  >
                    <span
                      className={`drop-shadow-[0_0_3px_rgba(255,0,0,0.3)] ${
                        pathname === item.href ? "text-black" : "text-white/80"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {/* User Profile Section */}
              <motion.div
                className="group relative px-4 py-2 rounded-xl flex items-center gap-2 text-base font-medium tracking-wide text-white bg-white/10 backdrop-blur border border-white/20 shadow-sm hover:bg-white/20 transition"
                variants={fadeUp}
              >
                <HiOutlineUserCircle />
                {user.full_name}
              </motion.div>
              {/* Logout Button */}
              <motion.div variants={fadeUp}>
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="group cursor-pointer relative px-4 py-2 rounded-xl flex items-center gap-2 text-base font-medium tracking-wide text-white bg-white/10 backdrop-blur border border-white/20 shadow-sm hover:bg-white/20 transition"
                >
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            </>
          ) : (
            <>
              {["about", "features", "faqs"].map((id) => (
                <motion.div key={id} variants={fadeUp}>
                  <Link
                    href={`#${id}`}
                    onClick={() => setMenuOpen(false)}
                    className="group cursor-pointer relative px-4 py-2 rounded-xl flex items-center gap-2 text-base font-medium tracking-wide text-white bg-white/10 backdrop-blur border border-white/20 shadow-sm hover:bg-white/20 transition"
                  >
                    <span className="text-white/80  drop-shadow-[0_0_3px_rgba(255,0,0,0.3)]">
                      {
                        {
                          about: <HiOutlineInformationCircle />,
                          features: <HiOutlineSparkles />,
                          faqs: <HiOutlineQuestionMarkCircle />,
                        }[id]
                      }
                    </span>
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={fadeUp}>
                <LoginButton />
              </motion.div>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence onExitComplete={() => setIsExpanded(false)}>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative 2xl:hidden border-t border-white/10 p-4 flex flex-col text-white rounded-b-3xl   max-h-[75vh] overflow-y-auto"
          >
            {/* Optional noise overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none z-0 rounded-b-3xl" />

            <motion.div
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.05,
                  },
                },
              }}
              className="relative z-10 flex flex-col gap-4"
            >
              {user ? (
                <>
                  <h3 className="text-xs text-white/60 uppercase px-1 mt-2">
                    Discover
                  </h3>
                  {primaryNavItems.map((item) => (
                    <motion.div key={item.href} variants={fadeUp}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`group relative text-lg font-semibold tracking-wide px-5 py-3.5 rounded-xl border backdrop-blur-xl transition-all flex items-center gap-3
      ${
        pathname === item.href
          ? "bg-white text-black border-white/20"
          : "text-white/90 border-white/10 bg-white/5 hover:bg-white/20"
      }`}
                      >
                        <span
                          className={`drop-shadow-[0_0_3px_rgba(255,0,0,0.3)] ${
                            pathname === item.href
                              ? "text-black"
                              : "text-white/80"
                          }`}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                  <h3 className="text-xs text-white/60 uppercase px-1 mt-2">
                    My Space
                  </h3>
                  {secondaryNavItems.map((item) => (
                    <motion.div key={item.href} variants={fadeUp}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`group relative text-lg font-semibold tracking-wide px-5 py-3.5 rounded-xl border backdrop-blur-xl transition-all flex items-center gap-3
      ${
        pathname.startsWith(item.href)
          ? "bg-white text-black border-white/20"
          : "text-white/90 border-white/10 bg-white/5 hover:bg-white/20"
      }`}
                      >
                        <span
                          className={`drop-shadow-[0_0_3px_rgba(255,0,0,0.3)] ${
                            pathname.startsWith(item.href)
                              ? "text-black"
                              : "text-white/80"
                          }`}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                  <h3 className="text-xs text-white/60 uppercase px-1 mt-2">
                    Account
                  </h3>
                  {/* User Profile Section */}
                  <motion.div
                    className="group relative text-lg font-semibold tracking-wide text-white/90  px-5 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/20 backdrop-blur-xl transition-all flex items-center gap-3"
                    variants={fadeUp}
                  >
                    <HiOutlineUserCircle />
                    {user.full_name}
                  </motion.div>
                  {/* Logout Button */}
                  <motion.div variants={fadeUp}>
                    <button
                      onClick={handleLogout}
                      disabled={isPending}
                      className="group relative text-lg font-semibold tracking-wide text-white/90  px-5 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/20 backdrop-blur-xl transition-all flex items-center gap-3 w-full"
                    >
                      {isPending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                </>
              ) : (
                <>
                  {["about", "features", "faqs"].map((id) => (
                    <motion.div key={id} variants={fadeUp}>
                      <Link
                        href={`#${id}`}
                        onClick={() => setMenuOpen(false)}
                        className="group cursor-pointer relative px-4 py-2 rounded-xl flex items-center gap-2 text-base font-medium tracking-wide text-white bg-white/10 backdrop-blur border border-white/20 shadow-sm hover:bg-white/20 transition"
                      >
                        <span className="text-white/80  drop-shadow-[0_0_3px_rgba(255,0,0,0.3)]">
                          {
                            {
                              about: <HiOutlineInformationCircle />,
                              features: <HiOutlineSparkles />,
                              faqs: <HiOutlineQuestionMarkCircle />,
                            }[id]
                          }
                        </span>
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div variants={fadeUp}>
                    <LoginButton />
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
