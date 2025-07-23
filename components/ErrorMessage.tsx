"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";

export default function ErrorMessage({
  title = "Something went wrong.",
  message = "We couldn’t load this content right now. Please try again later.",
  hint,
}: {
  title?: string;
  message?: string;
  hint?: string;
}) {
  const router = useRouter();

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-black px-6 py-20 sm:py-28">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl mb-8 sm:text-3xl md:text-4xl font-bold text-red-500 font-sans ">
          {title}
        </h1>
        <Image
          src="/error.png"
          alt="error illustration"
          width={400}
          height={400}
          className="mx-auto mb-4"
        />
        <p className="text-base font-mono sm:text-lg text-red-300">{message}</p>
        {hint && (
          <p className="text-sm sm:text-base text-red-200/70 italic border-t border-red-500/20 pt-4">
            {hint}
          </p>
        )}

        <button
          onClick={() => router.back()}
          className=" gap-2 cursor-pointer inline-flex items-center justify-center px-6 py-3 rounded-xl border border-red-500 text-red-300 font-medium tracking-wide transition-all duration-300 bg-black hover:border-red-400 hover:text-red-400 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] focus:outline-none"
        >
          <HiArrowLeft className="text-lg" />
          Go Back
        </button>
      </div>
    </section>
  );
}
