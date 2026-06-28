"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@portfolio/schema";
import { Sheet } from "@/components/ui/Sheet";
import { ContactForm } from "./ContactForm";

// Animation timing — mirrors Sheet.tsx
const DURATION_IN   = 320;
const DURATION_OUT  = 220;
const PAGE_SCALE    = 0.95;
const PAGE_RADIUS   = "14px";
const PAGE_TRANSLATE = "14px";
const PAGE_RECEDE_VOID = "#080A0C";
const DISMISS_DISTANCE = 0.35;
const DISMISS_VELOCITY = 0.4;
const HIDDEN = "translate3d(0, calc(100% + 64px), 0)";

type SheetName = "biography" | "experience" | "contact" | null;
type CardPage = "biography" | "experience" | "contact";

export function HomeMenu({ profile }: { profile: Profile }) {
  const [showCard, setShowCard]   = useState(false);
  const [cardPage, setCardPage]   = useState<CardPage>("biography");
  const [sheet, setSheet]         = useState<SheetName>(null);
  const closeSheet = () => setSheet(null);

  const [toast, setToast] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Panel animation refs
  const dialogRef    = useRef<HTMLDialogElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const panelAnim    = useRef<Animation | undefined>(undefined);
  const overlayAnim  = useRef<Animation | undefined>(undefined);
  const lockedScrollY = useRef(0);
  const dragDismissed = useRef(false);
  const snapTimeout   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef({ active: false, startY: 0, lastY: 0, lastTime: 0, velocity: 0 });

  const lockScroll = () => {
    lockedScrollY.current = window.scrollY;
    const body = document.body;
    body.style.position   = "fixed";
    body.style.top        = `-${lockedScrollY.current}px`;
    body.style.insetInline = "0";
    body.style.width      = "100%";
    body.style.overflow   = "hidden";
    document.documentElement.style.background = PAGE_RECEDE_VOID;
    body.style.transformOrigin = `50% ${lockedScrollY.current + window.innerHeight / 2}px`;
    body.style.transition = `transform ${DURATION_IN}ms ease, border-radius ${DURATION_IN}ms ease`;
    body.style.transform  = `translateY(${PAGE_TRANSLATE}) scale(${PAGE_SCALE})`;
    body.style.borderRadius = PAGE_RADIUS;
  };

  const scaleUp = () => {
    const body = document.body;
    if (body.style.position !== "fixed") return;
    body.style.transition   = `transform ${DURATION_OUT}ms ease-in, border-radius ${DURATION_OUT}ms ease-in`;
    body.style.transform    = "";
    body.style.borderRadius = "";
  };

  const unlockScroll = () => {
    const body = document.body;
    if (body.style.position !== "fixed") return;
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    body.style.position     = "";
    body.style.top          = "";
    body.style.insetInline  = "";
    body.style.width        = "";
    body.style.overflow     = "";
    body.style.transform    = "";
    body.style.transformOrigin = "";
    body.style.borderRadius = "";
    body.style.transition   = "";
    html.style.background   = "";
    window.scrollTo(0, lockedScrollY.current);
    html.style.scrollBehavior = prev;
  };

  useEffect(() => unlockScroll, []);

  useEffect(() => {
    const dialog  = dialogRef.current;
    const panel   = panelRef.current;
    const overlay = overlayRef.current;
    if (!dialog || !panel) return;

    if (showCard) {
      clearTimeout(snapTimeout.current);
      panelAnim.current?.cancel();
      overlayAnim.current?.cancel();
      panel.style.transform = "";
      panel.style.transition = "";
      if (overlay) { overlay.style.opacity = ""; overlay.style.transition = ""; }

      if (!dialog.open) {
        lockScroll();
        panel.setAttribute("inert", "");
        dialog.showModal();
        panel.removeAttribute("inert");
        panel.focus({ preventScroll: true });
      }

      panelAnim.current = panel.animate(
        [{ transform: HIDDEN }, { transform: "translateZ(0)" }],
        { duration: DURATION_IN, easing: "ease", fill: "none" },
      );
      if (overlay) {
        overlayAnim.current = overlay.animate(
          [{ opacity: "0" }, { opacity: "1" }],
          { duration: DURATION_IN, easing: "ease", fill: "none" },
        );
      }
    } else if (dialog.open) {
      scaleUp();
      if (dragDismissed.current) {
        dragDismissed.current = false;
        const id = setTimeout(() => { if (dialog.open) dialog.close(); unlockScroll(); }, DURATION_OUT + 20);
        return () => clearTimeout(id);
      }

      clearTimeout(snapTimeout.current);
      panelAnim.current?.cancel();
      overlayAnim.current?.cancel();
      panel.style.transform  = "";
      panel.style.transition = "";
      if (overlay) { overlay.style.opacity = ""; overlay.style.transition = ""; }

      panelAnim.current = panel.animate(
        [{ transform: "translateZ(0)" }, { transform: HIDDEN }],
        { duration: DURATION_OUT, easing: "ease-in", fill: "forwards" },
      );
      if (overlay) {
        overlayAnim.current = overlay.animate(
          [{ opacity: "1" }, { opacity: "0" }],
          { duration: DURATION_OUT, easing: "ease", fill: "forwards" },
        );
      }

      panelAnim.current.onfinish = () => {
        panelAnim.current?.cancel();
        overlayAnim.current?.cancel();
        panelAnim.current = undefined;
        overlayAnim.current = undefined;
        if (dialog.open) dialog.close();
        unlockScroll();
      };
    }
  }, [showCard]);

  const onDragStart = (e: React.PointerEvent) => {
    const panel = panelRef.current;
    if (!panel) return;
    clearTimeout(snapTimeout.current);
    panelAnim.current?.cancel();
    overlayAnim.current?.cancel();
    panel.style.transition = "none";
    const overlay = overlayRef.current;
    if (overlay) overlay.style.transition = "none";
    drag.current = { active: true, startY: e.clientY, lastY: e.clientY, lastTime: Date.now(), velocity: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!d.active || !panel) return;
    const now = Date.now();
    const dt  = now - d.lastTime;
    if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY    = e.clientY;
    d.lastTime = now;
    const dy = Math.max(0, e.clientY - d.startY);
    panel.style.transform = `translate3d(0,${dy}px,0)`;
    if (overlay) {
      const h = panel.offsetHeight;
      overlay.style.opacity = String(Math.max(0.1, 1 - (dy / (h * DISMISS_DISTANCE)) * 0.7));
    }
  };

  const onDragEnd = (e: React.PointerEvent) => {
    const d = drag.current;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!d.active || !panel) return;
    d.active = false;
    const dy = Math.max(0, e.clientY - d.startY);
    const h  = panel.offsetHeight;
    const shouldDismiss = dy > h * DISMISS_DISTANCE || d.velocity > DISMISS_VELOCITY;
    if (shouldDismiss) {
      const remaining = Math.max(h - dy, 80);
      const dur = Math.min(DURATION_OUT, Math.max(120, remaining / Math.max(d.velocity, 0.3)));
      panel.style.transition = `transform ${dur}ms ease`;
      panel.style.transform  = HIDDEN;
      if (overlay) { overlay.style.transition = `opacity ${dur}ms ease`; overlay.style.opacity = "0"; }
      dragDismissed.current = true;
      setTimeout(() => setShowCard(false), dur + 20);
    } else {
      const SNAP = 280;
      panel.style.transition = `transform ${SNAP}ms ease`;
      panel.style.transform  = "translate3d(0,0,0)";
      if (overlay) { overlay.style.transition = `opacity ${SNAP}ms ease`; overlay.style.opacity = "1"; }
      snapTimeout.current = setTimeout(() => {
        if (panelRef.current)   { panelRef.current.style.transform = "";   panelRef.current.style.transition = ""; }
        if (overlayRef.current) { overlayRef.current.style.opacity = ""; overlayRef.current.style.transition = ""; }
      }, SNAP + 20);
    }
  };

  const closeCard = () => setShowCard(false);

  const handleSent = () => {
    setSheet(null);
    setShowCard(false);
    setTimeout(() => {
      clearTimeout(toastTimeout.current);
      setToast(true);
      toastTimeout.current = setTimeout(() => setToast(false), 4000);
    }, 400);
  };

  const tabs = (
    [
      { key: "biography"  as CardPage, label: "Biography",   show: !!profile.biography },
      { key: "experience" as CardPage, label: "Experience",  show: profile.experience.length > 0 },
      { key: "contact"    as CardPage, label: "Contact",     show: profile.contactEnabled },
    ] as const
  ).filter((t) => t.show);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    if (!showCard) return;
    const idx = tabs.findIndex((t) => t.key === cardPage);
    const btn = tabRefs.current[idx];
    if (btn) setPill({ left: btn.offsetLeft, width: btn.offsetWidth, ready: true });
  }, [cardPage, showCard]);

  return (
    <>
      {/* Top-left — desktop only */}
      <div className="fixed left-3 top-3 z-50 hidden flex-col items-start gap-2 md:flex">
        <Link href={`/${profile.username}`} className="flex items-center px-4 py-2.5 transition-opacity hover:opacity-70">
          <div className="text-left leading-tight">
            <p className="text-[15px]">{profile.displayName}</p>
            {profile.role && <p className="text-sm text-ink-muted">{profile.role}</p>}
          </div>
        </Link>

        <button
          onClick={() => setShowCard(true)}
          aria-label="Open about panel"
          className="ml-4 px-[10px] py-[8px] rounded-[10px] bg-[#373737] text-ink cursor-pointer transition-opacity hover:opacity-80"
        >
          <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor" aria-hidden>
            <circle cx="2"  cy="2" r="1.5" />
            <circle cx="8"  cy="2" r="1.5" />
            <circle cx="14" cy="2" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Desktop panel — dialog for top-layer stacking */}
      <dialog
        ref={dialogRef}
        onClose={() => { if (showCard) setShowCard(false); }}
        aria-label="Menu"
        className="fixed inset-x-0 top-0 bottom-auto m-0 h-[100dvh] w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:hidden"
      >
        {/* Overlay */}
        <div
          ref={overlayRef}
          onClick={closeCard}
          tabIndex={-1}
          className="absolute inset-0 bg-black/60 outline-none"
        />

        {/* Panel */}
        <div
          ref={panelRef}
          tabIndex={-1}
          className="fixed left-[5%] right-[5%] bottom-3 flex h-[80vh] flex-col overflow-hidden rounded-(--radius-sheet) bg-[#1d1e21] outline-none"
        >
          {/* Handle — gray bar background */}
          <div
            className="flex shrink-0 touch-none select-none justify-center pb-4 pt-3"
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
          >
            <button
              onClick={closeCard}
              aria-label="Close"
              className="h-1 w-24 cursor-grab rounded-full bg-[#ffffff26] active:cursor-grabbing"
            />
          </div>

          {/* Tab bar — sliding pill */}
          <div className="shrink-0 px-6 pb-4">
            <div className="relative mx-auto flex w-fit items-center gap-1 rounded-[15px] bg-[#232428] p-[10px]">
              {/* Sliding background pill */}
              {pill.ready && (
                <div
                  className="pointer-events-none absolute top-[10px] bottom-[10px] rounded-[10px] bg-[#373737] transition-all duration-200 ease-out"
                  style={{ left: pill.left, width: pill.width }}
                />
              )}
              {tabs.map((tab, i) => (
                <button
                  key={tab.key}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  onClick={() => setCardPage(tab.key)}
                  className={`relative z-10 px-[15px] py-[10px] text-[15px] rounded-[10px] cursor-pointer transition-colors duration-150 ${
                    cardPage === tab.key ? "text-ink" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px shrink-0 bg-[rgba(255,255,255,0.13)]" />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-16 py-10">
            {cardPage === "biography" && profile.biography && (
              <div className="mx-auto max-w-2xl space-y-4 text-[15px] text-ink/90 leading-relaxed">
                {profile.biography.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
            {cardPage === "experience" && (
              <div className="mx-auto max-w-2xl">
                <ol className="space-y-8 border-l border-surface-edge pl-5">
                  {profile.experience.map((entry) => (
                    <li key={entry.id}>
                      <p className="text-[13px] text-ink-muted">{entry.period}</p>
                      <p className="mt-1 text-[15px]">{entry.title}</p>
                      {entry.subtitle && (
                        <p className="mt-0.5 text-[13px] text-ink-muted">{entry.subtitle}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {cardPage === "contact" && (
              <div className="mx-auto max-w-md">
                <ContactForm username={profile.username} onSent={handleSent} />
              </div>
            )}
          </div>
        </div>
      </dialog>

      {/* Mobile: sheet overlays */}
      <Sheet open={sheet === "biography"} onClose={closeSheet} title="Biography">
        <div className="space-y-5 text-ink/90">
          {profile.biography?.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === "experience"} onClose={closeSheet} title="Timeline">
        <ol className="space-y-10 border-l border-surface-edge pl-5">
          {profile.experience.map((entry) => (
            <li key={entry.id}>
              <p className="text-[15px] text-ink-muted">{entry.period}</p>
              <p className="mt-1 text-lg">{entry.title}</p>
              {entry.subtitle && <p className="mt-0.5 text-ink-muted">{entry.subtitle}</p>}
            </li>
          ))}
        </ol>
      </Sheet>

      <Sheet open={sheet === "contact"} onClose={closeSheet} title="Contact">
        <ContactForm username={profile.username} onSent={handleSent} />
      </Sheet>

      <div
        aria-live="polite"
        className={`fixed inset-x-(--spacing-gutter) bottom-(--spacing-gutter) z-50 mx-auto max-w-(--container-column) rounded-(--radius-sheet) bg-surface px-6 py-5 shadow-xl transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <p className="text-ink">Thanks for getting in touch. I&apos;ll get back to you soon.</p>
      </div>
    </>
  );
}

