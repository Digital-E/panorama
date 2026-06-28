"use client";

import { useState, useRef } from "react";
import type { ImageAsset } from "@portfolio/schema";
import { FadeImage } from "@/components/ui/FadeImage";
import { Lightbox } from "@/components/project/Lightbox";

export function MobileProjectGrid({ images }: { images: ImageAsset[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [hiddenIndex, setHiddenIndex] = useState<number | null>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const open = (i: number) => {
    setOriginRect(btnRefs.current[i]?.getBoundingClientRect() ?? null);
    setLightboxIndex(i);
    setHiddenIndex(i);
  };

  const handleIndexChange = (i: number) => {
    setLightboxIndex(i);
    setOriginRect(btnRefs.current[i]?.getBoundingClientRect() ?? null);
    setHiddenIndex(i);
  };

  const handleClose = () => {
    setLightboxIndex(null);
    setHiddenIndex(null);
  };

  return (
    <>
      <div className="columns-2 gap-1 p-1">
        {images.map((image, i) => (
          <button
            key={i}
            ref={(el) => { btnRefs.current[i] = el; }}
            onClick={() => open(i)}
            className="block w-full break-inside-avoid mb-1 cursor-pointer"
            style={{ opacity: hiddenIndex === i ? 0 : 1 }}
          >
            <FadeImage
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="50vw"
              className="w-full h-auto"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          originRect={originRect}
          onIndexChange={handleIndexChange}
          onClose={handleClose}
        />
      )}
    </>
  );
}
