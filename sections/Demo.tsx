import { DemoSteps } from "@/components/ui/Timeline";
import { data } from "@/data/demo";

const Demo = () => {
  return (
    <div className="relative w-full overflow-clip">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(220, 38, 38, 0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Red Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />
      <DemoSteps data={data} />
    </div>
  );
};

export default Demo;
