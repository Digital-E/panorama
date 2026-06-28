"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Tweak these to adjust feel
const DURATION_IN  = 320; // ms — sheet slide up
const DURATION_OUT = 220; // ms — sheet slide down

// iOS-style "presenting" effect — the page behind recedes while the sheet is up.
const PAGE_SCALE     = 0.95;
const PAGE_RADIUS    = "14px";
const PAGE_TRANSLATE = "14px"; // tuck the top edge down, like newer iOS
// Color behind the receding page. A touch darker than --color-canvas (#0C1013)
// so the recede gap reads at the sheet edges without a hard black strip.
const PAGE_RECEDE_VOID = "#070A0C";

// Set to false to drop the iOS-style page-recede effect behind the sheet.
const ENABLE_RECEDE = true;

const DISMISS_DISTANCE = 0.35;
const DISMISS_VELOCITY = 0.4;

// Fully off-screen: 100% of the sheet's height clears its body, +64px clears the
// bottom gutter and the home-indicator safe area so no sliver lingers at the edge.
const HIDDEN = "translate3d(0, calc(100% + 64px), 0)";

const KEYFRAMES_IN  = [{ transform: HIDDEN }, { transform: "translateZ(0)" }];
const KEYFRAMES_OUT = [{ transform: "translateZ(0)" }, { transform: HIDDEN }];
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

  // Scroll-lock: pin the body with `position: fixed` at the current offset so
  // the document can't scroll while the sheet is up (this also stops iOS from
  // yanking the page when showModal() runs). A modal <dialog> lives in the top
  // layer, so the recede transform applied here never affects the sheet/overlay.
  const lockedScrollY = useRef(0);

  const lockScroll = () => {
    lockedScrollY.current = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${lockedScrollY.current}px`;
    body.style.insetInline = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (!ENABLE_RECEDE) return;
    document.documentElement.style.background = PAGE_RECEDE_VOID;
    // Recede the page, anchored to the viewport centre (in the now-pinned body's
    // coordinates) so the scale reads correctly at any scroll offset.
    body.style.transformOrigin = `50% ${lockedScrollY.current + window.innerHeight / 2}px`;
    body.style.transition = `transform ${DURATION_IN}ms ease, border-radius ${DURATION_IN}ms ease`;
    body.style.transform = `translateY(${PAGE_TRANSLATE}) scale(${PAGE_SCALE})`;
    body.style.borderRadius = PAGE_RADIUS;
  };

  // Scale the page back up — called as the close starts so it animates in sync
  // with the sheet sliding away (the lock is released later, in unlockScroll).
  const scaleUp = () => {
    const body = document.body;
    if (body.style.position !== "fixed") return;
    body.style.transition = `transform ${DURATION_OUT}ms ease-in, border-radius ${DURATION_OUT}ms ease-in`;
    body.style.transform = "";
    body.style.borderRadius = "";
  };

  const unlockScroll = () => {
    const body = document.body;
    if (body.style.position !== "fixed") return; // already unlocked
    // The page sat pinned at scroll 0 while fixed, so restoring the offset is a
    // jump from the top — and `html { scroll-behavior: smooth }` would animate
    // it (a visible yank). Force the restore to be instant.
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    body.style.position = "";
    body.style.top = "";
    body.style.insetInline = "";
    body.style.width = "";
    body.style.overflow = "";
    body.style.transform = "";
    body.style.transformOrigin = "";
    body.style.borderRadius = "";
    body.style.transition = "";
    html.style.background = "";
    window.scrollTo(0, lockedScrollY.current);
    html.style.scrollBehavior = prevBehavior;
  };

  // Safety net: never leave the body locked if the sheet unmounts while open.
  useEffect(() => unlockScroll, []);

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

      if (!dialog.open) {
        lockScroll();
        // showModal() auto-focuses the first focusable element — our sheet is at
        // the *bottom* of the viewport, so focusing its close button makes iOS
        // scroll it into view. At scrollY 0 the URL bar is expanded and the sheet
        // is below the fold, so Safari collapses the bar to reveal it — the
        // "jump". Mark the sheet `inert` across showModal() so focus lands on the
        // dialog (top of viewport) instead, then restore and focus it quietly.
        sheet.setAttribute("inert", "");
        dialog.showModal();
        sheet.removeAttribute("inert");
        sheet.focus({ preventScroll: true });
      }

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
      scaleUp(); // recede → restore, in sync with the sheet leaving
      if (dragDismissed.current) {
        dragDismissed.current = false;
        const id = setTimeout(() => { if (dialog.open) dialog.close(); unlockScroll(); }, DURATION_OUT + 20);
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
        unlockScroll();
      };
    }
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
      sheet.style.transform = HIDDEN;
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
      className="fixed inset-x-0 top-0 bottom-auto m-0 h-[100dvh] w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:hidden"
    >
      <div
        ref={overlayRef}
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 bg-black/60 outline-none"
      />

      <div
        ref={sheetRef}
        tabIndex={-1}
        className="fixed inset-x-(--spacing-gutter) bottom-(--spacing-gutter) mx-auto flex max-h-[85svh] max-w-(--container-column) flex-col overflow-hidden rounded-(--radius-sheet) bg-surface outline-none"
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

        <div className="h-px shrink-0 bg-[rgba(255,255,255,0.03)]" />

        <div className="min-h-0 overflow-y-auto px-6 pb-12 pt-8">
          <h2 className="text-lg font-medium">{title}</h2>
          <div className="pt-6">{children}</div>
        </div>
      </div>
    </dialog>
  );
}
