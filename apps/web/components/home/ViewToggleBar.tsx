"use client";

import { useViewMode, type ViewMode } from "@/lib/useViewMode";
import { useSortMode } from "@/lib/useSortMode";

const buttons: { mode: ViewMode; label: string }[] = [
  { mode: "masonry", label: "Gallery" },
  { mode: "archive", label: "Icon" },
  { mode: "list", label: "List" },
];

export function ViewToggleBar() {
  const [view, setView] = useViewMode();
  const [sortBy, setSortBy] = useSortMode();
  const isList = view === "list" || view === "list-text";

  return (
    <div className="flex items-center gap-0.5">
      {isList && (
        <div className="flex items-center gap-0.5 mr-2">
          {(["default", "az", "year"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2 py-1 text-xs rounded-lg transition-colors duration-150 ${
                sortBy === s ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {s === "default" ? "Default" : s === "az" ? "A–Z" : "Year"}
            </button>
          ))}
        </div>
      )}
      {buttons.map(({ mode, label }) => (
        <button
          key={mode}
          data-view-btn={mode}
          onClick={() => setView(mode)}
          aria-pressed={view === mode}
          className="px-2 py-1 text-xs rounded-lg transition-colors duration-150 text-ink-muted hover:text-ink"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
