"use client";

import { useCallback, useEffect, useRef, useState, type FocusEventHandler, type PointerEventHandler } from "react";
import { createPortal } from "react-dom";
import Link from "@/components/NavigationLink";
import {
  Compass, LogOut, Search, Settings, UserRound,
  type LucideIcon,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import type { CurrentUser } from "@/types/user";
import { moreNavItems, primaryNavItems, recoNavItems, socialNavItems } from "./NavItems";
import styles from "./DesktopSidebar.module.css";
import { navigationIcons } from "./navigationIcons";

type SidebarProps = {
  user: CurrentUser | null | undefined;
  pathname: string;
  loggingOut: boolean;
  searchOpen: boolean;
  searchShortcut: string;
  onSearch: () => void;
  onPreloadSearch: () => void;
  onLogin: () => void;
  onLogout: () => void;
};

type TooltipHandlers = {
  onPointerEnter: PointerEventHandler<HTMLElement>;
  onPointerLeave: PointerEventHandler<HTMLElement>;
  onFocus: FocusEventHandler<HTMLElement>;
  onBlur: FocusEventHandler<HTMLElement>;
};

function SidebarLink({ href, label, pathname, Icon, tooltipHandlers }: {
  href: string;
  label: string;
  pathname: string;
  Icon: LucideIcon;
  tooltipHandlers: TooltipHandlers;
}) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} {...tooltipHandlers}
      prefetch={["/recos", "/watchlist", "/my-recommendations"].includes(href) ? true : undefined}
      className={`${styles.item} ${active ? styles.active : ""}`}>
      <span className={styles.icon}><Icon size={18} strokeWidth={1.6} aria-hidden="true" /></span>
    </Link>
  );
}

