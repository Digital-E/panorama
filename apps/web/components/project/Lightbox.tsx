"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ImageAsset } from "@portfolio/schema";
import { GlassPill } from "@/components/ui/GlassPill";

/**
 * Fullscreen viewer per the Gallery frame: blurred backdrop, rounded
 * image, round close / prev / next controls, caption pill.
 */
export function Lightbox({
  images,
  index,
  caption,
  onIndexChange,
  onClose,
}: {
  images: ImageAsset[];
  index: number;
  caption?: string;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const image = images[index];
  const many = images.length > 1;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") onIndexChange((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onIndexChange]);

  const roundButton =
    "flex h-12 w-12 items-center justify-center rounded-full bg-glass backdrop-blur-md";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={image.alt || "Image viewer"}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-2xl"
    >
      <div className="flex h-full flex-col items-center justify-center gap-6 px-3">
        <button onClick={onClose} aria-label="Close" className={`${roundButton} absolute right-4 top-4`}>
          <Cross />
        </button>

        <div className="w-full max-w-(--container-column)">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 600px) 600px, 100vw"
            className="max-h-[72svh] w-full rounded-(--radius-card) object-contain"
          />
        </div>

        <div className="flex w-full max-w-(--container-column) items-center justify-between">
          {many ? (
            <button
              onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
              aria-label="Previous image"
              className={roundButton}
            >
              <Chevron flip />
            </button>
          ) : (
            <span className="w-12" />
          )}
          {caption && (
            <GlassPill className="px-6 py-3 text-[17px]">{caption}</GlassPill>
          )}
          {many ? (
            <button
              onClick={() => onIndexChange((index + 1) % images.length)}
              aria-label="Next image"
              className={roundButton}
            >
              <Chevron />
            </button>
          ) : (
            <span className="w-12" />
          )}
        </div>
      </div>
    </dialog>
  );
}

function Cross() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Chevron({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M6.5 3.5L12 9l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
