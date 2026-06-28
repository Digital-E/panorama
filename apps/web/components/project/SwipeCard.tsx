"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { z } from "zod";
import type { MediaSwipeBlockSchema } from "@portfolio/schema";
import { Lightbox } from "./Lightbox";

type Data = z.infer<typeof MediaSwipeBlockSchema>["data"];

const THRESHOLD = 80;
const RADIUS = "var(--radius-card)";
const FLY = 320;
const SNAP = 300;

// Scale-based depth: the image crop stays identical at every depth level because
// scale is uniform. Only the bottom peek (ty) and side margin (via scale) change.
//
// peek below stage ≈ ty − W*(1−scale)/2   (W ≈ 380px on mobile)
//   depth-1 ≈ 16.8 px
//   depth-2 ≈ 10.8 px strip below depth-1
//   depth-3 (ghost) ≈ further behind, opacity:0 at rest
const DEPTH = [
  { ty: 0,  scale: 1    },
  { ty: 32, scale: 0.92 },
  { ty: 58, scale: 0.84 },
  { ty: 80, scale: 0.76 }, // ghost — invisible at rest, fades in during swipe
] as const;

type DepthEntry = (typeof DEPTH)[number];

function depthTransform({ ty, scale }: DepthEntry) {
  if (ty === 0 && scale === 1) return undefined;
  return `translateY(${ty}px) scale(${scale})`;
}

export function SwipeCard({ data }: { data: Data }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  // [depth-1, depth-2, ghost(depth-3)]
  const behindRefs = useRef<Array<HTMLDivElement | null>>([null, null, null]);
  const drag = useRef({ active: false, decided: false, horizontal: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });
  const animating = useRef(false);
  const snapTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const n = data.images.length;

  // Number of "real" visible stack cards (max 3).
  const stackSize = Math.min(3, n);
  // Render one extra ghost card whenever swiping is possible so it can fade in
  // during the swipe before it promotes to the real depth-2 slot.
  const renderCount = n >= 2 ? Math.min(stackSize + 1, DEPTH.length) : stackSize;

  const cards = Array.from({ length: renderCount }, (_, depth) => {
    const pos = current + depth;
    return { depth, pos, image: data.images[pos % n] };
  });

  // Drive all behind cards (including ghost) toward their promoted positions.
  // progress=0 → resting, progress=1 → fully promoted.
  // The ghost card additionally fades its opacity 0→1 with progress.
  function driveBehind(progress: number, transitionMs?: number) {
    for (let d = 1; d < renderCount; d++) {
      const el = behindRefs.current[d - 1];
      if (!el) continue;
      const isGhost = d >= stackSize;
      if (transitionMs !== undefined) {
        el.style.transition = isGhost
          ? `transform ${transitionMs}ms ease, opacity ${transitionMs}ms ease`
          : `transform ${transitionMs}ms ease`;
      }
      const from = DEPTH[d];
      const to = DEPTH[d - 1];
      const ty = from.ty + (to.ty - from.ty) * progress;
      const sc = from.scale + (to.scale - from.scale) * progress;
      el.style.transform = ty < 0.5 && sc > 0.999 ? "" : `translateY(${ty}px) scale(${sc})`;
      if (isGhost) el.style.opacity = String(progress);
    }
  }

  function clearBehindTransitions() {
    for (const el of behindRefs.current) {
      if (el) el.style.transition = "";
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (animating.current || n < 2) return;
    clearTimeout(snapTimeout.current);
    // Don't capture yet — wait for direction decision in onPointerMove so that
    // vertical scrolls are never hijacked.
    drag.current = { active: true, decided: false, horizontal: false, startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d.active) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    // Wait until the finger has moved enough to know intent.
    if (!d.decided) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.decided = true;
      d.horizontal = Math.abs(dx) >= Math.abs(dy);
      if (d.horizontal) {
        // Lock pointer so swipe isn't lost if the finger leaves the element.
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        if (topRef.current) topRef.current.style.transition = "none";
        for (const el of behindRefs.current) {
          if (el) el.style.transition = "none";
        }
      } else {
        // Vertical — hand back to the browser for page scroll.
        d.active = false;
        return;
      }
    }

    if (!d.horizontal) return;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    if (topRef.current) {
      topRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.06}deg)`;
    }
    driveBehind(Math.min(1, Math.abs(dx) / THRESHOLD));
  }

  function onPointerUp() {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (!drag.current.horizontal) return;
    const dx = drag.current.lastX - drag.current.startX;
    const dy = drag.current.lastY - drag.current.startY;
    const top = topRef.current;

    if (Math.abs(dx) > THRESHOLD) {
      const dir = Math.sign(dx);
      animating.current = true;
      if (top) {
        top.style.transition = `transform ${FLY}ms ease-in`;
        top.style.transform = `translate(${dir * 110}vw, ${dy}px) rotate(${dir * 28}deg)`;
        // Drive all cards (including ghost) to their promoted positions in sync
        // with the fly. Ghost ends at opacity=1 and depth-2 position.
        driveBehind(1, FLY);
        top.addEventListener(
          "transitionend",
          () => {
            clearBehindTransitions();
            animating.current = false;
            // After re-render: old ghost (opacity=1) becomes the new depth-2 card.
            // New ghost (fresh element) starts at opacity=0 from its React style prop.
            setCurrent((c) => c + 1);
          },
          { once: true },
        );
      } else {
        clearBehindTransitions();
        animating.current = false;
        setCurrent((c) => c + 1);
      }
    } else if (top) {
      top.style.transition = `transform ${SNAP}ms cubic-bezier(0.32, 0.72, 0, 1)`;
      top.style.transform = "";
      // Ghost animates back to opacity=0 along with its position.
      driveBehind(0, SNAP);
      snapTimeout.current = setTimeout(() => {
        if (topRef.current) { topRef.current.style.transform = ""; topRef.current.style.transition = ""; }
        clearBehindTransitions();
      }, SNAP + 20);
    }
  }

  return (
    <>
      <div className="relative w-full select-none" style={{ paddingBottom: 36 }}>
        <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
          {cards
            .slice()
            .reverse()
            .map(({ depth, pos, image }) => {
              const d = DEPTH[depth];
              const isTop = depth === 0;
              const isGhost = depth >= stackSize;
              return (
                <div
                  key={pos}
                  ref={(el) => {
                    if (isTop) topRef.current = el;
                    else behindRefs.current[depth - 1] = el;
                  }}
                  className={`absolute inset-0 overflow-hidden bg-(--color-surface) ${
                    isTop ? "touch-pan-y cursor-grab active:cursor-grabbing" : ""
                  }`}
                  style={{
                    borderRadius: RADIUS,
                    transform: depthTransform(d),
                    transformOrigin: "50% 50%",
                    // Ghost starts invisible; its opacity is driven imperatively
                    // during the drag so it fades in linked to the swipe movement.
                    opacity: isGhost ? 0 : undefined,
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
                    onClick={isTop ? () => setLightbox(pos % n) : undefined}
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
          onIndexChange={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
