import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { getCurrentUser } from "@/actions/authActions";
import PresenceManager from "@/components/PresenceManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Twogether",
  description:
    "Twogether is a social movie and TV show platform where users can stream, recommend, and discuss their favorite films. Watch together, chat privately, and discover what others love — all in one place.",
  openGraph: {
    title: "Twogether – Watch & Recommend Movies Socially",
    description:
      "Stream and recommend movies with friends. Twogether is your cozy social movie space to discover what couples and friends are watching together.",
    url: "https://twogether-live.vercel.app/", // replace with your actual domain
    siteName: "Twogether",
    images: [
      {
        url: "https://raw.githubusercontent.com/meraeugene/twogether-web-app/refs/heads/main/public/thumbnail.png", // replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: "Twogether – Watch & Recommend Movies Socially",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twogether – Watch & Recommend Movies Socially",
    description:
      "Stream and recommend movies with friends. Twogether is your cozy social movie space to discover what couples and friends are watching together.",
    images: [
      "https://raw.githubusercontent.com/meraeugene/twogether-web-app/refs/heads/main/public/thumbnail.png",
    ], // replace with your actual image
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center" />
        <Header />
        {currentUser?.id && <PresenceManager userId={currentUser.id} />}
        {children}
        <Footer />
      </body>
    </html>
  );
}
