"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "@base-ui/react/toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import type { ImageAsset } from "@portfolio/schema";
import { GlassPill } from "@/components/ui/GlassPill";

import "swiper/css";

const SPEED = 320;
const DISMISS_DY = 120;
const DISMISS_VY = 0.5;
const SETTLE = 260;
const OPEN_DUR = 360;
const CLOSE_DUR = 280;
const EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

function flipTransform(rect: DOMRect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tx = rect.left + rect.width / 2 - vw / 2;
  const ty = rect.top + rect.height / 2 - vh / 2;
  const scale = rect.width / vw;
  return `translate(${tx}px, ${ty}px) scale(${scale})`;
}

type Props = {
  images: ImageAsset[];
  index: number;
  originRect?: DOMRect | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

export function Lightbox(props: Props) {
  return (
    <Toast.Provider limit={3}>
      <LightboxContent {...props} />
    </Toast.Provider>
  );
}

function LightboxContent({ images, index, originRect, onIndexChange, onClose }: Props) {
  const { toasts, add: addToast, close: closeToast } = Toast.useToastManager();

  const dialogRef  = useRef<HTMLDialogElement>(null);
  const swiperRef  = useRef<SwiperClass | null>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const chromeRef  = useRef<HTMLDivElement>(null);
  const n = images.length;
  const many = n > 1;
  const [current, setCurrent] = useState(index);
  const [infoOpen, setInfoOpen] = useState(false);
  const initial = useRef(index).current;
  // Rotate images so the selected image is already at position 0.
  // Swiper starts at initialSlide={0} and never needs to reposition,
  // eliminating the flash of slide 0 that loop-mode repositioning causes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rotated = useMemo(() => [...images.slice(initial), ...images.slice(0, initial)], []);
  const closing = useRef(false);
  const drag = useRef({ active: false, decided: false, vertical: false, startX: 0, startY: 0, lastY: 0, lastT: 0, vy: 0 });

  const showToast = (imageIndex: number, alt: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addToast({ title: `Image ${imageIndex + 1}`, description: alt, timeout: 0, imageIndex } as any);
  };

  const hideToast = () => {
    toasts.forEach((t) => closeToast(t.id));
  };

  const toggleInfo = () => {
    const alt = images[current]?.alt;
    if (!alt) return;
    if (infoOpen) {
      hideToast();
      setInfoOpen(false);
    } else {
      showToast(current, alt);
      setInfoOpen(true);
    }
  };

  // Add a new toast when swiping to a new image while info is open
  useEffect(() => {
    if (!infoOpen) return;
    const alt = images[current]?.alt;
    if (alt) showToast(current, alt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Close via button / Escape — animate back to origin thumbnail
  const handleClose = () => {
    if (closing.current) return;
    closing.current = true;
    hideToast();
    const stage   = stageRef.current;
    const overlay = overlayRef.current;
    const chrome  = chromeRef.current;
    if (originRect && stage) {
      const to = flipTransform(originRect);
      const anim = stage.animate(
        [{ transform: "none" }, { transform: to }],
        { duration: CLOSE_DUR, easing: EASING, fill: "forwards" },
      );
      overlay?.animate([{ opacity: "1" }, { opacity: "0" }], { duration: CLOSE_DUR, easing: "ease", fill: "forwards" });
      chrome?.animate([{ opacity: "1" }, { opacity: "0" }], { duration: 160, easing: "ease", fill: "forwards" });
      anim.onfinish = () => onClose();
    } else if (stage) {
      const vh = window.innerHeight;
      const anim = stage.animate(
        [{ transform: "none" }, { transform: `translateY(${vh}px) scale(0.8)` }],
        { duration: CLOSE_DUR, easing: EASING, fill: "forwards" },
      );
      overlay?.animate([{ opacity: "1" }, { opacity: "0" }], { duration: CLOSE_DUR, easing: "ease", fill: "forwards" });
      chrome?.animate([{ opacity: "1" }, { opacity: "0" }], { duration: 160, easing: "ease", fill: "forwards" });
      anim.onfinish = () => onClose();
    } else {
      onClose();
    }
  };

  const handleSwipeDismiss = () => {
    if (closing.current) return;
    closing.current = true;
    hideToast();
    onClose();
  };

  // Show modal + entry FLIP animation
  useEffect(() => {
    const dialog  = dialogRef.current;
    const stage   = stageRef.current;
    const overlay = overlayRef.current;

    // Pin stage to its starting position and hide overlay before showModal so
    // any paint triggered by showModal() shows the correct initial state instead
    // of a full-screen flash of whatever slide Swiper rendered first.
    const from = originRect
      ? flipTransform(originRect)
      : `translateY(${window.innerHeight}px) scale(0.8)`;
    if (stage) stage.style.transform = from;
    if (overlay) overlay.style.opacity = "0";

    dialog?.showModal();

    if (stage) {
      const anim = stage.animate(
        [{ transform: from }, { transform: "none" }],
        { duration: OPEN_DUR, easing: EASING, fill: "forwards" },
      );
      anim.onfinish = () => {
        if (stageRef.current) stageRef.current.style.transform = "";
        anim.cancel();
      };
    }
    const overlayAnim = overlay?.animate(
      [{ opacity: "0" }, { opacity: "1" }],
      { duration: OPEN_DUR, easing: "ease", fill: "forwards" },
    );
    if (overlayAnim) {
      overlayAnim.onfinish = () => {
        if (overlayRef.current) overlayRef.current.style.opacity = "";
        overlayAnim.cancel();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll lock
  useEffect(() => {
    const y = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.insetInline = "0";
    body.style.width = "100%";
    html.style.overscrollBehavior = "none";
    html.style.touchAction = "none";
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

  useEffect(() => {
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false, capture: true });
    return () => document.removeEventListener("touchmove", prevent, { capture: true } as EventListenerOptions);
  }, []);

  function paint(dy: number) {
    const d = Math.max(dy, 0);
    const p = Math.min(d / ((window.innerHeight || 800) * 0.45), 1);
    if (stageRef.current)   stageRef.current.style.transform  = `translateY(${d}px) scale(${1 - 0.16 * p})`;
    if (overlayRef.current) overlayRef.current.style.opacity  = String(1 - p);
    if (chromeRef.current)  chromeRef.current.style.opacity   = String(1 - Math.min(p * 2, 1));
  }

  function setTransition(on: boolean) {
    const t = on ? `transform ${SETTLE}ms ease` : "none";
    const o = on ? `opacity ${SETTLE}ms ease` : "none";
    if (stageRef.current)   stageRef.current.style.transition   = t;
    if (overlayRef.current) overlayRef.current.style.transition  = o;
    if (chromeRef.current)  chromeRef.current.style.transition   = o;
  }

  const onStageClick = (e: React.MouseEvent) => {
    if (!many || drag.current.decided) return;
    e.clientX > window.innerWidth / 2 ? swiperRef.current?.slideNext() : swiperRef.current?.slidePrev();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, decided: false, vertical: false, startX: e.clientX, startY: e.clientY, lastY: e.clientY, lastT: Date.now(), vy: 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
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

    if (dy > DISMISS_DY || d.vy > DISMISS_VY) {
      const stage   = stageRef.current;
      const overlay = overlayRef.current;
      const chrome  = chromeRef.current;
      if (stage)   stage.style.transition   = "none";
      if (overlay) overlay.style.transition = "none";
      if (chrome)  chrome.style.transition  = "none";

      if (originRect && stage) {
        const anim = stage.animate(
          [{ transform: stage.style.transform }, { transform: flipTransform(originRect) }],
          { duration: CLOSE_DUR, easing: EASING, fill: "forwards" },
        );
        overlay?.animate(
          [{ opacity: overlay.style.opacity || "1" }, { opacity: "0" }],
          { duration: CLOSE_DUR, easing: "ease", fill: "forwards" },
        );
        chrome?.animate(
          [{ opacity: chrome.style.opacity || "1" }, { opacity: "0" }],
          { duration: 160, easing: "ease", fill: "forwards" },
        );
        anim.onfinish = () => handleSwipeDismiss();
      } else {
        setTransition(true);
        const h = window.innerHeight || 800;
        if (stage)   stage.style.transform  = `translateY(${h}px) scale(0.8)`;
        if (overlay) overlay.style.opacity  = "0";
        if (chrome)  chrome.style.opacity   = "0";
        setTimeout(handleSwipeDismiss, SETTLE - 40);
      }
    } else {
      setTransition(true);
      if (stageRef.current)   stageRef.current.style.transform  = "";
      if (overlayRef.current) overlayRef.current.style.opacity  = "";
      if (chromeRef.current)  chromeRef.current.style.opacity   = "";
    }
  };

  const btn = "flex h-12 w-12 items-center justify-center rounded-full bg-glass backdrop-blur-md";
  const barStyle: React.CSSProperties = { left: "50%", transform: "translateX(-50%)", width: "calc(100% - 3rem)" };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => { e.preventDefault(); handleClose(); }}
      onClose={() => { if (!closing.current) handleClose(); }}
      aria-label="Image viewer"
      className="fixed inset-x-0 top-0 bottom-auto m-0 h-[100dvh] w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:hidden"
    >
      <div ref={overlayRef} className="absolute inset-0 bg-black" style={{ willChange: "opacity" }} />

      <div
        ref={stageRef}
        onClick={onStageClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, touchAction: "none", willChange: "transform" }}
      >
        <Swiper
          modules={[Keyboard, Mousewheel]}
          keyboard={{ enabled: true }}
          mousewheel={{ forceToAxis: true, thresholdTime: 0 }}
          loop={many}
          initialSlide={0}
          speed={SPEED}
          className="lightbox-swiper"
          style={{ position: "absolute", inset: 0 }}
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => {
            if (closing.current) return;
            const orig = (s.realIndex + initial) % n;
            setCurrent(orig);
            onIndexChange(orig);
          }}
        >
          {rotated.map((im, i) => (
            <SwiperSlide key={i} className="lightbox-slide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={im.src}
                alt={im.alt}
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                ref={(el) => {
                  if (!el || el.complete) return;
                  el.style.opacity = "0";
                  el.addEventListener("load", () => {
                    el.style.transition = "opacity 0.25s ease";
                    el.style.opacity = "1";
                  }, { once: true });
                }}
                className="max-h-full w-full object-contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div ref={chromeRef} className="pointer-events-none absolute inset-0 z-10">
        {/* Top bar */}
        <div className="pointer-events-auto absolute top-4 flex items-center justify-between" style={barStyle}>
          {images[current]?.alt ? (
            <button onClick={toggleInfo} aria-label="Image info" className={btn}>
              <InfoIcon />
            </button>
          ) : <span />}
          <button onClick={handleClose} aria-label="Close" className={btn}>
            <Cross />
          </button>
        </div>

        {/* Bottom: toast viewport + nav bar */}
        <div className="pointer-events-auto absolute bottom-0 inset-x-0">
          {/* Toast: absolutely at same bottom distance as the nav bar buttons (bottom-8 = pb-8) */}
          <div className="absolute bottom-8 left-6 right-6 mx-auto max-w-sm z-10">
            <Toast.Viewport className="toast-viewport">
              {toasts.map((toast) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const img = images[(toast as any).imageIndex as number];
                return (
                  <Toast.Root
                    key={toast.id}
                    toast={toast}
                    onClick={() => swiperRef.current?.slideToLoop(((toast as any).imageIndex - initial + n) % n)}
                    className="toast-item cursor-pointer rounded-2xl bg-[rgba(44,44,46,0.92)] backdrop-blur-xl border border-white/10 shadow-2xl"
                  >
                    <Toast.Content className="toast-content p-3 flex flex-row items-start gap-3">
                      {img && (
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.src}
                            alt=""
                            aria-hidden
                            draggable={false}
                            className="max-w-full max-h-full rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1 pt-1">
                        <Toast.Title className="text-[11px] font-semibold tracking-wide text-white/40 uppercase" />
                        <Toast.Description className="text-sm text-white/90 leading-relaxed" />
                      </div>
                    </Toast.Content>
                  </Toast.Root>
                );
              })}
            </Toast.Viewport>
          </div>

          {/* Nav bar */}
          <div className="flex items-center justify-between px-6 pb-8 pt-2">
            {many ? <GlassPill className="px-4 py-3 tabular-nums">{current + 1} / {n}</GlassPill> : <span />}
            {many && (
              <div className="flex gap-2">
                <button onClick={() => swiperRef.current?.slidePrev()} aria-label="Previous image" className={btn}><Chevron flip /></button>
                <button onClick={() => swiperRef.current?.slideNext()} aria-label="Next image" className={btn}><Chevron /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 446.2 446.2" fillRule="evenodd" clipRule="evenodd" aria-hidden>
      <path fill="currentColor" d="M240.19 83.54c16.85,-0.8 31.16,12.22 31.95,29.07 0.8,16.86 -12.22,31.17 -29.07,31.96 -16.85,0.8 -31.16,-12.22 -31.96,-29.08 -0.79,-16.85 12.23,-31.16 29.08,-31.95z"/>
      <path fill="currentColor" d="M179.91 223.86l-5.71 -15.12c-0.31,-0.84 -0.2,-1.7 0.31,-2.44 13.11,-18.64 32.95,-35.49 57.23,-33.12 15.77,1.52 26.63,16.48 23.22,31.94 -8.82,39.95 -18.27,79.76 -27.09,119.7 -1.2,5.44 3.96,10.08 9.24,8.32 9,-3.01 17.41,-14.54 22.86,-21.97 1.24,-1.69 3.85,-1.33 4.6,0.63l5.69 15.11c0.32,0.84 0.22,1.71 -0.3,2.45 -13.12,18.64 -32.95,35.48 -57.24,33.11 -15.76,-1.53 -26.63,-16.47 -23.21,-31.94 8.82,-39.95 18.27,-79.75 27.08,-119.7 1.2,-5.44 -3.95,-10.08 -9.23,-8.31 -9,3 -17.4,14.52 -22.87,21.96 -1.24,1.69 -3.85,1.33 -4.58,-0.62z"/>
      <path fill="currentColor" fillRule="nonzero" d="M223.1 0c123.12,0 223.1,99.98 223.1,223.1 0,123.12 -99.98,223.1 -223.1,223.1 -123.12,0 -223.1,-99.98 -223.1,-223.1 0,-123.12 99.98,-223.1 223.1,-223.1zm0 22.86c-110.66,0 -200.24,89.58 -200.24,200.24 0,110.66 89.58,200.24 200.24,200.24 110.66,0 200.24,-89.58 200.24,-200.24 0,-110.66 -89.58,-200.24 -200.24,-200.24z"/>
    </svg>
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
