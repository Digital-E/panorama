"use client";

import { useEffect, useRef, type ReactNode } from "react";

const EASING_IN = "cubic-bezier(0.16, 1, 0.3, 1)";  // spring — smooth settle
const EASING_OUT = "cubic-bezier(0.32, 0.72, 0, 1)"; // ease-in — snappy exit
const DURATION_IN = 650;
const DURATION_OUT = 380;
const DISMISS_DISTANCE = 0.35;
const DISMISS_VELOCITY = 0.4; // px/ms

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const drag = useRef({
    active: false,
    startY: 0,
    lastY: 0,
    lastTime: 0,
    velocity: 0,
  });

  const setOverlayOpacity = (opacity: number, easing?: string, duration?: number) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.style.transition = easing
      ? `opacity ${duration ?? DURATION_IN}ms ${easing}`
      : "none";
    overlay.style.opacity = String(Math.max(0, Math.min(1, opacity)));
  };

  const slideSheet = (toY: string | number, duration: number, easing: string) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const target = typeof toY === "number" ? `${toY}px` : toY;
    sheet.style.transition = `transform ${duration}ms ${easing}`;
    sheet.style.transform = `translateY(${target})`;
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    const sheet = sheetRef.current;
    if (!dialog || !sheet) return;

    if (open) {
      if (!dialog.open) dialog.showModal();

      sheet.style.transition = "none";
      sheet.style.transform = "translateY(100vh)";
      setOverlayOpacity(0);

      // getComputedStyle forces a synchronous style flush, committing the
      // initial off-screen position before we hand off to the next frame.
      getComputedStyle(sheet).transform;

      requestAnimationFrame(() => {
        slideSheet(0, DURATION_IN, EASING_IN);
        setOverlayOpacity(1, EASING_IN, DURATION_IN);
      });
    } else {
      slideSheet("100vh", DURATION_OUT, EASING_OUT);
      setOverlayOpacity(0, EASING_OUT, DURATION_OUT);
      const id = setTimeout(() => { if (dialog.open) dialog.close(); }, DURATION_OUT + 20);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const onDragStart = (e: React.PointerEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheet.style.transition = "none";
    setOverlayOpacity(1);
    drag.current = {
      active: true,
      startY: e.clientY,
      lastY: e.clientY,
      lastTime: Date.now(),
      velocity: 0,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const sheet = sheetRef.current;
    if (!d.active || !sheet) return;

    const now = Date.now();
    const dt = now - d.lastTime;
    if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastTime = now;

    const dy = Math.max(0, e.clientY - d.startY);
    sheet.style.transform = `translateY(${dy}px)`;

    const sheetH = sheet.offsetHeight;
    setOverlayOpacity(1 - (dy / (sheetH * DISMISS_DISTANCE)) * 0.7);
  };

  const onDragEnd = (e: React.PointerEvent) => {
    const d = drag.current;
    const sheet = sheetRef.current;
    if (!d.active || !sheet) return;
    d.active = false;

    const dy = Math.max(0, e.clientY - d.startY);
    const sheetH = sheet.offsetHeight;
    const shouldDismiss = dy > sheetH * DISMISS_DISTANCE || d.velocity > DISMISS_VELOCITY;

    if (shouldDismiss) {
      const remaining = Math.max(sheetH - dy, 80);
      const duration = Math.min(DURATION_OUT, Math.max(120, remaining / Math.max(d.velocity, 0.3)));
      slideSheet("100vh", duration, EASING_OUT);
      setOverlayOpacity(0, EASING_OUT, duration);
      setTimeout(() => onClose(), duration + 20);
    } else {
      slideSheet(0, DURATION_IN + 60, EASING_IN);
      setOverlayOpacity(1, EASING_IN, DURATION_IN);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={() => { if (open) onClose(); }}
      aria-label={title}
      className="fixed inset-0 m-0 h-full w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:hidden"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        style={{ opacity: 0 }}
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[85svh] w-full max-w-(--container-column) flex-col overflow-hidden rounded-t-(--radius-sheet) bg-surface"
        style={{ transform: "translateY(100vh)" }}
      >
        {/* Drag handle */}
        <div
          className="flex shrink-0 touch-none select-none justify-center pb-4 pt-3"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-1 w-24 cursor-grab rounded-full bg-ink active:cursor-grabbing"
          />
        </div>

        <div className="h-px shrink-0 bg-surface-edge" />

        <div className="min-h-0 overflow-y-auto px-6 pb-12 pt-8">
          <h2 className="text-2xl font-medium">{title}</h2>
          <div className="pt-6">{children}</div>
        </div>
      </div>
    </dialog>
  );
}
