import type { MetadataRoute } from "next";
import { siteUrl } from "@/app/seo";

const publicRoutes = [
  "/",
  "/browse",
  "/browse/movies",
  "/browse/tv",
  "/browse/anime",
  "/browse/kdrama",
  "/binge",
  "/chrono",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
