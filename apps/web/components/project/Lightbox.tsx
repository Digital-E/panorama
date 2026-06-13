"use client";

import { useEffect, useRef } from "react";
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
  const dialogRef  = useRef<HTMLDialogElement>(null);
  const n    = images.length;
  const many = n > 1;

  // Current index tracked imperatively so animation closures are never stale.
  const idxRef      = useRef(index);
  const animating   = useRef(false);
  const frontIsA    = useRef(true); // which pane is currently visible

  // Two absolutely-positioned panes. One is always "front" (on screen),
  // one is "back" (hidden, used as staging area for the next image).
  const paneA = useRef<HTMLDivElement>(null);
  const paneB = useRef<HTMLDivElement>(null);
  const imgA  = useRef<HTMLImageElement>(null);
  const imgB  = useRef<HTMLImageElement>(null);

  const drag = useRef({ active: false, startX: 0, lastX: 0, staged: false, dir: 0 as 1 | -1 | 0 });

  function getFront() {
    return frontIsA.current
      ? { pane: paneA.current!, img: imgA.current! }
      : { pane: paneB.current!, img: imgB.current! };
  }
  function getBack() {
    return frontIsA.current
      ? { pane: paneB.current!, img: imgB.current! }
      : { pane: paneA.current!, img: imgA.current! };
  }

  useEffect(() => {
    dialogRef.current?.showModal();
    // Prime pane A with the opening image; hide pane B.
    const ia = imgA.current!;
    ia.src = images[index].src;
    ia.alt = images[index].alt;
    paneA.current!.style.zIndex     = "1";
    paneB.current!.style.zIndex     = "0";
    paneB.current!.style.visibility = "hidden";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft")  go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the next image into the back pane and position it off-screen.
  // Returns the new index.
  function stageBack(dir: 1 | -1): number {
    const newIdx = (idxRef.current + dir + n) % n;
    const b = getBack();
    b.img.src = images[newIdx].src;
    b.img.alt = images[newIdx].alt;
    b.pane.style.transition  = "none";
    b.pane.style.transform   = dir === 1 ? "translateX(100%)" : "translateX(-100%)";
    b.pane.style.visibility  = "visible";
    b.pane.style.zIndex      = "0";
    getFront().pane.style.zIndex = "1";
    void b.pane.offsetWidth; // commit off-screen position before transition
    return newIdx;
  }

  function finishSwap(newIdx: number) {
    const f = getFront();
    const b = getBack();
    f.pane.style.visibility = "hidden";
    f.pane.style.transition = "none";
    f.pane.style.transform  = "translateX(0)";
    frontIsA.current = !frontIsA.current;
    // New front gets higher z-index.
    getFront().pane.style.zIndex = "1";
    getBack().pane.style.zIndex  = "0";
    idxRef.current  = newIdx;
    animating.current = false;
    onIndexChange(newIdx);
  }

  function go(dir: 1 | -1) {
    if (animating.current || !many) return;
    animating.current = true;
    const newIdx = stageBack(dir);
    const f = getFront();
    const b = getBack();

    f.pane.style.transition = `transform ${DURATION}ms ease`;
    f.pane.style.transform  = dir === 1 ? "translateX(-100%)" : "translateX(100%)";
    b.pane.style.transition = `transform ${DURATION}ms ease`;
    b.pane.style.transform  = "translateX(0)";

    b.pane.addEventListener("transitionend", function done() {
      b.pane.removeEventListener("transitionend", done);
      finishSwap(newIdx);
    }, { once: true });
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!many || animating.current) return;
    drag.current = { active: true, startX: e.clientX, lastX: e.clientX, staged: false, dir: 0 };
    getFront().pane.style.transition = "none";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    d.lastX = e.clientX;
    const dx = e.clientX - d.startX;

    if (!d.staged && Math.abs(dx) > 8) {
      d.dir    = dx < 0 ? 1 : -1;
      d.staged = true;
      stageBack(d.dir);
    }
    if (!d.staged) return;

    const vw = window.innerWidth;
    getFront().pane.style.transform = `translateX(${dx}px)`;
    getBack().pane.style.transition = "none";
    getBack().pane.style.transform  = `translateX(${d.dir === 1 ? vw + dx : -vw + dx}px)`;
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const dx = d.lastX - d.startX;

    if (d.staged && Math.abs(dx) > 50) {
      animating.current = true;
      const newIdx = (idxRef.current + d.dir + n) % n;
      const f = getFront();
      const b = getBack();
      f.pane.style.transition = `transform ${DURATION}ms ease`;
      f.pane.style.transform  = d.dir === 1 ? "translateX(-100%)" : "translateX(100%)";
      b.pane.style.transition = `transform ${DURATION}ms ease`;
      b.pane.style.transform  = "translateX(0)";
      b.pane.addEventListener("transitionend", function done() {
        b.pane.removeEventListener("transitionend", done);
        finishSwap(newIdx);
      }, { once: true });
    } else {
      const f = getFront();
      f.pane.style.transition = `transform ${DURATION}ms ease`;
      f.pane.style.transform  = "translateX(0)";
      if (d.staged) {
        getBack().pane.style.visibility = "hidden";
      }
    }
  };

  const btn = "flex h-12 w-12 items-center justify-center rounded-full bg-glass backdrop-blur-md";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label="Image viewer"
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-2xl"
    >
      {/* Visual clip zone — pointer-events-none so clicks reach the bars below */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
        <div ref={paneA} className="absolute inset-0 flex items-center justify-center px-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgA} alt="" className="max-h-full w-full max-w-(--container-column) rounded-(--radius-card) object-contain" />
        </div>
        <div ref={paneB} className="absolute inset-0 flex items-center justify-center px-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgB} alt="" className="max-h-full w-full max-w-(--container-column) rounded-(--radius-card) object-contain" />
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
        {caption
          ? <GlassPill className="px-5 py-3">{caption}</GlassPill>
          : <span />}
        <button onClick={onClose} aria-label="Close" className={btn}>
          <Cross />
        </button>
      </div>

      {/* Bottom bar: counter left, arrows right */}
      <div
        className="fixed bottom-4 flex items-center justify-between"
        style={{ left: "50%", transform: "translateX(-50%)", width: "calc(100% - 1.5rem)", maxWidth: "var(--container-column)" }}
      >
        {many
          ? <GlassPill className="px-4 py-3 tabular-nums">{index + 1} / {n}</GlassPill>
          : <span />}
        {many && (
          <div className="flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous image" className={btn}><Chevron flip /></button>
            <button onClick={() => go(1)}  aria-label="Next image"      className={btn}><Chevron /></button>
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
