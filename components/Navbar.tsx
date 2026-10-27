"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LogOut, Menu, Search, Settings, UserRound, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { moreNavItems, primaryNavItems, recoNavItems, socialNavItems } from "./NavItems";
import { navigationIcons } from "./navigationIcons";
import DesktopSidebar from "./DesktopSidebar";
import { signOut } from "@/actions/authActions";
import { createClient } from "@/utils/supabase/client";
import type { CurrentUser } from "@/types/user";
import styles from "./Navbar.module.css";

const SearchOverlay = dynamic(() => import("@/components/SearchOverlay"), { ssr: false });
const preloadSearch = () => { void import("@/components/SearchOverlay"); };
type NavItem = { href: string; label: string };

export function Navbar({ user }: { user: CurrentUser | null | undefined }) {
  const pathname = usePathname();
  const [loggingOut, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLElement>(null);
  const hideOnboarding = pathname.startsWith("/onboarding");
  const searchShortcut = isMac ? "⌘ K" : "Ctrl K";
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeMenu = () => {
    setMenuOpen(false);
    if (menuOpen) menuButton.current?.focus();
  };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const discoverItems = [...primaryNavItems.filter(item => item.href !== "/watchlist"), ...moreNavItems];
  const libraryItems = [...primaryNavItems.filter(item => item.href === "/watchlist"), ...recoNavItems];

  const openSearch = () => {
    closeMenu();
    preloadSearch();
    setSearchOpen(true);
  };
  const logout = () => startTransition(async () => { await signOut(); });
  const handleLogin = async () => {
    closeMenu();
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback?next=/recos" },
    });
  };

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
    if (hideOnboarding) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat || event.altKey || event.shiftKey
        || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      if (document.querySelector('dialog[open], [aria-modal="true"]')) return;
      setMenuOpen(false);
      preloadSearch();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hideOnboarding]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuPanel.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [menuOpen]);

  const renderLinks = (items: NavItem[]) => items.map(({ href, label }) => {
    const Icon = navigationIcons[href] ?? Compass;
    return <Link key={href} href={href} onClick={closeMenu} className={styles.menuLink}
      aria-current={isActive(href) ? "page" : undefined}
      prefetch={["/recos", "/watchlist", "/my-recommendations"].includes(href) ? true : undefined}>
      <Icon aria-hidden="true" /><span>{label}</span>
    </Link>;
  });
  const section = (label: string, items: NavItem[]) => (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>{label}</p>
      <div className={styles.menuGrid}>{renderLinks(items)}</div>
    </div>
  );

  if (hideOnboarding) return null;

  return (
    <>
      <DesktopSidebar user={user} pathname={pathname} loggingOut={loggingOut} searchOpen={searchOpen}
        searchShortcut={searchShortcut} onSearch={openSearch} onPreloadSearch={preloadSearch}
        onLogin={handleLogin} onLogout={logout} />
      <button type="button" className={`${styles.backdrop} ${menuOpen ? styles.backdropVisible : ""}`}
        onClick={closeMenu} aria-label="Close navigation" aria-hidden={!menuOpen} tabIndex={-1} />
      <header className={`${styles.mobileHeader} ${menuOpen ? styles.expanded : ""}`}>
        <div className={styles.bar}>
          <Link href="/" className={styles.brand} onClick={closeMenu} aria-label="Twogether home">
            <span className={styles.wordmark} aria-hidden="true"><span>Two</span>gether</span>
          </Link>
          <div className={styles.actions}>
            <button type="button" className={styles.control} aria-label="Open search" title="Search"
              aria-haspopup="dialog" aria-expanded={searchOpen} aria-keyshortcuts="Control+K Meta+K"
              onPointerEnter={preloadSearch} onFocus={preloadSearch} onClick={openSearch}>
              <Search aria-hidden="true" />
            </button>
            <button ref={menuButton} type="button" className={`${styles.control} ${styles.menuToggle}`} aria-label="Toggle menu"
              aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(value => !value)}>
              <Menu className={`${styles.menuIcon} ${menuOpen ? styles.iconHidden : ""}`} aria-hidden="true" />
              <X className={`${styles.menuIcon} ${menuOpen ? "" : styles.iconHidden}`} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={`${styles.menuReveal} ${menuOpen ? styles.menuVisible : ""}`} inert={!menuOpen} aria-hidden={!menuOpen}>
          <div className={styles.menuClip}>
            <nav ref={menuPanel} id="mobile-navigation" className={styles.menu} aria-label="Mobile navigation">
              {section("Discover", discoverItems)}
              {user && <>{section("Your collection", libraryItems)}{section("Together", socialNavItems)}</>}
              <div className={styles.section}>
                {user ? <div className={styles.menuGrid}>
                  <Link href={"/profile/" + user.username + "/" + user.id} className={styles.menuLink} onClick={closeMenu}><UserRound aria-hidden="true" />Profile</Link>
                  <Link href="/settings/delete-account" className={styles.menuLink} onClick={closeMenu}><Settings aria-hidden="true" />Settings</Link>
                  <button type="button" className={styles.menuLink} onClick={logout} disabled={loggingOut}><LogOut aria-hidden="true" />{loggingOut ? "Signing out…" : "Sign out"}</button>
                </div> : user === null ? <button type="button" onClick={handleLogin} className={styles.menuLink}><FcGoogle aria-hidden="true" />Sign in with Google</button>
                  : <p className={styles.accountStatus} role="status">Connecting your account…</p>}
              </div>
            </nav>
          </div>
        </div>
      </header>
      {searchOpen && <SearchOverlay onClose={closeSearch} />}
    </>
  );
}
