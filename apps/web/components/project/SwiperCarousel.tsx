"use client";

import Image from "next/image";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCreative, Pagination } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import type { z } from "zod";
import type { MediaCarouselBlockSchema } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";
import { GlassPill } from "@/components/ui/GlassPill";

import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";

type Data = z.infer<typeof MediaCarouselBlockSchema>["data"];

// Swiper pagination variables, copied verbatim from the reference's dark theme.
const PAGINATION_VARS = {
  "--swiper-pagination-color": "#fff",
  "--swiper-pagination-bullet-inactive-color": "#fff",
  "--swiper-pagination-bullet-inactive-opacity": "0.15",
  "--swiper-pagination-bullet-size": "0.3125rem",
  "--swiper-pagination-bullet-horizontal-gap": "0.1875rem",
} as React.CSSProperties;

/**
 * The reference site's `gallery-item-slider`, reproduced 1:1 with Swiper.js —
 * the same `BaseSlider` config (creative effect, no loop, dynamic clickable
 * bullets) and the same click navigation: a mousemove records which half of the
 * slider the cursor is over, then a click advances (right half) or goes back
 * (left half — or advances when already on the first slide). Touch drag stays
 * enabled, exactly as on the reference.
 */
export function SwiperCarousel({ data }: { data: Data }) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const elRect = useRef<DOMRect | null>(null);
  const dir = useRef<"west" | "east" | null>(null);
  const many = data.images.length > 1;

  function onMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    elRect.current = e.currentTarget.getBoundingClientRect();
  }
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = elRect.current;
    if (!r) return;
    dir.current = e.pageX - r.x > r.width / 2 ? "west" : "east";
  }
  function onClick() {
    const s = swiperRef.current;
    if (!s || !many) return;
    if (dir.current === "west") s.slideNext();
    else if (dir.current === "east") s.isBeginning ? s.slideNext() : s.slidePrev();
  }

  return (
    <Card className="relative aspect-square w-full">
      <Swiper
        modules={[EffectCreative, Pagination]}
        loop={false}
        effect="creative"
        pagination={{ clickable: true, dynamicBullets: true }}
        creativeEffect={{
          prev: { shadow: true, translate: ["-100%", 0, -100], scale: 0.9, opacity: 0.3 },
          next: { translate: ["100%", 0, 0], scale: 0.9, opacity: 0.3 },
        }}
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onClick={onClick}
        className="ref-slider h-full w-full cursor-pointer"
        style={PAGINATION_VARS}
      >
        {data.images.map((image, i) => (
          <SwiperSlide key={image.src}>
            <div className="relative h-full w-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                draggable={false}
                sizes="(min-width: 600px) 600px, 100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {data.caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-end px-6">
          <GlassPill className="px-4 py-2 text-sm">{data.caption}</GlassPill>
        </div>
      )}
    </Card>
  );
}
