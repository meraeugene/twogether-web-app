import { getCurrentUser } from "@/actions/authActions";
import About from "@/sections/About";
import Cta from "@/sections/Cta";
import Faqs from "@/sections/Faqs";
import Features from "@/sections/Features";
import Hero from "@/sections/Hero";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="relative w-full min-h-screen font-[var(--font-geist-sans)] text-white bg-black">
      <Hero user={user ?? null} />
      <About />
      <Features />
      <Faqs />
      <Cta user={user ?? null} />
    </main>
  );
}
