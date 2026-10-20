import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import BrowseKDramaClient from "./BrowseKDramaClient";
import { BROWSE_CATEGORY_SHELVES } from "@/constants/browseShelves";

export const metadata: Metadata = buildMetadata({
  title: "Browse Trending K-Dramas",
  description:
    "Discover trending K-dramas and explore new series to watch on Twogether.",
  path: "/browse/kdrama",
});

export default async function BrowseKDramaPage({ searchParams }: { searchParams: Promise<{ genre?: string | string[] }> }) {
  const params = await searchParams;
  const genre = BROWSE_CATEGORY_SHELVES.kdramas.find((item) => item.genre === params.genre)?.genre;
  return <BrowseKDramaClient genre={genre} />;
}
