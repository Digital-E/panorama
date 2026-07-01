"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import type { ImageAsset } from "@portfolio/schema";
import { type ViewMode } from "@/lib/useViewMode";
import { useViewTransition } from "@/lib/useViewTransition";
import { FadeImage } from "@/components/ui/FadeImage";
import { Lightbox } from "@/components/project/Lightbox";


const buttons: { mode: ViewMode; label: string }[] = [
  { mode: "masonry", label: "Gallery" },
  { mode: "archive", label: "Icon" },
  { mode: "list", label: "List" },
];

export function ProjectGallery({
  images,
  title,
  year,
  backHref,
  showToggle = true,
}: {
  images: ImageAsset[];
  title?: string;
  year?: number;
  backHref?: string;
  showToggle?: boolean;
}) {
  const { view, setView, displayedView, contentRef } = useViewTransition();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isArchive = displayedView === "archive" || displayedView === "archive-sharp";
  const isList = displayedView === "list" || displayedView === "list-text";

  return (
    <>
      {/* Toggle bar — suppressed when rendered externally */}
      {showToggle && <div className="flex items-center justify-between gap-0.5 mb-3 h-7">
        {title && (
          <div className="flex items-center gap-[10px]">
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
              data-view-btn={mode}
              onClick={() => setView(mode)}
              aria-pressed={view === mode}
              className="px-2 py-1 text-xs rounded-lg transition-colors duration-150 text-ink-muted hover:text-ink"
            >
              {label}
            </button>
          ))}
        </div>
      </div>}

      <div ref={contentRef}>
        {/* Masonry: 1-col mobile, 2-col md, 3-col lg — items assigned left-to-right */}
        {(() => {
          const gone = displayedView === "archive-sharp" || isList || displayedView === "list-sharp-crop";
          const col1 = gone ? "hidden" : "flex flex-col gap-(--spacing-gutter) md:hidden";
          const col2 = gone || isArchive ? "hidden" : "hidden md:flex lg:hidden gap-(--spacing-gutter)";
          const col3 = gone || isArchive ? "hidden" : "hidden lg:flex gap-(--spacing-gutter)";
          const renderBtn = (image: ImageAsset, i: number) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="block w-full cursor-pointer"
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
          );
          return (
            <>
              <div className={col1}>{images.map(renderBtn)}</div>
              <div className={col2}>
                <div className="flex-1 flex flex-col gap-(--spacing-gutter)">{images.reduce<React.ReactNode[]>((acc, img, i) => { if (i % 2 === 0) acc.push(renderBtn(img, i)); return acc; }, [])}</div>
                <div className="flex-1 flex flex-col gap-(--spacing-gutter)">{images.reduce<React.ReactNode[]>((acc, img, i) => { if (i % 2 === 1) acc.push(renderBtn(img, i)); return acc; }, [])}</div>
              </div>
              <div className={col3}>
                <div className="flex-1 flex flex-col gap-(--spacing-gutter)">{images.reduce<React.ReactNode[]>((acc, img, i) => { if (i % 3 === 0) acc.push(renderBtn(img, i)); return acc; }, [])}</div>
                <div className="flex-1 flex flex-col gap-(--spacing-gutter)">{images.reduce<React.ReactNode[]>((acc, img, i) => { if (i % 3 === 1) acc.push(renderBtn(img, i)); return acc; }, [])}</div>
                <div className="flex-1 flex flex-col gap-(--spacing-gutter)">{images.reduce<React.ReactNode[]>((acc, img, i) => { if (i % 3 === 2) acc.push(renderBtn(img, i)); return acc; }, [])}</div>
              </div>
            </>
          );
        })()}

        {/* Archive grid */}
        {isArchive && (
          <div
            className={`grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start ${
              displayedView === "archive-sharp"
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
                  className={`${displayedView === "archive" ? "rounded-xl" : ""} overflow-hidden`}
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
        {(isList || displayedView === "list-sharp-crop") && (
          <div className="flex flex-col divide-y divide-[var(--color-surface-edge)]">
            <div className="flex items-center gap-4 px-3 pb-2">
              {displayedView !== "list-text" && <div className="shrink-0 w-10" />}
              <div className="flex-1 min-w-0 text-xs text-ink-muted">Image</div>
            </div>
            {images.map((image, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="group flex items-center gap-4 px-3 py-3 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] w-full text-left cursor-pointer"
              >
                {displayedView !== "list-text" && (
                  displayedView === "list-sharp-crop" ? (
                    <div className="shrink-0 w-10 h-10 overflow-hidden rounded-[3px]">
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
                        className="overflow-hidden rounded-[3px]"
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
      </div>

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
