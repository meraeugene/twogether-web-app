import { Video, Zap, Shield, Globe } from "lucide-react";
import { RiGeminiLine } from "react-icons/ri";
import { BsChatDots } from "react-icons/bs"; // New icon for Watch with Gemini

export const features = [
  {
    icon: RiGeminiLine,
    title: "AI Recommendations",
    description:
      "Let our AI suggest movies tailored to your mood, genre, or viewing habits. Discover hidden gems effortlessly without endless scrolling.",
  },
  {
    icon: BsChatDots,
    title: "Watch with Gemini",
    description:
      "Chat with Gemini while watching any movie or show. Ask questions, get trivia, explore character arcs, or understand scenes in real-time.",
  },
  {
    icon: Video,
    title: "High Quality Streaming",
    description:
      "Enjoy crystal-clear 4K streaming with immersive sound quality. Our platform delivers a cinematic experience on any device.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Experience near-instant playback with ultra-low latency. No more waiting or buffering — just press play and enjoy.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data and sessions are protected with end-to-end encryption. We prioritize your privacy so you can watch with peace of mind.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description:
      "Access your favorite shows and movies from anywhere in the world. Enjoy localized content with multi-language support on the go.",
  },
];
