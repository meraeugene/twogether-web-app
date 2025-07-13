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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
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
