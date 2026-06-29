"use client";

import { useState, useRef } from "react";
import type { ImageAsset } from "@portfolio/schema";
import { FadeImage } from "@/components/ui/FadeImage";
import { Lightbox } from "@/components/project/Lightbox";

export function MobileProjectGrid({ images }: { images: ImageAsset[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [hiddenIndex, setHiddenIndex] = useState<number | null>(null);
  // Ref points to the image wrapper div (not the outer button) so the
  // FLIP origin rect matches the image, not the image + label combined.
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  const open = (i: number) => {
    setOriginRect(imgRefs.current[i]?.getBoundingClientRect() ?? null);
    setLightboxIndex(i);
  };

  const handleIndexChange = (i: number) => {
    setLightboxIndex(i);
    setOriginRect(imgRefs.current[i]?.getBoundingClientRect() ?? null);
    setHiddenIndex((prev) => (prev !== null ? i : null));
  };

  const handleClose = () => {
    setLightboxIndex(null);
    setHiddenIndex(null);
  };

  // Assign images left-to-right: even indices → left column, odd → right column.
  // Each column is a flex column so images stack at natural height (masonry).
  const left = images.map((img, i) => ({ img, i })).filter(({ i }) => i % 2 === 0);
  const right = images.map((img, i) => ({ img, i })).filter(({ i }) => i % 2 === 1);

  const renderBtn = ({ img, i }: { img: ImageAsset; i: number }) => (
    <button
      key={i}
      onPointerDown={() => { new window.Image().src = img.src; }}
      onClick={() => open(i)}
      className="block w-full cursor-pointer text-left"
    >
      <div
        ref={(el) => { imgRefs.current[i] = el; }}
        className="overflow-hidden rounded-[14px]"
        style={{ opacity: hiddenIndex === i ? 0 : 1 }}
      >
        <FadeImage
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          sizes="50vw"
          className="w-full h-auto"
        />
      </div>
    </button>
  );

  return (
    <>
      <div className="flex gap-[10px] p-[10px] items-start">
        <div className="flex-1 flex flex-col gap-[10px]">{left.map(renderBtn)}</div>
        <div className="flex-1 flex flex-col gap-[10px]">{right.map(renderBtn)}</div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          originRect={originRect}
          onIndexChange={handleIndexChange}
          onExpand={() => setHiddenIndex(lightboxIndex)}
          onClose={handleClose}
        />
      )}
    </>
  );
}
