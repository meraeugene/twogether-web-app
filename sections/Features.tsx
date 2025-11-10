"use client";

import { motion } from "framer-motion";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { features } from "@/data/features";

const Features = () => {
  return (
    <section
      id="features"
      className="pb-20 relative pt-16 px-7 md:px-12 lg:px-24"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-[family-name:var(--font-geist-sans)]">
            6 Reasons to <span className="text-red-500">Join</span>
          </h1>
          <p className="text-base md:text-lg xl:text-xl text-gray-300 max-w-2xl mx-auto font-[family-name:var(--font-geist-mono)]">
            Experience the future of social streaming with features designed for
            connection and quality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
