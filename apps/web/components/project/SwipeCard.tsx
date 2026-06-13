"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { z } from "zod";
import type { MediaBlockSchema } from "@portfolio/schema";
import { Lightbox } from "./Lightbox";

type Data = z.infer<typeof MediaBlockSchema>["data"];

const THRESHOLD = 80;
const RADIUS = "var(--radius-card)";

export function SwipeCard({ data }: { data: Data }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });
  const n = data.images.length;

  function img(offset: number) {
    return data.images[(current + offset) % n];
  }

  function onPointerDown(e: React.PointerEvent) {
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
      if (top) {
        top.style.transition = "transform 320ms ease-in";
        top.style.transform = `translate(${dir * 110}vw, ${dy}px) rotate(${dir * 28}deg)`;
      }
      setTimeout(() => {
        if (top) top.style.transition = "none";
        // Keep card off-screen while React swaps the image, then snap to center.
        flushSync(() => setCurrent(c => (c + 1) % n));
        if (top) { void top.offsetWidth; top.style.transform = ""; }
      }, 320);
    } else {
      if (top) {
        top.style.transition = "transform 400ms cubic-bezier(0.32, 0.72, 0, 1)";
        top.style.transform = "";
      }
    }
  }

  return (
    <>
      {/*
        Outer wrapper: padding-bottom creates visible space for the behind
        cards that extend past the inner square's bottom edge.
      */}
      <div className="relative w-full select-none" style={{ paddingBottom: 20 }}>
        {/* Inner square — sets card height, behind cards overflow below it */}
        <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>

          {/* Bottom card: 16px down, 8% narrower each side */}
          {n > 2 && (
            <div className="absolute overflow-hidden bg-(--color-surface)" style={{
              borderRadius: RADIUS,
              top: 16, left: "8%", right: "8%", height: "100%",
              zIndex: 1,
            }}>
              <Image src={img(2).src} alt={img(2).alt} fill draggable={false}
                sizes="(min-width: 600px) 480px, 80vw" className="object-cover" />
            </div>
          )}

          {/* Middle card: 8px down, 4% narrower each side */}
          {n > 1 && (
            <div className="absolute overflow-hidden bg-(--color-surface)" style={{
              borderRadius: RADIUS,
              top: 8, left: "4%", right: "4%", height: "100%",
              zIndex: 2,
            }}>
              <Image src={img(1).src} alt={img(1).alt} fill draggable={false}
                sizes="(min-width: 600px) 540px, 90vw" className="object-cover" />
            </div>
          )}

          {/* Top card — draggable */}
          <div
            ref={topRef}
            className="absolute overflow-hidden bg-(--color-surface) touch-none cursor-grab active:cursor-grabbing"
            style={{ borderRadius: RADIUS, inset: 0, zIndex: 3 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <Image src={img(0).src} alt={img(0).alt} fill draggable={false}
              sizes="(min-width: 600px) 600px, 100vw" className="object-cover" priority />

            <button
              onClick={() => setLightbox(current)}
              aria-label="View all images"
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

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
