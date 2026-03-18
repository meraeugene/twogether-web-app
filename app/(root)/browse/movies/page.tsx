import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import BrowseMoviesClient from "./BrowseMoviesClient";

export const metadata: Metadata = buildMetadata({
  title: "Browse Trending Movies",
  description:
    "Browse trending movies by genre and discover new films to add to your watchlist on Twogether.",
  path: "/browse/movies",
});

export default function BrowseMoviesPage() {
  return <BrowseMoviesClient />;
}
