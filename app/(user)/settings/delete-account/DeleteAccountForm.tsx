"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount } from "@/actions/accountActions";

export default function DeleteAccountForm() {
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();
  const canDelete = confirmation === "DELETE";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await deleteAccount(confirmation);

      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl rounded-lg border border-white/10 bg-white/[0.04] p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Delete account</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">
            This permanently deletes your Twogether account and signs you out.
            This action cannot be undone.
          </p>
        </div>
      </div>

      <label
        htmlFor="delete-confirmation"
        className="mt-8 block text-sm font-medium text-white/80"
      >
        Type DELETE to confirm
      </label>
      <input
        id="delete-confirmation"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        className="mt-3 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-red-400/70 focus:ring-2 focus:ring-red-500/20"
        placeholder="DELETE"
      />

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/recos"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={!canDelete || isPending}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {isPending ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </form>
  );
}
