import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import BingeClient from "./BingeClient";

export const metadata: Metadata = buildMetadata({
  title: "Browse Binge-Worthy Collections",
  description:
    "Find binge-worthy movie collections by genre and jump into a full series marathon on Twogether.",
  path: "/binge",
});

export default function BingePage() {
  return <BingeClient />;
}
