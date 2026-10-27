"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => {
        router.back();
      }}
      className="relative inline-flex w-11 h-11 md:w-12 md:h-8 lg:w-16 lg:h-9 cursor-pointer items-center justify-center rounded-full md:rounded-md bg-white/10 text-white md:bg-white md:text-red-600 hover:bg-red-600 hover:text-white transition mb-3 md:mb-6"
    >
      <ArrowLeft size={20} />
    </button>
  );
};

export default BackButton;
