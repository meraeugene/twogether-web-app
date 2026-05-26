"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

type AccountSettingsMenuProps = {
  mobile?: boolean;
  iconOnly?: boolean;
  compact?: boolean;
  onClick?: () => void;
};

const deleteAccountHref = "/settings/delete-account";

export default function AccountSettingsMenu({
  mobile = false,
  iconOnly = false,
  compact = false,
  onClick,
}: AccountSettingsMenuProps) {
  if (mobile) {
    return (
      <Link
        href={deleteAccountHref}
        onClick={onClick}
        aria-label="Open account settings"
        title="Account settings"
        className={`text-lg font-semibold tracking-wide text-white/90 rounded-lg border border-white/10 bg-white/5 hover:bg-white/20 backdrop-blur-xl transition-all flex items-center gap-3 cursor-pointer ${
          iconOnly ? "h-full w-full justify-center px-0 py-0" : "w-full px-5 py-3.5"
        }`}
      >
        <Settings className="h-5 w-5 text-white/80" />
        {!iconOnly && "Settings"}
      </Link>
    );
  }

  return (
    <Link
      href={deleteAccountHref}
      aria-label="Open account settings"
      title="Account settings"
      className={`cursor-pointer transition flex items-center justify-center ${
        compact
          ? "group relative w-[40px] h-[40px] rounded-[11px] text-white/40 hover:text-white/90 hover:bg-white/[0.08]"
          : "mt-5 h-11 w-11 rounded-xl border border-white/20 bg-white/5 text-white/90 backdrop-blur hover:bg-white/20"
      }`}
    >
      <Settings className="h-5 w-5" />
    </Link>
  );
}
