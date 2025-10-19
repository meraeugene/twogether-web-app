import { InfiniteMovingCards } from "@/components/ui/InfiniteMovingCards";
import { streamingServices } from "@/data/streamingServices";

export default function StreamingServices() {
  return (
    <div className="py-20   relative">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/5 to-red-900/10" />
      </div>

      <div className="relative z-10 w-full px-4">
        <h2 className="text-3xl font-bold md:text-4xl font-sans text-white text-center">
          Premium <span className="text-red-600">Streaming</span>
        </h2>
        <p className="text-base md:text-lg text-center xl:text-xl text-gray-300  mx-auto font-[family-name:var(--font-geist-mono)]   lg:text-lg leading-relaxed max-w-xs lg:max-w-lg mt-4 opacity-75 mb-10">
          All your favorite platforms in one place
        </p>

        <InfiniteMovingCards
          items={streamingServices}
          direction="left"
          speed="slow"
          pauseOnHover={true}
        />
      </div>
    </div>
  );
}
