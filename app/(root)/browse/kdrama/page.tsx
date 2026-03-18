import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import BrowseKDramaClient from "./BrowseKDramaClient";

export const metadata: Metadata = buildMetadata({
  title: "Browse Trending K-Dramas",
  description:
    "Discover trending K-dramas and explore new series to watch on Twogether.",
  path: "/browse/kdrama",
});

export default function BrowseKDramaPage() {
  return <BrowseKDramaClient />;
}
