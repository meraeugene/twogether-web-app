import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import BrowseAnimeClient from "./BrowseAnimeClient";

export const metadata: Metadata = buildMetadata({
  title: "Browse Trending Anime",
  description:
    "Explore trending anime titles and discover what to watch next on Twogether.",
  path: "/browse/anime",
});

export default function BrowseAnimePage() {
  return <BrowseAnimeClient />;
}
