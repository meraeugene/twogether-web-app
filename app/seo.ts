import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://twogether-live.vercel.app";

const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : vercelUrl
    ? vercelUrl.startsWith("http")
      ? vercelUrl
      : `https://${vercelUrl}`
    : FALLBACK_SITE_URL;

export const siteName = "Twogether";
export const defaultDescription =
  "Twogether is a social movie and TV show platform for discovering, recommending, and talking about what to watch next with friends.";
export const defaultOgImage = "/thumbnail.png";

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  images?: string[];
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  images = [defaultOgImage],
  noIndex = false,
}: BuildMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
