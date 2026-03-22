import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import {
  buildMetadata,
  defaultDescription,
  siteName,
  siteUrl,
} from "@/app/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Watch and Recommend Movies Socially`,
    template: `%s | ${siteName}`,
  },
  applicationName: siteName,
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
    apple: "/icon.ico",
  },
  description: defaultDescription,
  keywords: [
    "movie recommendations",
    "watchlist app",
    "social movie app",
    "tv show recommendations",
    "what to watch",
    "movie community",
  ],
  manifest: "/manifest.json",
  category: "entertainment",
  ...buildMetadata({
    title: `${siteName} | Watch and Recommend Movies Socially`,
    description: defaultDescription,
  }),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.ico" type="image/x-icon" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#010101" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="bottom-right" />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
