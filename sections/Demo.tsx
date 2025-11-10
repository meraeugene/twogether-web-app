"use client";

import { DemoSteps } from "@/components/ui/DemoSteps";
import { data } from "@/data/demo";

const Demo = () => {
  return (
    <section id="demo" className="relative w-full overflow-clip">
      {/* Combined Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 via-black/10 to-red-900/10" />
      </div>

      <DemoSteps data={data} />
    </section>
  );
};

export default Demo;