export default function DesktopSidebar({
  user, pathname, loggingOut, searchOpen, searchShortcut, onSearch, onPreloadSearch,
  onLogin, onLogout,
}: SidebarProps) {
  const tooltipControl = useRef<HTMLElement | null>(null);
  const [tooltip, setTooltip] = useState<{ label: string; left: number; top: number } | null>(null);
  const tooltipVisible = tooltip !== null;
  const dismissTooltip = useCallback(() => {
    tooltipControl.current = null;
    setTooltip(null);
  }, []);
  const showTooltip = (control: HTMLElement, label: string) => {
    if (tooltipControl.current === control) return;
    tooltipControl.current = control;
    const bounds = control.getBoundingClientRect();
    setTooltip({ label, left: bounds.right + 4, top: bounds.top + bounds.height / 2 });
  };
  const getTooltipHandlers = (label: string): TooltipHandlers => ({
    onPointerEnter: (event) => {
      if (event.pointerType !== "touch") showTooltip(event.currentTarget, label);
    },
    onPointerLeave: (event) => {
      if (tooltipControl.current === event.currentTarget) dismissTooltip();
    },
    onFocus: (event) => {
      // Mouse clicks dismiss the label; keyboard focus still exposes it.
      if (event.currentTarget.matches(":focus-visible")) showTooltip(event.currentTarget, label);
    },
    onBlur: (event) => {
      if (tooltipControl.current === event.currentTarget) dismissTooltip();
    },
  });

  useEffect(() => { dismissTooltip(); }, [pathname, dismissTooltip]);

  useEffect(() => {
    if (!tooltipVisible) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") dismissTooltip(); };
    const onScroll = (event: Event) => {
      // Auto-scrolling timelines and other content rails do not move sidebar icons.
      const scroller = event.target;
      if (scroller === document || (scroller instanceof Element && scroller.contains(tooltipControl.current))) {
        dismissTooltip();
      }
    };
    window.addEventListener("resize", dismissTooltip);
    window.addEventListener("keydown", onKeyDown);
    // Portaling keeps the label outside the scrolling rail's clipping boundary.
    document.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", dismissTooltip);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [tooltipVisible, dismissTooltip]);

  const discoverItems = [...primaryNavItems.filter((item) => item.href !== "/watchlist"), ...moreNavItems];
  const libraryItems = [...primaryNavItems.filter((item) => item.href === "/watchlist"), ...recoNavItems];
  const profileHref = user ? `/profile/${user.username}/${user.id}` : "#";
  const displayName = user?.full_name?.trim() || user?.username || "Your profile";
  const renderLinks = (items: { href: string; label: string }[]) => items.map((item) => (
    <SidebarLink key={item.href} {...item} pathname={pathname} Icon={navigationIcons[item.href] ?? Compass}
      tooltipHandlers={getTooltipHandlers(item.label)} />
  ));

  return (
    <div className={styles.shell} onPointerDownCapture={dismissTooltip}>
      <aside className={styles.sidebar} aria-label="Desktop navigation">
        <Link href="/" className={styles.brand} aria-label="Twogether home" {...getTooltipHandlers("Twogether home")}>
          <span className={styles.brandMark} aria-hidden="true">t<span>.</span></span>
        </Link>

        <button type="button" className={styles.search} onClick={onSearch}
          {...getTooltipHandlers(`Search (${searchShortcut})`)}
          onPointerEnter={(event) => {
            onPreloadSearch();
            getTooltipHandlers(`Search (${searchShortcut})`).onPointerEnter(event);
          }}
          onFocus={(event) => {
            onPreloadSearch();
            getTooltipHandlers(`Search (${searchShortcut})`).onFocus(event);
          }}
          aria-label="Open search" aria-haspopup="dialog" aria-expanded={searchOpen} aria-keyshortcuts="Control+K Meta+K">
          <span className={styles.icon}><Search size={18} strokeWidth={1.6} aria-hidden="true" /></span>
        </button>

        <nav className={styles.navigation} aria-label="Main navigation">
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Discover</p>
            {renderLinks(discoverItems)}
          </div>
          {user && <>
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Your collection</p>
              {renderLinks(libraryItems)}
            </div>
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Together</p>
              {renderLinks(socialNavItems)}
            </div>
          </>}
          {typeof user === "undefined" && <p className={styles.authStatus} role="status"><UserRound size={18} aria-hidden="true" /><span className={styles.srOnly}>Connecting your account…</span></p>}
        </nav>

        <div className={styles.account}>
          {user ? <>
            <Link href={profileHref} className={styles.profile} aria-label={`Open ${displayName}'s profile`} {...getTooltipHandlers(`Profile · ${displayName}`)}
              aria-current={pathname === profileHref ? "page" : undefined}>
              <span className={styles.icon} aria-hidden="true"><UserRound size={18} strokeWidth={1.6} /></span>
            </Link>
            <div className={styles.accountActions}>
              <SidebarLink href="/settings/delete-account" label="Settings" pathname={pathname} Icon={Settings}
                tooltipHandlers={getTooltipHandlers("Settings")} />
              <button type="button" onClick={onLogout} disabled={loggingOut} className={`${styles.item} ${styles.logout}`}
                aria-label={loggingOut ? "Signing out" : "Sign out"} {...getTooltipHandlers(loggingOut ? "Signing out…" : "Sign out")}>
                <span className={styles.icon}><LogOut size={18} strokeWidth={1.6} aria-hidden="true" /></span>
              </button>
            </div>
          </> : user === null ? (
            <button type="button" onClick={onLogin} className={styles.signIn} aria-label="Sign in with Google" {...getTooltipHandlers("Sign in with Google")}>
              <span className={styles.icon}><FcGoogle size={18} aria-hidden="true" /></span>
            </button>
          ) : null}
        </div>
      </aside>
      {tooltip && createPortal(
        <div className={styles.tooltip} role="tooltip" style={{ left: tooltip.left, top: tooltip.top }}>{tooltip.label}</div>,
        document.body,
      )}
    </div>
  );
}
