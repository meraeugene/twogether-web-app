"use client";

import { FaLock, FaGlobe } from "react-icons/fa";

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const isPublic = title.toLowerCase() === "public";
  const Icon = isPublic ? FaGlobe : FaLock;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Icon className="text-white/60 text-sm" />
        <span>{title}</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {children}
      </div>
    </section>
  );
};
