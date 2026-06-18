"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import type { ImageAsset } from "@portfolio/schema";
import { GlassPill } from "@/components/ui/GlassPill";

import "swiper/css";

const SPEED = 320;
const DISMISS_DY = 120; // px dragged past which a release closes
const DISMISS_VY = 0.5; // px/ms flick velocity that closes regardless of distance
const SETTLE = 260; // ms for the snap-back / fly-out animation

/**
 * Full-screen image viewer (Gallery frame). Horizontal swipes (Swiper) page
 * between images; a downward drag dismisses it Instagram-style — the image
 * follows the finger and scales down while the backdrop and chrome fade, and a
 * release past the threshold (or a quick flick) flies it out and closes.
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swiperRef = useRef<SwiperClass | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const n = images.length;
  const many = n > 1;
  const [current, setCurrent] = useState(index);
  const initial = useRef(index).current;

  // Destroying a looped Swiper emits a final slideChange; without this guard it
  // fires onIndexChange after close set the index to null and re-opens the viewer.
  const closing = useRef(false);
  const handleClose = () => {
    closing.current = true;
    onClose();
  };

  const drag = useRef({ active: false, decided: false, vertical: false, startX: 0, startY: 0, lastY: 0, lastT: 0, vy: 0 });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Lock the page behind the viewer (the backdrop hides any reflow); restore on close.
  useEffect(() => {
    const y = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.insetInline = "0";
    body.style.width = "100%";
    html.style.overscrollBehavior = "none"; // no pull-to-refresh on the down-drag
    html.style.touchAction = "none"; // disable browser touch panning page-wide
    return () => {
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      body.style.position = "";
      body.style.top = "";
      body.style.insetInline = "";
      body.style.width = "";
      html.style.overscrollBehavior = "";
      html.style.touchAction = "";
      window.scrollTo(0, y);
      html.style.scrollBehavior = prev;
    };
  }, []);

  // Kill iOS pull-to-refresh while the viewer is open. We must catch touchmove
  // in the CAPTURE phase (before the browser commits to the overscroll and
  // before Swiper can stopPropagation) and preventDefault it. Swiper drags via
  // pointer events, and so does our dismiss, so blocking touch scrolling here
  // breaks neither — it only stops the native scroll/refresh.
  useEffect(() => {
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false, capture: true });
    return () => document.removeEventListener("touchmove", prevent, { capture: true } as EventListenerOptions);
  }, []);

  // Map a drag distance to the live transform/opacities (1:1 with the finger).
  function paint(dy: number) {
    const d = Math.max(dy, 0);
    const p = Math.min(d / ((window.innerHeight || 800) * 0.45), 1);
    if (stageRef.current) stageRef.current.style.transform = `translateY(${d}px) scale(${1 - 0.16 * p})`;
    if (overlayRef.current) overlayRef.current.style.opacity = String(1 - 0.75 * p);
    if (chromeRef.current) chromeRef.current.style.opacity = String(1 - Math.min(p * 2, 1));
  }

  function setTransition(on: boolean) {
    if (stageRef.current) stageRef.current.style.transition = on ? `transform ${SETTLE}ms ease` : "none";
    if (overlayRef.current) overlayRef.current.style.transition = on ? `opacity ${SETTLE}ms ease` : "none";
    if (chromeRef.current) chromeRef.current.style.transition = on ? `opacity ${SETTLE}ms ease` : "none";
  }

  const onStageClick = (e: React.MouseEvent) => {
    if (!many || drag.current.decided) return;
    if (e.clientX > window.innerWidth / 2) {
      swiperRef.current?.slideNext();
    } else {
      swiperRef.current?.slidePrev();
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, decided: false, vertical: false, startX: e.clientX, startY: e.clientY, lastY: e.clientY, lastT: Date.now(), vy: 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    // First meaningful move decides: a downward, mostly-vertical drag is a
    // dismiss; anything else is left to Swiper (horizontal paging).
    if (!d.decided) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      d.decided = true;
      d.vertical = dy > 0 && Math.abs(dy) > Math.abs(dx);
      if (d.vertical) {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        if (swiperRef.current) swiperRef.current.allowTouchMove = false;
        setTransition(false);
      }
    }
    if (!d.vertical) return;

    const now = Date.now();
    const dt = now - d.lastT;
    if (dt > 0) d.vy = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = now;
    paint(dy);
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (swiperRef.current) swiperRef.current.allowTouchMove = true;
    if (!d.vertical) return;

    const dy = d.lastY - d.startY;
    setTransition(true);
    if (dy > DISMISS_DY || d.vy > DISMISS_VY) {
      const h = window.innerHeight || 800;
      if (stageRef.current) stageRef.current.style.transform = `translateY(${h}px) scale(0.8)`;
      if (overlayRef.current) overlayRef.current.style.opacity = "0";
      if (chromeRef.current) chromeRef.current.style.opacity = "0";
      setTimeout(handleClose, SETTLE - 40);
    } else {
      if (stageRef.current) stageRef.current.style.transform = "";
      if (overlayRef.current) overlayRef.current.style.opacity = "";
      if (chromeRef.current) chromeRef.current.style.opacity = "";
    }
  };

  const btn = "flex h-12 w-12 items-center justify-center rounded-full bg-glass backdrop-blur-md";
  const barStyle: React.CSSProperties = {
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 3rem)",
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      aria-label="Image viewer"
      className="fixed inset-x-0 top-0 bottom-auto m-0 h-[100dvh] w-full max-w-none bg-transparent p-0 backdrop:backdrop-blur-2xl"
    >
      {/* Dark layer (fades on dismiss). Blur lives on the dialog ::backdrop. */}
      <div ref={overlayRef} className="absolute inset-0 bg-black/70" />

      {/* Image stage — also the dismiss-drag surface. */}
      <div
        ref={stageRef}
        onClick={onStageClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // touch-action none: stop the browser handling vertical drags (Swiper's
        // default `pan-y` is what lets iOS pull-to-refresh fire). Swiper still
        // pages horizontally via JS; our handlers own the vertical dismiss.
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, touchAction: "none" }}
      >
        <Swiper
          modules={[Keyboard]}
          keyboard={{ enabled: true }}
          loop={many}
          initialSlide={initial}
          speed={SPEED}
          className="lightbox-swiper"
          style={{ position: "absolute", inset: 0 }}
          onSwiper={(s) => {
            swiperRef.current = s;
          }}
          onSlideChange={(s) => {
            if (closing.current) return;
            setCurrent(s.realIndex);
            onIndexChange(s.realIndex);
          }}
        >
          {images.map((im, i) => (
            <SwiperSlide key={i} className="lightbox-slide px-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={im.src}
                alt={im.alt}
                draggable={false}
                className="max-h-full w-full max-w-(--container-column) md:max-w-none rounded-(--radius-card) object-contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Chrome (bars) — fades with the dismiss drag; clicks pass through except on the bars. */}
      <div ref={chromeRef} className="pointer-events-none absolute inset-0 z-10">
        {/* Top bar: caption left, close right */}
        <div className="pointer-events-auto absolute top-4 flex items-center justify-between" style={barStyle}>
          {caption ? <GlassPill className="px-5 py-3">{caption}</GlassPill> : <span />}
          <button onClick={handleClose} aria-label="Close" className={btn}>
            <Cross />
          </button>
        </div>

        {/* Bottom bar: counter left, arrows right */}
        <div className="pointer-events-auto absolute bottom-4 flex items-center justify-between" style={barStyle}>
          {many ? <GlassPill className="px-4 py-3 tabular-nums">{current + 1} / {n}</GlassPill> : <span />}
          {many && (
            <div className="flex gap-2">
              <button onClick={() => swiperRef.current?.slidePrev()} aria-label="Previous image" className={btn}><Chevron flip /></button>
              <button onClick={() => swiperRef.current?.slideNext()} aria-label="Next image" className={btn}><Chevron /></button>
            </div>
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
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden
      style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M6.5 3.5L12 9l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
