"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { z } from "zod";
import type { MediaBlockSchema } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";
import { GlassPill } from "@/components/ui/GlassPill";
import { Lightbox } from "./Lightbox";

type Data = z.infer<typeof MediaBlockSchema>["data"];

/**
 * Scroll-snap carousel with page dots and the caption pill, per the
 * Project frame. Tapping an image opens the lightbox (Gallery frame).
 */
export function MediaCarousel({ data }: { data: Data }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const many = data.images.length > 1;

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    setPage(Math.round(track.scrollLeft / track.clientWidth));
  }

  return (
    <>
      <Card className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {data.images.map((image, i) => (
            <button
              key={image.src}
              onClick={() => setLightbox(i)}
              aria-label={`Open image ${i + 1} of ${data.images.length}`}
              className="w-full shrink-0 snap-center"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 600px) 600px, 100vw"
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between">
          {many ? (
            <div className="flex gap-1.5" aria-hidden>
              {data.images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === page ? "bg-ink" : "bg-ink/35"
                  }`}
                />
              ))}
            </div>
          ) : (
            <span />
          )}
          {data.caption && (
            <GlassPill className="px-4 py-2 text-sm">{data.caption}</GlassPill>
          )}
        </div>
      </Card>

      {lightbox !== null && (
        <Lightbox
          images={data.images}
          index={lightbox}
          caption={data.caption}
          onIndexChange={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
