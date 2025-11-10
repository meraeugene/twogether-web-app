import { getCurrentUser } from "@/actions/authActions";
import { getTotalActiveUser } from "@/actions/countActions";
import AiFeatures from "@/sections/AiFeatures";
import Demo from "@/sections/Demo";
import Faqs from "@/sections/Faqs";
import Features from "@/sections/Features";
import Feedback from "@/sections/Feedback";
import FeedbackForm from "@/sections/FeedbackForm";
import Hero from "@/sections/Hero";
import StreamingServices from "@/sections/StreamingServices";

export default async function Home() {
  const [user, totalActiveUsers] = await Promise.all([
    getCurrentUser(),
    getTotalActiveUser(),
  ]);

  return (
    <main className="relative w-full min-h-screen  text-white bg-black">
      <Hero user={user ?? null} totalActiveUsers={totalActiveUsers} />
      <StreamingServices />
      <Feedback />
      <Demo />
      <AiFeatures />
      <Features />
      <FeedbackForm />
      <Faqs />
    </main>
  );
}
