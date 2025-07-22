import { getCurrentUser } from "@/actions/authActions";
import AiFeatures from "@/sections/AiFeatures";
import Demo from "@/sections/Demo";
import Faqs from "@/sections/Faqs";
import Features from "@/sections/Features";
import Hero from "@/sections/Hero";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="relative w-full min-h-screen  text-white bg-black">
      <Hero user={user ?? null} />
      <Demo />
      <AiFeatures />
      <Features />
      <Faqs />
    </main>
  );
}
