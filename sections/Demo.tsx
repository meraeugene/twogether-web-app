"use client";

import { DemoSteps } from "@/components/ui/DemoSteps";
import { data } from "@/data/demo";

const Demo = () => {
  return (
    <div className="relative w-full overflow-clip">
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

      <DemoSteps data={data} />
    </div>
  );
};

export default Demo;
