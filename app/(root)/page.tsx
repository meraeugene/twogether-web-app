import type { Metadata } from "next";
import AiFeatures from "@/sections/AiFeatures";
import Demo from "@/sections/Demo";
import Faqs from "@/sections/Faqs";
import Features from "@/sections/Features";
import Feedback from "@/sections/Feedback";
import FeedbackForm from "@/sections/FeedbackForm";
import Hero from "@/sections/Hero";
import StreamingServices from "@/sections/StreamingServices";
import { buildMetadata } from "@/app/seo";
import ReviewBotPrompt from "@/components/ReviewBotPrompt";

export const metadata: Metadata = buildMetadata({
  title: "Watch and Recommend Movies Socially",
  description:
    "Discover movies and TV shows, build watchlists, and share recommendations with friends on Twogether.",
  path: "/",
});

export default function Home() {
  return (
    <main className="relative w-full min-h-screen  text-white bg-black">
      <Hero />
      <StreamingServices />
      <Feedback />
      <Demo />
      <AiFeatures />
      <Features />
      <FeedbackForm />
      <Faqs />
      <ReviewBotPrompt />
    </main>
  );
}
