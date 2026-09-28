"use client";

import Image from "next/image";
import { useState } from "react";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

export default function UserAvatar({
  src,
  name,
  className = "h-10 w-10",
  sizes = "40px",
}: {
  src?: string | null;
  name: string;
  className?: string;
  sizes?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src && failedSrc !== src);

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-red-500/80 to-red-950 text-xs font-bold uppercase text-white ${className}`}
      aria-label={name}
    >
      {showImage && src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
}
