"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export default function MovieTitle({ title }: { title: string }) {
  const viewport = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const container = viewport.current;
    const content = text.current;
    if (!container || !content) return;

    const measure = () => {
      setOverflow(Math.max(0, content.scrollWidth - container.clientWidth));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);
    measure();
    return () => observer.disconnect();
  }, [title]);

  return (
    <span ref={viewport} className="mobile-movie-title" title={title}
      data-overflow={overflow > 1 ? "true" : undefined}
      style={{
        "--title-offset": `-${overflow}px`,
        "--title-duration": `${Math.max(4, overflow / 24 + 2)}s`,
      } as CSSProperties}>
      <span key={title} ref={text} className="mobile-movie-title-text">{title}</span>
    </span>
  );
}
