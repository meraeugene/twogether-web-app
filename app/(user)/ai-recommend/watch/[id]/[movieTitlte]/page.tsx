"use client";

import dynamic from "next/dynamic";

const AIWatchClient = dynamic(() => import("./AIWatchClient"), {
  ssr: false,
});

export default function AIWatchPage() {
  return <AIWatchClient />;
}
