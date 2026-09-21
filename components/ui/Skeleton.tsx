import { cn } from "@/utils/cn";

export default function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-shimmer overflow-hidden rounded-lg bg-white/[0.07]",
        className,
      )}
    />
  );
}
