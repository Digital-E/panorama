"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ImageAsset } from "@portfolio/schema";
import { GlassPill } from "@/components/ui/GlassPill";

const DURATION = 320;

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, lastX: 0, moved: false });
  const animating = useRef(false);
  const n = images.length;
  const many = n > 1;

  // The real image on screen (drives the counter). Seeded once from the prop;
  // afterwards the viewer owns its position so it can loop past the ends.
  const [current, setCurrent] = useState(index);

  // To loop seamlessly the track carries a clone of the last image before the
  // first and a clone of the first after the last:
  //   [ lastⁿ⁻¹ | 0 | 1 | … | n-1 | 0¹ ]
  // Real image i therefore lives at slot i+1. Crossing onto a clone animates
  // normally, then we snap (no transition) to the matching real slot — same
  // pixels, so the jump is invisible.
  const slides = many ? [images[n - 1], ...images, images[0]] : images;
  const slotRef = useRef(many ? index + 1 : 0);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Commit the opening position before the first paint — no transition, so the
  // viewer never flashes slot 0.
  useLayoutEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    t.style.transition = "none";
    t.style.transform = `translate3d(${-slotRef.current * 100}vw, 0, 0)`;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function go(dir: 1 | -1) {
    const t = trackRef.current;
    if (!t || !many || animating.current) return;
    animating.current = true;

    const targetSlot = slotRef.current + dir;
    const newReal = (current + dir + n) % n;

    t.style.transition = `transform ${DURATION}ms ease`;
    t.style.transform = `translate3d(${-targetSlot * 100}vw, 0, 0)`;

    // transitionend won't fire if the position didn't actually change (e.g. a
    // drag released exactly on the target), so a timeout backstops it.
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(fallback);
      t.removeEventListener("transitionend", done);
      // If we landed on a clone, snap to the equivalent real slot instantly.
      let normalized = targetSlot;
      if (targetSlot === n + 1) normalized = 1;
      else if (targetSlot === 0) normalized = n;
      if (normalized !== targetSlot) {
        t.style.transition = "none";
        t.style.transform = `translate3d(${-normalized * 100}vw, 0, 0)`;
        void t.offsetWidth;
      }
      slotRef.current = normalized;
      animating.current = false;
    };
    const fallback = setTimeout(done, DURATION + 60);
    t.addEventListener("transitionend", done);

    setCurrent(newReal);
    onIndexChange(newReal);
  }

  // Animate back to the resting slot (drag released below threshold).
  function settle() {
    const t = trackRef.current;
    if (!t) return;
    t.style.transition = `transform ${DURATION}ms ease`;
    t.style.transform = `translate3d(${-slotRef.current * 100}vw, 0, 0)`;
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!many || animating.current) return;
    const t = trackRef.current;
    if (t) t.style.transition = "none";
    drag.current = { active: true, startX: e.clientX, lastX: e.clientX, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    d.lastX = e.clientX;
    const vw = window.innerWidth;
    let dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    // Page-bounded: one gesture reveals at most the neighbouring clone/slide.
    dx = Math.max(-vw, Math.min(vw, dx));
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(calc(${-slotRef.current * 100}vw + ${dx}px), 0, 0)`;
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const dx = d.lastX - d.startX;
    const threshold = window.innerWidth * 0.2;
    if (dx <= -threshold) go(1);
    else if (dx >= threshold) go(-1);
    else settle();
  };

  const btn = "flex h-12 w-12 items-center justify-center rounded-full bg-glass backdrop-blur-md";
  const restSlot = many ? current + 1 : 0;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label="Image viewer"
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-2xl"
    >
      {/* Visual clip zone — pointer-events-none so clicks reach the bars below */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
        <div ref={trackRef} className="flex h-full will-change-transform">
          {slides.map((im, slot) => (
            <div key={slot} className="flex h-full w-screen shrink-0 items-center justify-center px-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={im.src}
                alt={im.alt}
                loading={Math.abs(slot - restSlot) <= 1 || slot === 0 || slot === slides.length - 1 ? "eager" : "lazy"}
                draggable={false}
                className="max-h-full w-full max-w-(--container-column) rounded-(--radius-card) object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Swipe capture zone — image area only, between both bars */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute inset-x-0 touch-none"
        style={{ top: "5.5rem", bottom: "5.5rem" }}
      />

      {/* Top bar: caption left, close right */}
      <div
        className="fixed top-4 flex items-center justify-between"
        style={{ left: "50%", transform: "translateX(-50%)", width: "calc(100% - 1.5rem)", maxWidth: "var(--container-column)" }}
      >
        {caption ? <GlassPill className="px-5 py-3">{caption}</GlassPill> : <span />}
        <button onClick={onClose} aria-label="Close" className={btn}>
          <Cross />
        </button>
      </div>

      {/* Bottom bar: counter left, arrows right */}
      <div
        className="fixed bottom-4 flex items-center justify-between"
        style={{ left: "50%", transform: "translateX(-50%)", width: "calc(100% - 1.5rem)", maxWidth: "var(--container-column)" }}
      >
        {many ? <GlassPill className="px-4 py-3 tabular-nums">{current + 1} / {n}</GlassPill> : <span />}
        {many && (
          <div className="flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous image" className={btn}><Chevron flip /></button>
            <button onClick={() => go(1)} aria-label="Next image" className={btn}><Chevron /></button>
          </div>
        )}
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
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden
      style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M6.5 3.5L12 9l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
