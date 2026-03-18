import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import BrowseLandingClient from "./BrowseLandingClient";

export const metadata: Metadata = buildMetadata({
  title: "Browse Movies, TV, Anime, and K-Dramas",
  description:
    "Explore trending movies, TV shows, anime, and K-dramas in one place before picking what to watch next.",
  path: "/browse",
});

export default function BrowseLandingPage() {
  return <BrowseLandingClient />;
}
