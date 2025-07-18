"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const AiFeatures = () => {
  return (
    <section
      id="features"
      className="relative pb-20 pt-16 px-7 md:px-12 lg:px-24 overflow-hidden"
    >
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
        <div className="absolute inset-0 bg-gradient-to-br from-red-700/30 via-black/10 to-red-900/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-geist-sans)] text-red-500">
            Ai Reco | Watch Gemeni
          </h2>
          <p className="text-base md:text-lg xl:text-xl text-gray-300 max-w-2xl mx-auto font-[family-name:var(--font-geist-mono)]">
            Experience the future of social streaming with features designed for
            connection and quality.
          </p>
        </motion.div>

        {/* Responsive Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {[
            "/demo/ai1.png",
            "/demo/ai2.png",
            "/demo/ai3.png",
            "/demo/ai4.png",
          ].map((src, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl shadow-xl border border-white/10 bg-white/5 hover:scale-[1.02] transition-transform duration-300"
            >
              <Image
                src={src}
                alt={`Feature ${i + 1}`}
                width={500}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AiFeatures;
