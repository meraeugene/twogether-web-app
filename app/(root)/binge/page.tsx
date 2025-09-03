import { BINGE_GENRES } from "@/constants/genre";
import BingeClient from "./BingeClient";

export default function page({
  searchParams,
}: {
  searchParams: { genre?: string };
}) {
  const initialGenre = searchParams.genre || "Action";

  return (
    <main className="min-h-screen relative bg-black pb-16 pt-28 lg:pt-36 px-7 lg:px-24 xl:px-32 2xl:px-26 text-white font-[family-name:var(--font-geist-sans)]">
      {/* Combined Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Dots */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />
      </div>

      <BingeClient initialGenre={initialGenre} genres={BINGE_GENRES} />
    </main>
  );
}
