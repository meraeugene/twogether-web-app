"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaPlayCircle } from "react-icons/fa";
import { toast } from "sonner";

interface HeroProps {
  user?: {
    avatar_url: string;
    email: string | null;
    full_name: string;
  } | null;
}

const Hero = ({ user }: HeroProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      toast.error("Please sign in to start TWOGETHER.");
      return;
    }

    router.push("/browse");
  };
  return (
    <section className="relative h-screen w-full overflow-hidden border-b border-white/10">
      <Image
        src="/hero.png"
        alt="Hero"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl leading-tight font-[family-name:var(--font-geist-sans)]">
          A Social Cinema Experience
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-2xl text-white/90 drop-shadow font-[family-name:var(--font-geist-mono)]">
          Discover, watch, and bond over movies and shows with others. Built for
          connection, built for fun.
        </p>
        <button
          onClick={handleClick}
          className="bg-red-600 cursor-pointer hover:bg-red-700 px-6 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition font-[family-name:var(--font-geist-mono)]"
        >
          <FaPlayCircle className="text-white text-xl" /> Start TWOGETHER
        </button>
      </div>
    </section>
  );
};

export default Hero;
