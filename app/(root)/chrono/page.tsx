import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import ChronologicalClient from "./ChronologicalClient";

export const metadata: Metadata = buildMetadata({
  title: "Watch Franchises in Chronological Order",
  description:
    "Follow franchise timelines and watch movies in chronological order with curated viewing guides on Twogether.",
  path: "/chrono",
});

export default function ChronologicalPage() {
  return <ChronologicalClient />;
}
