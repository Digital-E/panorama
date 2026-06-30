"use client";

import type { Project } from "@portfolio/schema";
import { type ViewMode } from "@/lib/useViewMode";
import { useViewTransition } from "@/lib/useViewTransition";
import { useSortMode } from "@/lib/useSortMode";
import { ProjectCard } from "./ProjectCard";
import { ArchiveProjectCard } from "./ArchiveProjectCard";
import { ListProjectCard } from "./ListProjectCard";


export function ProjectsGrid({
  username,
  projects,
  showToggle = true,
}: {
  username: string;
  projects: Project[];
  showToggle?: boolean;
}) {
  const { view, setView, displayedView, contentRef } = useViewTransition();
  const [sortBy, setSortBy] = useSortMode();

  const isArchive = displayedView === "archive" || displayedView === "archive-sharp";
  const isList = displayedView === "list" || displayedView === "list-text";

  const sortedProjects = isList ? [...projects].sort((a, b) => {
    if (sortBy === "az") return a.title.localeCompare(b.title);
    if (sortBy === "year") {
      if (a.year == null && b.year == null) return 0;
      if (a.year == null) return 1;
      if (b.year == null) return -1;
      return b.year - a.year;
    }
    return 0;
  }) : projects;

  const buttons: { mode: ViewMode; label: string }[] = [
    { mode: "masonry", label: "Spotlight" },
    { mode: "archive", label: "Archive" },
    { mode: "list", label: "List" },
  ];

  return (
    <div id="work" className="scroll-mt-3 hidden md:block">
      {/* Toggle — desktop only, suppressed when rendered externally */}
      {showToggle && <div className="hidden md:flex items-center justify-end gap-0.5 mb-3 h-7">
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
            onClick={() => setView(mode)}
            aria-pressed={view === mode}
            className={`px-2 py-1 text-xs rounded-lg transition-colors duration-150 ${
              view === mode ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>}

      <div ref={contentRef}>
        {/* Masonry: 2-col md, 3-col lg — items assigned left-to-right */}
        {(() => {
          const gone = displayedView === "archive-sharp" || isList || displayedView === "list-sharp-crop";
          const col2 = gone || isArchive ? "hidden" : "hidden md:flex lg:hidden gap-(--spacing-gutter)";
          const col3 = gone || isArchive ? "hidden" : "hidden lg:flex gap-(--spacing-gutter)";
          const renderCard = (project: Project) => (
            <ProjectCard key={project.slug} username={username} project={project} />
          );
          return (
            <>
              <div className={col2}>
                <div className="flex-1 flex flex-col gap-5">{projects.filter((_, i) => i % 2 === 0).map(renderCard)}</div>
                <div className="flex-1 flex flex-col gap-5">{projects.filter((_, i) => i % 2 === 1).map(renderCard)}</div>
              </div>
              <div className={col3}>
                <div className="flex-1 flex flex-col gap-5">{projects.filter((_, i) => i % 3 === 0).map(renderCard)}</div>
                <div className="flex-1 flex flex-col gap-5">{projects.filter((_, i) => i % 3 === 1).map(renderCard)}</div>
                <div className="flex-1 flex flex-col gap-5">{projects.filter((_, i) => i % 3 === 2).map(renderCard)}</div>
              </div>
            </>
          );
        })()}

        {/* Archive: all screens for sharp, desktop-only for rounded */}
        {isArchive && (
          <div className={`grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start ${displayedView === "archive-sharp" ? "grid gap-x-(--spacing-gutter) gap-y-10" : "hidden md:grid gap-x-(--spacing-gutter) gap-y-10"}`}>
            {projects.map((project) => (
              <ArchiveProjectCard
                key={project.slug}
                username={username}
                project={project}
                rounded={displayedView === "archive"}
                showTitle={true}
              />
            ))}
          </div>
        )}

        {/* List */}
        {(isList || displayedView === "list-sharp-crop") && (
          <div className="flex flex-col divide-y divide-[var(--color-surface-edge)]">
            {/* Column headers */}
            <div className="flex items-center gap-4 px-3 pb-2">
              {displayedView !== "list-text" && <div className="shrink-0 w-10" />}
              <div className="flex-1 min-w-0 text-xs text-ink-muted">Project</div>
              <span className="shrink-0 text-xs text-ink-muted">Year</span>
            </div>
            {sortedProjects.map((project) => (
              <ListProjectCard
                key={project.slug}
                username={username}
                project={project}
                rounded={displayedView === "list-sharp-crop"}
                thumbnail={displayedView !== "list-text"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
