"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { HiOutlineMenuAlt3, HiOutlineUserCircle, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import {
  moreNavItems,
  primaryNavItems,
  recoNavItems,
  socialNavItems,
} from "./NavItems";
import { RiLogoutCircleLine, RiMovieAiLine } from "react-icons/ri";
import { BiMoviePlay } from "react-icons/bi";
import { AiOutlineFieldTime } from "react-icons/ai";
import { usePathname } from "next/navigation";
import { CurrentUser } from "@/types/user";
import { signOut } from "@/actions/authActions";
import type { Variants } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { FaUserFriends } from "react-icons/fa";
import { MdStars } from "react-icons/md";

const NotificationBell = dynamic(() => import("./NotificationBell"), {
  ssr: false,
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const guestLinks = [
  { href: "/browse", icon: <RiMovieAiLine />, label: "Browse" },
  { href: "/binge", icon: <BiMoviePlay />, label: "Binge" },
  { href: "/chrono", icon: <AiOutlineFieldTime />, label: "Chrono" },
];

const shell =
  "bg-[#161618]/92 backdrop-blur-2xl border border-white/[0.09] " +
  "shadow-[0_0_0_0.5px_rgba(255,255,255,0.04)_inset,0_16px_48px_rgba(0,0,0,0.75)]";

function Tip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-[9999] whitespace-nowrap rounded-[8px] px-[10px] py-[5px] text-[11.5px] font-medium text-white/80 bg-[#141416]/97 border border-white/[0.11] shadow-[0_8px_24px_rgba(0,0,0,0.65)] opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[130ms] ease-out">
      {label}
    </span>
  );
}

function NavIcon({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      prefetch={false}
      className={`group relative inline-flex items-center gap-2 px-3 h-[40px] rounded-[11px] text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-white/[0.12] text-white ring-1 ring-inset ring-white/[0.14]"
          : "text-white/55 hover:text-white/90 hover:bg-white/[0.08]"
      }`}
    >
      <span className="text-[18px]">{icon}</span>
      <span className="leading-none whitespace-nowrap">{label}</span>
    </Link>
  );
}

function DesktopDropdown({
  label,
  active,
  items,
  pathname,
  open,
  onToggle,
  onClose,
  icon,
}: {
  label: string;
  active: boolean;
  items: { href: string; icon: React.ReactNode; label: string }[];
  pathname: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex h-[40px] items-center gap-2 rounded-[11px] px-3 text-sm font-medium transition-all duration-150 ${
          active
            ? "bg-white/[0.12] text-white ring-1 ring-inset ring-white/[0.14]"
            : "text-white/55 hover:bg-white/[0.08] hover:text-white/90"
        } cursor-pointer`}
      >
        <span className="text-[18px]">{icon}</span>
        <span className="leading-none whitespace-nowrap">{label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute left-0 top-[calc(100%+12px)] z-[80] min-w-[200px] rounded-[18px] border border-white/[0.1] bg-[#111113]/96 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-200 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-white/[0.1] text-white"
                  : "text-white/70 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <span className="text-[18px]">{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// Desktop: matches NavIcon ghost style (no background, muted text, hover glow)
// Mobile: matches MobileLink ghost style (bordered card row)
function LoginButton({
  onClick,
  mobile,
}: {
  onClick: () => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <button
        onClick={onClick}
        className="text-lg font-semibold tracking-wide text-white/90 px-5 py-3.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/20 backdrop-blur-xl transition-all flex items-center gap-3 w-full"
      >
        <GoogleIcon className="w-5 h-5 text-white/60" />
        Sign in
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group cursor-pointer relative flex items-center justify-center gap-2 h-[40px] px-4 rounded-[11px] text-sm font-semibold text-white/40 hover:text-white/90 hover:bg-white/[0.08] transition-all duration-150"
    >
      <GoogleIcon className="w-[18px] h-[18px]" />
      Sign in
    </button>
  );
}

const Sep = () => (
  <div className="w-[12px] flex items-center justify-center">
    <span className="w-px h-[20px] bg-white/[0.09]" />
  </div>
);

function MobileLink({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        href={href}
        onClick={onClick}
        className={`text-lg font-semibold tracking-wide px-5 py-3.5 rounded-lg border backdrop-blur-xl transition-all flex items-center gap-3 ${
          active
            ? "bg-white text-black border-white/20"
            : "text-white/90 border-white/10 bg-white/5 hover:bg-white/20"
        }`}
      >
        <span className={active ? "text-black" : "text-white/80"}>{icon}</span>
        {label}
      </Link>
    </motion.div>
  );
}

export function Navbar({ user }: { user: CurrentUser | null | undefined }) {
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [recosOpen, setRecosOpen] = useState(false);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hide, setHide] = useState(false);
  const lastY = useRef(0);
  const recosRef = useRef<HTMLDivElement | null>(null);
  const socialsRef = useRef<HTMLDivElement | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const isAuthLoading = typeof user === "undefined";
  const recosActive = recoNavItems.some((item) => pathname.startsWith(item.href));
  const socialsActive = socialNavItems.some((item) =>
    pathname.startsWith(item.href),
  );
  const moreActive = moreNavItems.some((item) => pathname.startsWith(item.href));

  const logout = () => startTransition(async () => await signOut());
  const close = () => setMenuOpen(false);
  const profileHref = user ? `/profile/${user.username}/${user.id}` : "#";

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/recos`,
      },
    });
  };

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) < 10) return;
      setHide(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        recosRef.current &&
        !recosRef.current.contains(event.target as Node)
      ) {
        setRecosOpen(false);
      }
      if (
        socialsRef.current &&
        !socialsRef.current.contains(event.target as Node)
      ) {
        setSocialsOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setRecosOpen(false);
    setSocialsOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  return (
    <motion.div
      animate={{ y: hide ? -100 : 0, opacity: hide ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] overflow-visible w-[calc(100%-32px)] max-w-[440px] xl:w-auto xl:max-w-none font-[family-name:var(--font-geist-sans)] ${menuOpen ? "rounded-t-[18px]" : "rounded-full"}`}
    >
      {/* ── DESKTOP BAR ── */}
      <div
        className={`hidden  bg-black xl:inline-flex items-center space-x-2 px-[8px] py-[6px] rounded-full ${shell}`}
      >
        <Link
          href="/"
          className="text-md font-black uppercase tracking-[-0.02em] text-white font-[family-name:var(--font-geist-mono)] px-3 mr-1 leading-none hover:opacity-80 transition-opacity"
        >
          <span className="text-red-500">Two</span>gether
        </Link>

        <Sep />

        {isAuthLoading ? (
          <>
            <div className="h-[40px] w-[174px] rounded-[11px] bg-white/[0.06] animate-pulse" />
            <Sep />
            <div className="h-[40px] w-[96px] rounded-[11px] bg-white/[0.06] animate-pulse" />
          </>
        ) : (
          (user ? primaryNavItems : guestLinks).map((item) => (
            <NavIcon
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))
        )}

        {isAuthLoading ? null : user ? (
          <>
            <Sep />
            <div ref={recosRef}>
              <DesktopDropdown
                label="Recos"
                items={recoNavItems}
                active={recosActive}
                pathname={pathname}
                open={recosOpen}
                onToggle={() => {
                  setSocialsOpen(false);
                  setMoreOpen(false);
                  setRecosOpen((prev) => !prev);
                }}
                onClose={() => setRecosOpen(false)}
                icon={<MdStars className="text-lg" />}
              />
            </div>
            <div ref={socialsRef}>
              <DesktopDropdown
                label="Socials"
                items={socialNavItems}
                active={socialsActive}
                pathname={pathname}
                open={socialsOpen}
                onToggle={() => {
                  setRecosOpen(false);
                  setMoreOpen(false);
                  setSocialsOpen((prev) => !prev);
                }}
                onClose={() => setSocialsOpen(false)}
                icon={<FaUserFriends className="text-lg" />}
              />
            </div>
            <div ref={moreRef}>
              <DesktopDropdown
                label="More"
                items={moreNavItems}
                active={moreActive}
                pathname={pathname}
                open={moreOpen}
                onToggle={() => {
                  setRecosOpen(false);
                  setSocialsOpen(false);
                  setMoreOpen((prev) => !prev);
                }}
                onClose={() => setMoreOpen(false)}
                icon={<LayoutGrid className="h-[18px] w-[18px]" />}
              />
            </div>
            <Sep />
            <NavIcon
              href={profileHref}
              icon={<HiOutlineUserCircle />}
              label="Profile"
              active={pathname === profileHref}
            />
            <NotificationBell userId={user.id} />
            <div
              onClick={logout}
              className="group relative flex items-center justify-center w-[40px] h-[40px] rounded-[11px] text-[20px] text-white/40 hover:text-red-400 hover:bg-red-500/[0.12] transition-all duration-150 cursor-pointer"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <RiLogoutCircleLine />
              )}
              <Tip label={isPending ? "Logging out…" : "Logout"} />
            </div>
          </>
        ) : (
          <>
            <Sep />
            <LoginButton onClick={handleLogin} />
          </>
        )}
      </div>

      {/* ── MOBILE TOP BAR ── */}
      <div
        className={`xl:hidden bg-black flex items-center justify-between px-5 p-3 ${shell} ${menuOpen ? "rounded-t-[18px]" : "rounded-full"}`}
      >
        <Link
          href="/"
          onClick={close}
          className="text-xl font-extrabold uppercase tracking-[-0.02em] text-white font-[family-name:var(--font-geist-mono)] leading-none"
        >
          <span className="text-red-500">Two</span>gether
        </Link>
        <div className="flex items-center gap-1">
          {user?.id && <NotificationBell userId={user.id} />}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
            className="text-white xl:hidden text-2xl p-1 -mr-1"
          >
            {menuOpen ? <HiX /> : <HiOutlineMenuAlt3 />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative 2xl:hidden border-t border-white/10 p-4 flex flex-col text-white rounded-b-3xl bg-black max-h-[65vh] overflow-y-auto"
          >
            <motion.div
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={stagger}
              className="relative z-10 flex flex-col gap-4"
            >
              {isAuthLoading ? (
                <motion.div
                  variants={fadeUp}
                  className="h-14 rounded-lg border border-white/10 bg-white/5 animate-pulse"
                />
              ) : user ? (
                <>
                  <h3 className="text-xs text-white/60 uppercase px-1 mt-2">
                    Discover
                  </h3>
                  {primaryNavItems.map((item) => (
                    <MobileLink
                      key={item.href}
                      {...item}
                      active={pathname === item.href}
                      onClick={close}
                    />
                  ))}

                  <h3 className="text-xs text-white/60 uppercase px-1 mt-2">
                    My Space
                  </h3>
                  {recoNavItems.map((item) => (
                    <MobileLink
                      key={item.href}
                      {...item}
                      active={pathname.startsWith(item.href)}
                      onClick={close}
                    />
                  ))}
                  {socialNavItems.map((item) => (
                    <MobileLink
                      key={item.href}
                      {...item}
                      active={pathname.startsWith(item.href)}
                      onClick={close}
                    />
                  ))}

                  <h3 className="text-xs text-white/60 uppercase px-1 mt-2">
                    Account
                  </h3>
                  <MobileLink
                    href={profileHref}
                    icon={<HiOutlineUserCircle />}
                    label="Profile"
                    active={pathname === profileHref}
                    onClick={close}
                  />

                  <motion.div variants={fadeUp}>
                    <button
                      onClick={logout}
                      disabled={isPending}
                      className="text-lg font-semibold tracking-wide text-white/90 px-5 py-3.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/20 backdrop-blur-xl transition-all flex items-center gap-3 w-full"
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
                  {guestLinks.map(({ href, icon, label }) => (
                    <MobileLink
                      key={href}
                      href={href}
                      icon={icon}
                      label={label}
                      active={pathname === href}
                      onClick={close}
                    />
                  ))}

                  <motion.div variants={fadeUp}>
                    <LoginButton
                      mobile
                      onClick={() => {
                        close();
                        handleLogin();
                      }}
                    />
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
