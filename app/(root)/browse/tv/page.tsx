import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import BrowseTVShowsClient from "./BrowseTVShowsClient";
import { BROWSE_CATEGORY_SHELVES } from "@/constants/browseShelves";

export const metadata: Metadata = buildMetadata({
  title: "Browse Trending TV Shows",
  description:
    "Discover trending TV shows and find your next series to binge with Twogether.",
  path: "/browse/tv",
});

export default async function BrowseTVShowsPage({ searchParams }: { searchParams: Promise<{ genre?: string | string[] }> }) {
  const params = await searchParams;
  const genre = BROWSE_CATEGORY_SHELVES.tv.find((item) => item.genre === params.genre)?.genre;
  return <BrowseTVShowsClient genre={genre} />;
}
