import Link from "next/link";
import { FaPlayCircle } from "react-icons/fa";

const About = () => {
  return (
    <section
      id="about"
      className="relative px-6 py-32  border-b border-white/10"
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight text-white font-[family-name:var(--font-geist-sans)]">
          More Than Just Streaming
        </h2>

        <p className="text-lg md:text-xl text-white/80 leading-relaxed font-[family-name:var(--font-geist-mono)] mb-12 max-w-5xl mx-auto">
          <strong className="text-white font-bold ">Twogether</strong> is a
          social streaming platform where movies and shows meet connection.
          Built for couples, friends, and film lovers, it blends full-screen
          streaming with real-time chat, emoji reactions, user recommendations,
          and followable profiles — making every movie night a shared
          experience, no matter the distance.
        </p>

        <Link href="#features">
          <button className="bg-red-600 cursor-pointer mx-auto hover:bg-red-700 px-6 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition font-[family-name:var(--font-geist-mono)]">
            <FaPlayCircle className="text-white text-xl" />
            Explore Features
          </button>
        </Link>
      </div>
    </section>
  );
};

export default About;
