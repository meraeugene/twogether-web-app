import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import BrowseTVShowsClient from "./BrowseTVShowsClient";

export const metadata: Metadata = buildMetadata({
  title: "Browse Trending TV Shows",
  description:
    "Discover trending TV shows and find your next series to binge with Twogether.",
  path: "/browse/tv",
});

export default function BrowseTVShowsPage() {
  return <BrowseTVShowsClient />;
}
