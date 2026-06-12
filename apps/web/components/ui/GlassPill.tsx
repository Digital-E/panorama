import type { ReactNode } from "react";

/** Translucent bar that floats over imagery (project card titles, captions). */
export function GlassPill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-glass backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
