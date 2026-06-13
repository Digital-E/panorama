"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { z } from "zod";
import type { MediaBlockSchema } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";
import { GlassPill } from "@/components/ui/GlassPill";

type Data = z.infer<typeof MediaBlockSchema>["data"];

// Swiper's default transition speed; the reference slider leaves it untouched.
const SPEED = 300;

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning).
const useIsoLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The creative-effect transform for a slide whose continuous offset from the
 * active slide is `d` (0 = front). Mirrors Swiper's `creativeEffect`:
 *   next: translate ["100%", 0, 0]  scale 0.9
 *   prev: translate ["-100%", 0, -100]  scale 0.9  + shadow
 * `d` is fractional during a drag so slides interpolate 1:1 with the finger.
 */
function styleFor(d: number) {
  const cd = Math.max(-1, Math.min(1, d)); // limitProgress: 1 — neighbours only
  const a = Math.abs(cd);
  const translateZ = cd < 0 ? -100 * a : 0;
  const transform = `translateX(${cd * 100}%) translateZ(${translateZ}px) scale(${1 - 0.1 * a})`;
  const zIndex = Math.round(20 + cd * 5); // incoming (next side) rides over the outgoing prev
  const shadow = cd < 0 ? 0.45 * a : 0;
  return { transform, zIndex, shadow };
}

/**
 * Replicates intmagic.com's `gallery-item-slider` — a Swiper "creative" slider.
 * It shows one image at a time. Navigate by dragging/swiping, or by clicking:
 * the right half advances, the left half goes back (or advances when already on
 * the first slide). Slides push with the creative effect — the outgoing slide
 * scales to 0.9, shifts to -100% and is shadowed/pushed back, while the incoming
 * slide arrives from +100%. Small, clickable, dynamic bullets sit bottom-left.
 */
export function MediaCarousel({ data }: { data: Data }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef({ active: false, startX: 0, dx: 0, moved: false, suppressClick: false });
  const mounted = useRef(false);
  const n = data.images.length;
  const many = n > 1;

  // Apply the creative transforms to every slide given a drag fraction `t`.
  // `animate` toggles the 300ms transition (off while finger-tracking).
  const paint = useCallback(
    (t: number, animate: boolean) => {
      const dur = animate ? `${SPEED}ms ease` : "none";
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const { transform, zIndex, shadow } = styleFor(i - active + t);
        el.style.transition = `transform ${dur}`;
        el.style.transform = transform;
        el.style.zIndex = String(zIndex);
        const sh = shadowRefs.current[i];
        if (sh) {
          sh.style.transition = `opacity ${dur}`;
          sh.style.opacity = String(shadow);
        }
      });
    },
    [active],
  );

  // Position on mount (no animation), then settle to rest whenever active changes.
  useIsoLayout(() => {
    paint(0, mounted.current);
    mounted.current = true;
  }, [paint]);

  function onPointerDown(e: React.PointerEvent) {
    if (!many) return;
    drag.current = { active: true, startX: e.clientX, dx: 0, moved: false, suppressClick: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    paint(0, false); // kill transitions for 1:1 tracking
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d.active) return;
    const width = trackRef.current?.clientWidth ?? 1;
    d.dx = e.clientX - d.startX;
    if (Math.abs(d.dx) > 6) d.moved = true;
    paint(Math.max(-1, Math.min(1, d.dx / width)), false);
  }

  function onPointerUp() {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    d.suppressClick = d.moved; // a real drag shouldn't also fire click-navigation
    const width = trackRef.current?.clientWidth ?? 1;
    const threshold = Math.min(120, width * 0.25);
    if (d.dx <= -threshold && active < n - 1) setActive(active + 1);
    else if (d.dx >= threshold && active > 0) setActive(active - 1);
    else paint(0, true); // below threshold (or edge) — settle back
  }

  // Right half → next; left half → prev, advancing when already on the first slide.
  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!many) return;
    if (drag.current.suppressClick) {
      drag.current.suppressClick = false;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const rightHalf = e.clientX - rect.left > rect.width / 2;
    if (rightHalf) {
      if (active < n - 1) setActive(active + 1);
    } else {
      setActive(active === 0 ? Math.min(1, n - 1) : active - 1);
    }
  }

  return (
    <Card className="relative">
      <div
        ref={trackRef}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative aspect-square w-full touch-pan-y cursor-grab select-none active:cursor-grabbing"
        style={{ perspective: "1200px" }}
      >
        {data.images.map((image, i) => (
          <div
            key={image.src}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            aria-hidden={i !== active}
            className="absolute inset-0 overflow-hidden rounded-(--radius-card) will-change-transform"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              draggable={false}
              sizes="(min-width: 600px) 600px, 100vw"
              className="object-cover"
              priority={i === 0}
            />
            {/* Creative-effect shadow that rides the outgoing/prev slides. */}
            <div
              ref={(el) => {
                shadowRefs.current[i] = el;
              }}
              className="pointer-events-none absolute inset-0 bg-black opacity-0"
            />
          </div>
        ))}
      </div>

      {/* Bottom-left dynamic bullets (reference: bottom 1.25rem / left 1.5rem). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex items-center justify-between px-6">
        {many ? <Bullets n={n} active={active} onPick={setActive} /> : <span />}
        {data.caption && (
          <GlassPill className="px-4 py-2 text-sm">{data.caption}</GlassPill>
        )}
      </div>
    </Card>
  );
}

// One bullet slot: 0.3125rem dot + 0.1875rem gap = 0.5rem (Swiper's defaults).
const UNIT = 0.5;

/**
 * Swiper's `dynamicBullets`: the active dot is full size and its neighbours
 * shrink with distance; the strip slides so the active dot stays anchored near
 * the left edge once the set scrolls past the visible window.
 */
function Bullets({ n, active, onPick }: { n: number; active: number; onPick: (i: number) => void }) {
  const shift = Math.max(0, Math.min(active - 1, n - 3));
  return (
    <div className="pointer-events-auto relative h-2 overflow-hidden" style={{ width: "2.5rem" }}>
      <div
        className="absolute left-0 top-1/2 flex items-center"
        style={{ transform: `translate(${-shift * UNIT}rem, -50%)`, transition: `transform ${SPEED}ms ease` }}
      >
        {Array.from({ length: n }, (_, i) => {
          const d = Math.abs(i - active);
          const scale = d <= 1 ? 1 : d === 2 ? 0.66 : d === 3 ? 0.33 : 0;
          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onPick(i);
              }}
              aria-label={`Go to image ${i + 1}`}
              className="shrink-0 rounded-full bg-white"
              style={{
                width: "0.3125rem",
                height: "0.3125rem",
                marginRight: "0.1875rem",
                opacity: i === active ? 1 : 0.15,
                transform: `scale(${scale})`,
                transition: `transform ${SPEED}ms ease, opacity ${SPEED}ms ease`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
