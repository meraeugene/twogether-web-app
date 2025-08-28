"use client";
import { motion } from "framer-motion";
import { BorderTrail } from "./BorderTrail";
import { cn } from "@/utils/cn";

type FeatureType = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
};

type FeatureCardProps = React.ComponentProps<typeof motion.div> & {
  feature: FeatureType;
};

export function FeatureCard({
  feature,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden p-8 md:p-6 bg-black/40 border border-red-500/20 rounded-xl group hover:border-red-500/50 transition-all duration-300",
        className
      )}
      {...props}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <BorderTrail
        className="bg-red-500 opacity-60"
        size={40}
        style={{
          boxShadow: "0px 0px 30px 15px rgb(239 68 68 / 30%)",
        }}
      />
      <div className="relative z-10">
        <feature.icon className="text-red-400  mb-4" />
        <h3 className="text-xl lg:text-2xl font-bold  mb-3 font-[family-name:var(--font-geist-sans)]">
          {feature.title}
        </h3>
        <p className="text-gray-300 text-sm  md:text-base leading-relaxed font-[family-name:var(--font-geist-mono)]">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
