"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";

export default function ErrorMessage() {
  const router = useRouter();

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-black px-6 py-20 sm:py-28">
      <div className="max-w-md w-full text-center ">
        <h1 className="text-4xl font-bold text-red-500 font-[family-name:var(--font-geist-mono)] ">
          Oops!
        </h1>
        <p className="font-[family-name:var(--font-geist-mono)] text-lg text-red-300 mt-1">
          You are lost
        </p>

        <Image
          src="/error.png"
          alt="error illustration"
          width={400}
          height={400}
          className="mx-auto mt-8"
        />

        <button
          onClick={() => router.back()}
          className="mt-8 gap-2 cursor-pointer inline-flex items-center justify-center px-6 py-3 rounded-xl border border-red-500 text-red-300 font-medium tracking-wide transition-all duration-300 bg-black hover:border-red-400 hover:text-red-400 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] focus:outline-none"
        >
          <HiArrowLeft className="text-lg" />
          Go Back
        </button>
      </div>
    </section>
  );
}
