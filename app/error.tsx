"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black px-6 pb-16 pt-28 text-white lg:px-24 xl:px-32">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-3 inline-flex rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-300">
          Something went wrong
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          We hit a loading problem.
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/65">
          The page did not finish rendering correctly. Try again, and if it
          keeps happening we can trace the exact route next.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/35">
            Digest {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.1]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-transparent px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
