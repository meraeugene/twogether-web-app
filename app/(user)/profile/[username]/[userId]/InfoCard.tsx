import { motion } from "framer-motion";

export function InfoCard({
  icon,
  title,
  value,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`flex items-start gap-3 p-4 rounded-lg bg-white/5 backdrop-blur border border-white/10 ${className}`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-red-400 mt-1">{icon}</div>
      <div>
        <p className="text-white/70 text-sm">{title}</p>
        <p className="text-white text-sm font-medium">{value || "None"}</p>
      </div>
    </motion.div>
  );
}
