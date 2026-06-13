"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Tweak these to adjust feel
const DURATION_IN  = 500; // ms — sheet slide up
const DURATION_OUT = 320; // ms — sheet slide down

const DISMISS_DISTANCE = 0.35;
const DISMISS_VELOCITY = 0.4;

const KEYFRAMES_IN  = [{ transform: "translate3d(0,100%,0)" }, { transform: "translateZ(0)" }];
const KEYFRAMES_OUT = [{ transform: "translateZ(0)" }, { transform: "translate3d(0,100%,0)" }];
const FADE_IN       = [{ opacity: "0" }, { opacity: "1" }];
const FADE_OUT      = [{ opacity: "1" }, { opacity: "0" }];

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
  const dialogRef  = useRef<HTMLDialogElement>(null);
  const sheetRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Track running Web Animations so we can cancel them before starting new ones.
  const sheetAnim   = useRef<Animation | undefined>(undefined);
  const overlayAnim = useRef<Animation | undefined>(undefined);

  const dragDismissed = useRef(false);
  const snapTimeout   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef({ active: false, startY: 0, lastY: 0, lastTime: 0, velocity: 0 });

  useEffect(() => {
    const dialog  = dialogRef.current;
    const sheet   = sheetRef.current;
    const overlay = overlayRef.current;
    if (!dialog || !sheet) return;

    if (open) {
      // Cancel any running leave animation and clear drag inline styles.
      clearTimeout(snapTimeout.current);
      sheetAnim.current?.cancel();
      overlayAnim.current?.cancel();
      sheet.style.transform = "";
      sheet.style.transition = "";
      if (overlay) { overlay.style.opacity = ""; overlay.style.transition = ""; }

      if (!dialog.open) dialog.showModal();

      // Web Animations API starts immediately — no React re-render race.
      sheetAnim.current = sheet.animate(KEYFRAMES_IN, {
        duration: DURATION_IN,
        easing: "ease",
        fill: "none",
      });
      if (overlay) {
        overlayAnim.current = overlay.animate(FADE_IN, {
          duration: DURATION_IN,
          easing: "ease",
          fill: "none",
        });
      }
    } else if (dialog.open) {
      if (dragDismissed.current) {
        dragDismissed.current = false;
        const id = setTimeout(() => { if (dialog.open) dialog.close(); }, DURATION_OUT + 20);
        return () => clearTimeout(id);
      }

      clearTimeout(snapTimeout.current);
      sheetAnim.current?.cancel();
      overlayAnim.current?.cancel();
      sheet.style.transform = "";
      sheet.style.transition = "";
      if (overlay) { overlay.style.opacity = ""; overlay.style.transition = ""; }

      sheetAnim.current = sheet.animate(KEYFRAMES_OUT, {
        duration: DURATION_OUT,
        easing: "ease-in",
        fill: "forwards",
      });
      if (overlay) {
        overlayAnim.current = overlay.animate(FADE_OUT, {
          duration: DURATION_OUT,
          easing: "ease",
          fill: "forwards",
        });
      }

      sheetAnim.current.onfinish = () => {
        sheetAnim.current?.cancel();
        overlayAnim.current?.cancel();
        sheetAnim.current = undefined;
        overlayAnim.current = undefined;
        if (dialog.open) dialog.close();
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const onDragStart = (e: React.PointerEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    clearTimeout(snapTimeout.current);
    // Pause/cancel the enter animation so drag inline style takes over.
    sheetAnim.current?.cancel();
    sheetAnim.current = undefined;
    overlayAnim.current?.cancel();
    overlayAnim.current = undefined;
    sheet.style.transition = "none";
    const overlay = overlayRef.current;
    if (overlay) overlay.style.transition = "none";
    drag.current = { active: true, startY: e.clientY, lastY: e.clientY, lastTime: Date.now(), velocity: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const sheet = sheetRef.current;
    const overlay = overlayRef.current;
    if (!d.active || !sheet) return;

    const now = Date.now();
    const dt = now - d.lastTime;
    if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastTime = now;

    const dy = Math.max(0, e.clientY - d.startY);
    sheet.style.transform = `translate3d(0,${dy}px,0)`;

    if (overlay) {
      const sheetH = sheet.offsetHeight;
      overlay.style.opacity = String(Math.max(0.1, 1 - (dy / (sheetH * DISMISS_DISTANCE)) * 0.7));
    }
  };

  const onDragEnd = (e: React.PointerEvent) => {
    const d = drag.current;
    const sheet = sheetRef.current;
    const overlay = overlayRef.current;
    if (!d.active || !sheet) return;
    d.active = false;

    const dy = Math.max(0, e.clientY - d.startY);
    const sheetH = sheet.offsetHeight;
    const shouldDismiss = dy > sheetH * DISMISS_DISTANCE || d.velocity > DISMISS_VELOCITY;

    if (shouldDismiss) {
      const remaining = Math.max(sheetH - dy, 80);
      const duration = Math.min(DURATION_OUT, Math.max(120, remaining / Math.max(d.velocity, 0.3)));
      sheet.style.transition = `transform ${duration}ms ease`;
      sheet.style.transform = "translate3d(0,100%,0)";
      if (overlay) {
        overlay.style.transition = `opacity ${duration}ms ease`;
        overlay.style.opacity = "0";
      }
      dragDismissed.current = true;
      setTimeout(() => onClose(), duration + 20);
    } else {
      const SNAP = 280;
      sheet.style.transition = `transform ${SNAP}ms ease`;
      sheet.style.transform = "translate3d(0,0,0)";
      if (overlay) {
        overlay.style.transition = `opacity ${SNAP}ms ease`;
        overlay.style.opacity = "1";
      }
      snapTimeout.current = setTimeout(() => {
        if (sheetRef.current)   { sheetRef.current.style.transform = "";   sheetRef.current.style.transition = ""; }
        if (overlayRef.current) { overlayRef.current.style.opacity = ""; overlayRef.current.style.transition = ""; }
      }, SNAP + 20);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={() => { if (open) onClose(); }}
      aria-label={title}
      className="fixed inset-0 m-0 h-full w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:hidden"
    >
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div
        ref={sheetRef}
        className="absolute inset-x-(--spacing-gutter) bottom-(--spacing-gutter) mx-auto flex max-h-[85svh] max-w-(--container-column) flex-col overflow-hidden rounded-(--radius-sheet) bg-surface"
      >
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
            className="h-1 w-24 cursor-grab rounded-full bg-[#ffffff26] active:cursor-grabbing"
          />
        </div>

        <div className="h-px shrink-0 bg-surface-edge" />

        <div className="min-h-0 overflow-y-auto px-6 pb-12 pt-8">
          <h2 className="text-lg font-medium">{title}</h2>
          <div className="pt-6">{children}</div>
        </div>
      </div>
    </dialog>
  );
}
