import type { ReactNode } from "react";

/** The floating surface every region of the page sits on. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-(--radius-card) bg-surface ${className}`}>
      {children}
    </div>
  );
}
