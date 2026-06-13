"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Tweak these to adjust feel
const DURATION_IN  = 320; // ms — sheet slide up
const DURATION_OUT = 220; // ms — sheet slide down

// iOS-style "presenting" effect — the page behind recedes while the sheet is up.
const PAGE_SCALE     = 0.95;
const PAGE_RADIUS    = "14px";
const PAGE_TRANSLATE = "14px"; // tuck the top edge down, like newer iOS
// Color behind the receding page. A touch darker than --color-canvas (#0C1013)
// so the recede gap reads at the sheet edges, without the hard black strip that
// pure #000 bleeds into the iOS bottom address-bar region.
const PAGE_RECEDE_VOID = "#070A0C";

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // The dialog is portaled to <body> (see the return) — it must NOT live under
  // the <main> we scale for the recede, or the transform would re-anchor it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Track running Web Animations so we can cancel them before starting new ones.
  const sheetAnim   = useRef<Animation | undefined>(undefined);
  const overlayAnim = useRef<Animation | undefined>(undefined);

  const dragDismissed = useRef(false);
  const snapTimeout   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef({ active: false, startY: 0, lastY: 0, lastTime: 0, velocity: 0 });

  // Scroll-lock WITHOUT moving the page, plus the iOS "presenting" recede.
  // Two hard-won constraints shaped this:
  //  • Don't lock with `position: fixed`/`overflow: hidden` — making the page
  //    non-scrollable is what makes iOS Safari collapse its (expanded, at
  //    scrollY 0) URL bar to fit the modal, i.e. the "jump". So we leave the
  //    page in place and just swallow scroll gestures.
  //  • Don't put the recede transform on an ancestor of the <dialog> — a
  //    transform creates a containing block that re-anchors the fixed dialog to
  //    the scrolled-away document, jumping it. So the dialog is portaled to
  //    <body> and we scale <main> (its sibling) instead.
  const isLocked = useRef(false);
  const pageElRef = useRef<HTMLElement | null>(null);

  const blockScroll = useCallback((e: Event) => {
    const area = scrollAreaRef.current;
    if (area && area.contains(e.target as Node)) return; // let the sheet scroll
    e.preventDefault();
  }, []);

  const lockScroll = () => {
    isLocked.current = true;
    document.addEventListener("touchmove", blockScroll, { passive: false });
    document.addEventListener("wheel", blockScroll, { passive: false });
    const html = document.documentElement;
    html.style.overscrollBehavior = "none"; // kill rubber-band (doesn't lock scroll)
    html.style.background = PAGE_RECEDE_VOID; // canvas revealed by the recede
    const page = (pageElRef.current = document.querySelector("main"));
    if (page) {
      // Origin at the viewport centre (in <main>'s coords) so the scale reads
      // correctly at any scroll offset.
      page.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`;
      page.style.transition = `transform ${DURATION_IN}ms ease, border-radius ${DURATION_IN}ms ease`;
      page.style.transform = `translateY(${PAGE_TRANSLATE}) scale(${PAGE_SCALE})`;
      page.style.borderRadius = PAGE_RADIUS;
    }
  };

  // Scale the page back up — called as the close starts so it animates in sync
  // with the sheet sliding away (listeners are torn down later, in unlockScroll).
  const scaleUp = () => {
    if (!isLocked.current) return;
    const page = pageElRef.current;
    if (page) {
      page.style.transition = `transform ${DURATION_OUT}ms ease-in, border-radius ${DURATION_OUT}ms ease-in`;
      page.style.transform = "";
      page.style.borderRadius = "";
    }
  };

  const unlockScroll = () => {
    if (!isLocked.current) return;
    isLocked.current = false;
    document.removeEventListener("touchmove", blockScroll);
    document.removeEventListener("wheel", blockScroll);
    const html = document.documentElement;
    html.style.overscrollBehavior = "";
    html.style.background = "";
    const page = pageElRef.current;
    if (page) {
      page.style.transform = "";
      page.style.transformOrigin = "";
      page.style.borderRadius = "";
      page.style.transition = "";
    }
    pageElRef.current = null;
  };

  // Safety net: never leave the page locked if the sheet unmounts while open.
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
        // showModal() auto-focuses the first focusable element. Our sheet sits
        // at the *bottom* of the viewport, so focusing it (or its close button)
        // makes iOS scroll it into the visual viewport — at scrollY 0 the URL
        // bar is expanded and the sheet is below the fold, so Safari yanks the
        // page to reveal it. Point autofocus at the overlay (top of viewport,
        // already visible) instead, then move focus to the sheet without
        // scrolling. The overlay isn't a button, so no focus ring shows either.
        overlay?.setAttribute("autofocus", "");
        dialog.showModal();
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

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={() => { if (open) onClose(); }}
      aria-label={title}
      className="fixed inset-0 m-0 h-full w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:hidden"
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
        className="absolute inset-x-(--spacing-gutter) bottom-(--spacing-gutter) mx-auto flex max-h-[85svh] max-w-(--container-column) flex-col overflow-hidden rounded-(--radius-sheet) bg-surface outline-none"
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

        <div ref={scrollAreaRef} className="min-h-0 overflow-y-auto overscroll-contain px-6 pb-12 pt-8">
          <h2 className="text-lg font-medium">{title}</h2>
          <div className="pt-6">{children}</div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
