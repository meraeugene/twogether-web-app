"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        router.back();
      }}
      className="inline-flex  w-12 h-8   lg:w-16 lg:h-9 cursor-pointer  items-center justify-center rounded-md bg-white text-red-600 hover:bg-red-600 hover:text-white transition mb-6"
    >
      <ArrowLeft size={20} />
    </button>
  );
};

export default BackButton;
