"use client";

import { useState } from "react";
import type { ImageAsset } from "@portfolio/schema";
import { useViewMode, type ViewMode } from "@/lib/useViewMode";
import { FadeImage } from "@/components/ui/FadeImage";
import { Lightbox } from "@/components/project/Lightbox";


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

const buttons: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
  { mode: "masonry", label: "Masonry view", icon: <MasonryIcon /> },
  { mode: "archive", label: "Archive view (rounded)", icon: <ArchiveRoundedIcon /> },
  { mode: "archive-sharp", label: "Archive view (sharp)", icon: <ArchiveSharpIcon /> },
  { mode: "list", label: "List view (sharp)", icon: <ListSharpIcon /> },
  { mode: "list-text", label: "List view (text only)", icon: <ListTextIcon /> },
  { mode: "list-sharp-crop", label: "List view (rounded)", icon: <ListRoundedIcon /> },
];

export function ProjectGallery({
  images,
  title,
  year,
}: {
  images: ImageAsset[];
  title?: string;
  year?: number;
}) {
  const [view, setView] = useViewMode();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isArchive = view === "archive" || view === "archive-sharp";
  const isList = view === "list" || view === "list-text";

  return (
    <>
      {/* Toggle bar */}
      <div className="flex items-center justify-between gap-0.5 mb-3">
        {title && (
          <div className="flex items-center gap-[10px]">
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
      </div>

      {/* Masonry */}
      <div
        className={`columns-1 gap-(--spacing-gutter) md:columns-2 lg:columns-3 ${
          view === "archive-sharp" || isList || view === "list-sharp-crop"
            ? "hidden"
            : isArchive
            ? "md:hidden"
            : ""
        }`}
      >
        {images.map((image, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="block w-full break-inside-avoid mb-(--spacing-gutter) cursor-pointer"
          >
            <FadeImage
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="w-full h-auto rounded-xl"
            />
          </button>
        ))}
      </div>

      {/* Archive grid */}
      {isArchive && (
        <div
          className={`grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start ${
            view === "archive-sharp"
              ? "grid gap-x-(--spacing-gutter) gap-y-10"
              : "hidden md:grid gap-x-(--spacing-gutter) gap-y-10"
          }`}
        >
          {images.map((image, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square flex items-center justify-center md:p-5 rounded-2xl transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer w-full"
            >
              <div
                className={`${view === "archive" ? "rounded-xl" : ""} overflow-hidden`}
                style={{
                  aspectRatio: `${image.width} / ${image.height}`,
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              >
                <FadeImage
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 1280px) 220px, (min-width: 1024px) 200px, 200px"
                  className="w-full h-full object-cover"
                />
              </div>
              {image.alt && (
                <div className="pointer-events-none absolute top-full left-0 right-0 pt-1.5 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-xs text-ink truncate leading-tight">{image.alt}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {(isList || view === "list-sharp-crop") && (
        <div className="flex flex-col divide-y divide-[var(--color-surface-edge)]">
          <div className="flex items-center gap-4 pb-2">
            {view !== "list-text" && <div className="shrink-0 w-10" />}
            <div className="flex-1 min-w-0 text-xs text-ink-muted">Image</div>
          </div>
          {images.map((image, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="group flex items-center gap-4 py-3 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] w-full text-left cursor-pointer"
            >
              {view !== "list-text" && (
                view === "list-sharp-crop" ? (
                  <div className="shrink-0 w-10 h-10 overflow-hidden">
                    <FadeImage
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="40px"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center">
                    <div
                      className="overflow-hidden"
                      style={{
                        aspectRatio: `${image.width} / ${image.height}`,
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    >
                      <FadeImage
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="40px"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{image.alt || `Image ${i + 1}`}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
