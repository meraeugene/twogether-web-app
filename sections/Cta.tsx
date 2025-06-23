"use client";
import { useRouter } from "next/navigation";
import { FaPlayCircle } from "react-icons/fa";
import { toast } from "sonner";

interface CtaProps {
  user?: {
    avatar_url: string;
    email: string | null;
    full_name: string;
  } | null;
}
const Cta = ({ user }: CtaProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      toast.error("Please sign in to start TWOGETHER.");
      return;
    }

    router.push("/browse");
  };
  return (
    <section className="py-24 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 font-[family-name:var(--font-geist-sans)]">
        Watch Movies Together
      </h2>
      <p className="text-lg max-w-2xl mx-auto mb-8 text-white/80 font-[family-name:var(--font-geist-mono)]">
        With custom profiles, private chat, and real-time reactions, Twogether
        transforms streaming into a social experience — bringing people closer,
        wherever they are.
      </p>
      <button
        onClick={handleClick}
        className="bg-red-600 cursor-pointer hover:bg-red-700 px-6 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition mx-auto font-[family-name:var(--font-geist-mono)]"
      >
        <FaPlayCircle className="text-white text-xl" /> Start TWOGETHER
      </button>
    </section>
  );
};

export default Cta;
