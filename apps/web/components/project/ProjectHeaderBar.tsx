"use client";

import { Link } from "next-view-transitions";
import { useViewMode, type ViewMode } from "@/lib/useViewMode";

const buttons: { mode: ViewMode; label: string }[] = [
  { mode: "masonry", label: "Spotlight" },
  { mode: "archive", label: "Archive" },
  { mode: "list", label: "List" },
];

export function ProjectHeaderBar({
  title,
  year,
  backHref,
}: {
  title?: string;
  year?: number;
  backHref?: string;
}) {
  const [view, setView] = useViewMode();

  return (
    <div className="flex items-center justify-between gap-0.5 h-7 mb-3">
      {title && (
        <div data-slide-header="" className="flex items-center gap-[10px]">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-glass backdrop-blur-md transition-colors hover:bg-white/20 text-white shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path d="M9 3L4.5 7.5L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          <p className="text-[15px]">{title}</p>
          {year && <p className="text-sm text-ink-muted">{year}</p>}
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden className="text-ink-muted shrink-0">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7.5 6.5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="7.5" cy="4.5" r="0.6" fill="currentColor" />
          </svg>
        </div>
      )}
      <div className="flex items-center gap-0.5 ml-auto">
        {buttons.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setView(mode)}
            aria-pressed={view === mode}
            className={`px-2 py-1 text-xs rounded-lg transition-colors duration-150 ${
              view === mode ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
