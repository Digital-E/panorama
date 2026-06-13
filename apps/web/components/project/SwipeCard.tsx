"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { z } from "zod";
import type { MediaBlockSchema } from "@portfolio/schema";
import { Lightbox } from "./Lightbox";

type Data = z.infer<typeof MediaBlockSchema>["data"];

const THRESHOLD = 80;
const RADIUS = "var(--radius-card)";

// Visual offset per stack depth (0 = front). Behind cards sit lower and
// narrower so their bottom edge peeks below the front card.
const DEPTH = [
  { top: 0, side: "0%" },
  { top: 8, side: "4%" },
  { top: 16, side: "8%" },
];

export function SwipeCard({ data }: { data: Data }) {
  // `current` is absolute (ever-increasing) so each card has a unique key and
  // a swiped card unmounts cleanly rather than swapping its image source.
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });
  const animating = useRef(false);
  const n = data.images.length;

  const visible = Math.min(3, n);
  const cards = Array.from({ length: visible }, (_, depth) => {
    const pos = current + depth;
    return { depth, pos, image: data.images[pos % n] };
  });

  function onPointerDown(e: React.PointerEvent) {
    if (animating.current || n < 2) return;
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (topRef.current) topRef.current.style.transition = "none";
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (topRef.current) {
      topRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.06}deg)`;
    }
  }

  function onPointerUp() {
    if (!drag.current.active) return;
    drag.current.active = false;
    const dx = drag.current.lastX - drag.current.startX;
    const dy = drag.current.lastY - drag.current.startY;
    const top = topRef.current;

    if (Math.abs(dx) > THRESHOLD) {
      const dir = Math.sign(dx);
      animating.current = true;
      if (top) {
        top.style.transition = "transform 320ms ease-in";
        top.style.transform = `translate(${dir * 110}vw, ${dy}px) rotate(${dir * 28}deg)`;
        top.addEventListener(
          "transitionend",
          () => {
            animating.current = false;
            // The flown card unmounts (its key leaves the window); the card
            // beneath promotes to the front. No image swap, so no flash.
            setCurrent((c) => c + 1);
          },
          { once: true },
        );
      } else {
        animating.current = false;
        setCurrent((c) => c + 1);
      }
    } else if (top) {
      top.style.transition = "transform 400ms cubic-bezier(0.32, 0.72, 0, 1)";
      top.style.transform = "";
    }
  }

  return (
    <>
      <div className="relative w-full select-none" style={{ paddingBottom: 20 }}>
        <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
          {cards
            .slice()
            .reverse() /* render back-to-front so DOM order matches stacking */
            .map(({ depth, pos, image }) => {
              const d = DEPTH[depth];
              const isTop = depth === 0;
              return (
                <div
                  key={pos}
                  ref={isTop ? topRef : undefined}
                  className={`swipe-card absolute overflow-hidden bg-(--color-surface) ${
                    isTop ? "touch-none cursor-grab active:cursor-grabbing" : ""
                  }`}
                  style={{
                    borderRadius: RADIUS,
                    top: d.top,
                    left: d.side,
                    right: d.side,
                    height: "100%",
                    zIndex: 3 - depth,
                  }}
                  onPointerDown={isTop ? onPointerDown : undefined}
                  onPointerMove={isTop ? onPointerMove : undefined}
                  onPointerUp={isTop ? onPointerUp : undefined}
                  onPointerCancel={isTop ? onPointerUp : undefined}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    draggable={false}
                    sizes="(min-width: 600px) 600px, 100vw"
                    className="object-cover"
                    priority={isTop}
                  />
                  <button
                    onClick={() => setLightbox(pos % n)}
                    aria-label="View all images"
                    className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              );
            })}
        </div>
      </div>

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
