"use client";

import { useState } from "react";
import type { Project } from "@portfolio/schema";
import { ProjectCard } from "./ProjectCard";
import { ArchiveProjectCard } from "./ArchiveProjectCard";
import { ListProjectCard } from "./ListProjectCard";

type ViewMode = "masonry" | "archive" | "archive-sharp" | "list" | "list-text" | "list-sharp-crop";

function MasonryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
      <rect x="0" y="0" width="4" height="9" rx="1" />
      <rect x="0" y="10" width="4" height="5" rx="1" />
      <rect x="5.5" y="0" width="4" height="5" rx="1" />
      <rect x="5.5" y="6" width="4" height="9" rx="1" />
      <rect x="11" y="0" width="4" height="7" rx="1" />
      <rect x="11" y="8" width="4" height="7" rx="1" />
    </svg>
  );
}

function ArchiveRoundedIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
      <rect x="0" y="0" width="4" height="4" rx="1.5" />
      <rect x="5.5" y="0" width="4" height="4" rx="1.5" />
      <rect x="11" y="0" width="4" height="4" rx="1.5" />
      <rect x="0" y="5.5" width="4" height="4" rx="1.5" />
      <rect x="5.5" y="5.5" width="4" height="4" rx="1.5" />
      <rect x="11" y="5.5" width="4" height="4" rx="1.5" />
      <rect x="0" y="11" width="4" height="4" rx="1.5" />
      <rect x="5.5" y="11" width="4" height="4" rx="1.5" />
      <rect x="11" y="11" width="4" height="4" rx="1.5" />
    </svg>
  );
}

function ArchiveSharpIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
      <rect x="0" y="0" width="4" height="4" />
      <rect x="5.5" y="0" width="4" height="4" />
      <rect x="11" y="0" width="4" height="4" />
      <rect x="0" y="5.5" width="4" height="4" />
      <rect x="5.5" y="5.5" width="4" height="4" />
      <rect x="11" y="5.5" width="4" height="4" />
      <rect x="0" y="11" width="4" height="4" />
      <rect x="5.5" y="11" width="4" height="4" />
      <rect x="11" y="11" width="4" height="4" />
    </svg>
  );
}

function ListSharpIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
      <rect x="0" y="0.5" width="4" height="4" />
      <rect x="6" y="2" width="9" height="1.5" rx="0.75" />
      <rect x="0" y="5.5" width="4" height="4" />
      <rect x="6" y="7" width="9" height="1.5" rx="0.75" />
      <rect x="0" y="10.5" width="4" height="4" />
      <rect x="6" y="12" width="9" height="1.5" rx="0.75" />
    </svg>
  );
}

function ListRoundedIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
      <rect x="0" y="0.5" width="4" height="4" rx="1.5" />
      <rect x="6" y="2" width="9" height="1.5" rx="0.75" />
      <rect x="0" y="5.5" width="4" height="4" rx="1.5" />
      <rect x="6" y="7" width="9" height="1.5" rx="0.75" />
      <rect x="0" y="10.5" width="4" height="4" rx="1.5" />
      <rect x="6" y="12" width="9" height="1.5" rx="0.75" />
    </svg>
  );
}

function ListTextIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
      <rect x="0" y="1.5" width="15" height="1.5" rx="0.75" />
      <rect x="0" y="6.75" width="15" height="1.5" rx="0.75" />
      <rect x="0" y="12" width="15" height="1.5" rx="0.75" />
    </svg>
  );
}

export function ProjectsGrid({
  username,
  projects,
}: {
  username: string;
  projects: Project[];
}) {
  const [view, setView] = useState<ViewMode>("archive");
  const [sortBy, setSortBy] = useState<"default" | "az" | "year">("default");

  const isArchive = view === "archive" || view === "archive-sharp";

  const isList = view === "list" || view === "list-text";

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

  const buttons: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: "masonry", label: "Masonry view", icon: <MasonryIcon /> },
    { mode: "archive", label: "Archive view (rounded)", icon: <ArchiveRoundedIcon /> },
    { mode: "archive-sharp", label: "Archive view (sharp)", icon: <ArchiveSharpIcon /> },
    { mode: "list", label: "List view (sharp)", icon: <ListSharpIcon /> },
    { mode: "list-text", label: "List view (text only)", icon: <ListTextIcon /> },
    { mode: "list-sharp-crop", label: "List view (rounded)", icon: <ListRoundedIcon /> },
  ];

  return (
    <div id="work" className="scroll-mt-3">
      {/* Toggle — all screen sizes */}
      <div className="flex items-center justify-end gap-0.5 mb-3">
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
        {buttons.map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => setView(mode)}
            aria-label={label}
            aria-pressed={view === mode}
            className={`p-1.5 rounded-lg transition-colors duration-150 ${
              view === mode ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Masonry: hidden for archive-sharp and list; hidden on desktop for rounded archive */}
      <div
        className={`columns-1 gap-(--spacing-gutter) md:columns-2 lg:columns-3 ${
          view === "archive-sharp" || isList || view === "list-sharp-crop" ? "hidden" : isArchive ? "md:hidden" : ""
        }`}
      >
        {projects.map((project) => (
          <ProjectCard key={project.slug} username={username} project={project} />
        ))}
      </div>

      {/* Archive: all screens for sharp, desktop-only for rounded */}
      {isArchive && (
        <div className={`grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start ${view === "archive-sharp" ? "grid gap-x-(--spacing-gutter) gap-y-10" : "hidden md:grid gap-x-(--spacing-gutter) gap-y-10"}`}>
          {projects.map((project) => (
            <ArchiveProjectCard
              key={project.slug}
              username={username}
              project={project}
              rounded={view === "archive"}
              showTitle={true}
            />
          ))}
        </div>
      )}

      {/* List */}
      {(isList || view === "list-sharp-crop") && (
        <div className="flex flex-col divide-y divide-[var(--color-surface-edge)]">
          {/* Column headers */}
          <div className="flex items-center gap-4 pb-2">
            {view !== "list-text" && <div className="shrink-0 w-10" />}
            <div className="flex-1 min-w-0 text-xs text-ink-muted">Project</div>
            <span className="shrink-0 text-xs text-ink-muted">Year</span>
          </div>
          {sortedProjects.map((project) => (
            <ListProjectCard
              key={project.slug}
              username={username}
              project={project}
              rounded={view === "list-sharp-crop"}
              thumbnail={view !== "list-text"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
