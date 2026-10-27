"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

const BackButton = ({ className }: { className?: string }) => {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => {
        router.back();
      }}
      className={cn("glass-control relative inline-flex w-11 h-11 md:w-12 md:h-8 lg:w-16 lg:h-9 cursor-pointer items-center justify-center rounded-full md:rounded-md text-white transition mb-3 md:mb-6", className)}
    >
      <ArrowLeft size={20} />
    </button>
  );
};

export default BackButton;
