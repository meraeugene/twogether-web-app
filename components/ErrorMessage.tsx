"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorMessageProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  href?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
};

export default function ErrorMessage({
  title = "Something went off-script",
  message = "We couldn't load this part of Twogether right now. Try again in a moment or head back to a safer route.",
  actionLabel = "Back to Home",
  href = "/",
  onRetry,
  fullScreen = true,
}: ErrorMessageProps) {
  return (
    <section
      className={`relative flex items-center justify-center overflow-hidden px-6 py-12 text-white ${
        fullScreen ? "min-h-screen" : "min-h-[360px]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.16),transparent_28%),linear-gradient(180deg,#090909_0%,#040404_55%,#020202_100%)]" />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.14),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(248,113,113,0.08),transparent_22%)]" />

        <div className="relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.18)]">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <span className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Loading Error
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            {title}
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/62 sm:text-base">
            {message}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.1] sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            )}

            <Link
              href={href}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:border-red-400/40 hover:bg-red-500/15 sm:w-auto"
            >
              {actionLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
