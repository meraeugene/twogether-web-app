import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import BrowseAnimeClient from "./BrowseAnimeClient";
import { BROWSE_CATEGORY_SHELVES } from "@/constants/browseShelves";

export const metadata: Metadata = buildMetadata({
  title: "Browse Trending Anime",
  description:
    "Explore trending anime titles and discover what to watch next on Twogether.",
  path: "/browse/anime",
});

export default async function BrowseAnimePage({ searchParams }: { searchParams: Promise<{ genre?: string | string[] }> }) {
  const params = await searchParams;
  const genre = BROWSE_CATEGORY_SHELVES.anime.find((item) => item.genre === params.genre)?.genre;
  return <BrowseAnimeClient genre={genre} />;
}
