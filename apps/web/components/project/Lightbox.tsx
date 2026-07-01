"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Mousewheel, Zoom } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import type { ImageAsset } from "@portfolio/schema";
import { GlassPill } from "@/components/ui/GlassPill";

import "swiper/css";
import "swiper/css/zoom";

const lbLoadedUrls = new Set<string>();

function fadeRef(src: string) {
  return (el: HTMLImageElement | null) => {
    if (!el) return;
    if (lbLoadedUrls.has(src) || el.complete) {
      if (el.complete) lbLoadedUrls.add(src);
      return;
    }
    el.style.opacity = "0";
    el.addEventListener("load", () => {
      el.style.transition = "opacity 0.3s ease";
      el.style.opacity = "1";
      lbLoadedUrls.add(src);
    }, { once: true });
  };
}

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
  onExpand?: () => void;
  onClose: () => void;
};

export function Lightbox({ images, index, originRect, onIndexChange, onExpand, onClose }: Props) {
  const dialogRef   = useRef<HTMLDialogElement>(null);
  const focusTrapRef = useRef<HTMLDivElement>(null);
  const swiperRef      = useRef<SwiperClass | null>(null);
  const thumbsSwiperRef = useRef<SwiperClass | null>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const chromeRef   = useRef<HTMLDivElement>(null);
  const n = images.length;
  const many = n > 1;
  const [current, setCurrent] = useState(index);
  const [controlsVisible, setControlsVisible] = useState(true);
  const initial = useRef(index).current;
  // Rotate images so the selected image is already at position 0.
  // Swiper starts at initialSlide={0} and never needs to reposition,
  // eliminating the flash of slide 0 that loop-mode repositioning causes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rotated = useMemo(() => [...images.slice(initial), ...images.slice(0, initial)], []);
  const closing = useRef(false);
  const drag = useRef({ active: false, decided: false, vertical: false, startX: 0, startY: 0, lastY: 0, lastT: 0, vy: 0 });
  const lastPointerType = useRef<string>("touch");
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
    setControlsVisible(true);
    inactivityTimer.current = setTimeout(() => setControlsVisible(false), 1000);
  };

  const overButton = useRef(false);
  const pauseInactivityTimer = () => { overButton.current = true; clearTimeout(inactivityTimer.current); };
  const resumeInactivityTimer = () => { overButton.current = false; resetInactivityTimer(); };

  // Clean up inactivity timer on unmount
  useEffect(() => () => clearTimeout(inactivityTimer.current), []);

  // Close via button / Escape — animate back to origin thumbnail
  const handleClose = () => {
    if (closing.current) return;
    closing.current = true;
    const stage   = stageRef.current;
    const overlay = overlayRef.current;
    const chrome  = chromeRef.current;
    if (originRect && stage) {
      const to = flipTransform(originRect);
      const closeScale = originRect.width / window.innerWidth;
      const imgEl = (swiperRef.current?.el?.querySelector(".swiper-slide-active img") ?? null) as HTMLImageElement | null;
      if (imgEl && closeScale > 0) {
        imgEl.style.transition = `border-radius 80ms ease-in`;
        imgEl.getBoundingClientRect();
        imgEl.style.borderRadius = `${14 / closeScale}px`;
      }
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
    onClose();
  };

  // Show modal + entry FLIP animation
  useEffect(() => {
    const dialog = dialogRef.current;
    const stage  = stageRef.current;

    const from = originRect
      ? flipTransform(originRect)
      : `translateY(${window.innerHeight}px) scale(0.8)`;

    // Hide before showModal to prevent iOS Safari's first-frame flash at
    // the element's natural (full-screen) position.
    if (stage) { stage.style.transform = from; stage.style.opacity = "0"; }
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
    if (chromeRef.current) chromeRef.current.style.opacity = "0";

    dialog?.showModal();
    focusTrapRef.current?.focus({ preventScroll: true });

    let cancelled = false;
    let expandTimer: ReturnType<typeof setTimeout> | undefined;

    // One rAF lets iOS Safari settle its first top-layer paint before we
    // reveal the stage. After that the thumbnail is visible for 10ms,
    // then the FLIP expand runs.
    // Scaled border-radius so the stage looks like the thumbnail's 14px
    // rounded corners during the pause and smoothly opens to sharp edges.
    const scale = originRect ? originRect.width / window.innerWidth : 0;
    const startRadius = scale > 0 ? `${14 / scale}px` : "0px";

    // Helper: get the <img> from a specific slide (border-radius on <img>
    // clips its own painted content directly — no overflow:hidden needed).
    const getSlideImg = (selector: string) =>
      (swiperRef.current?.el?.querySelector(selector) ?? null) as HTMLImageElement | null;

    requestAnimationFrame(() => {
      if (cancelled) return;

      if (stageRef.current) stageRef.current.style.opacity = "";

      // Round the first slide's image to match the thumbnail's 14px corners
      const imgEl = getSlideImg(".swiper-slide img");
      if (imgEl && scale > 0) imgEl.style.borderRadius = startRadius;

      const overlayEl = overlayRef.current;

      // Expand after pause — overlay fades in together with the FLIP
      expandTimer = setTimeout(() => {
        onExpand?.();

        requestAnimationFrame(() => {
          const stageEl  = stageRef.current;
          const chromeEl = chromeRef.current;

          // Transition the image's border-radius open with ease-out
          if (imgEl && scale > 0) {
            imgEl.style.transition = `border-radius 80ms ease-out`;
            imgEl.getBoundingClientRect();
            imgEl.style.borderRadius = "0px";
          }

          if (stageEl) {
            const anim = stageEl.animate(
              [{ transform: from }, { transform: "none" }],
              { duration: OPEN_DUR, easing: EASING, fill: "forwards" },
            );
            anim.onfinish = () => {
              if (stageRef.current) stageRef.current.style.transform = "";
              if (imgEl) { imgEl.style.transition = ""; imgEl.style.borderRadius = ""; }
              anim.cancel();
              if (window.matchMedia("(hover: hover)").matches) resetInactivityTimer();
            };
          }
          const overlayAnim = overlayEl?.animate(
            [{ opacity: "0" }, { opacity: "1" }],
            { duration: OPEN_DUR, easing: "ease", fill: "forwards" },
          );
          if (overlayAnim) {
            overlayAnim.onfinish = () => {
              if (overlayRef.current) overlayRef.current.style.opacity = "";
              overlayAnim.cancel();
            };
          }
          const chromeAnim = chromeEl?.animate(
            [{ opacity: "0" }, { opacity: "1" }],
            { duration: OPEN_DUR, easing: "ease", fill: "forwards" },
          );
          if (chromeAnim) {
            chromeAnim.onfinish = () => {
              if (chromeRef.current) chromeRef.current.style.opacity = "";
              chromeAnim.cancel();
            };
          }
        });
      }, 10);
    });

    return () => { cancelled = true; clearTimeout(expandTimer); };
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

  // Trackpad swipe-down to dismiss — accumulate deltaY, dismiss past threshold
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    let accumulated = 0;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      if (closing.current) return;
      if (e.deltaY >= 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      accumulated += -e.deltaY;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { accumulated = 0; }, 300);
      if (accumulated > 200) {
        accumulated = 0;
        clearTimeout(resetTimer);
        handleClose();
      }
    };
    dialog.addEventListener("wheel", onWheel, { passive: true });
    return () => { dialog.removeEventListener("wheel", onWheel); clearTimeout(resetTimer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (drag.current.decided) return;
    if (lastPointerType.current === "mouse") {
      if (!many) return;
      e.clientX > window.innerWidth / 2 ? swiperRef.current?.slideNext() : swiperRef.current?.slidePrev();
    } else {
      setControlsVisible((v) => !v);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    lastPointerType.current = e.pointerType;
    drag.current = { active: true, decided: false, vertical: false, startX: e.clientX, startY: e.clientY, lastY: e.clientY, lastT: Date.now(), vy: 0 };
  };

  const onDialogMouseMove = () => {
    if (!overButton.current) resetInactivityTimer();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.decided) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      d.decided = true;
      d.vertical = dy > 0 && Math.abs(dy) > Math.abs(dx) && (swiperRef.current?.zoom?.scale ?? 1) <= 1;
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
        const closeScale = originRect.width / window.innerWidth;
        const imgEl = (swiperRef.current?.el?.querySelector(".swiper-slide-active img") ?? null) as HTMLImageElement | null;
        if (imgEl && closeScale > 0) {
          imgEl.style.transition = `border-radius 80ms ease-in`;
          imgEl.getBoundingClientRect();
          imgEl.style.borderRadius = `${14 / closeScale}px`;
        }
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

  const btn = "flex h-12 w-12 items-center justify-center rounded-full bg-glass backdrop-blur-md transition-colors hover:bg-white/20 cursor-pointer";
  const barStyle: React.CSSProperties = { left: "50%", transform: "translateX(-50%)", width: "calc(100% - 3rem)" };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => { e.preventDefault(); handleClose(); }}
      onClose={() => { if (!closing.current) handleClose(); }}
      onMouseMove={onDialogMouseMove}
      aria-label="Image viewer"
      className="fixed inset-x-0 top-0 bottom-auto m-0 h-[100dvh] w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:hidden"
    >
      {/* Absorbs focus on open; ring suppressed by `dialog [tabindex="-1"]:focus-visible` in globals.css */}
      <div ref={focusTrapRef} tabIndex={-1} aria-hidden className="fixed" />
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
          modules={[Keyboard, Mousewheel, Zoom]}
          zoom={{ maxRatio: 4 }}
          keyboard={{ enabled: true }}
          mousewheel={{ forceToAxis: true, thresholdTime: 0 }}
          loop={many}
          initialSlide={0}
          spaceBetween={20}
          speed={SPEED}
          className="lightbox-swiper"
          style={{ position: "absolute", inset: 0 }}
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => {
            if (closing.current) return;
            const orig = (s.realIndex + initial) % n;
            setCurrent(orig);
            onIndexChange(orig);
            thumbsSwiperRef.current?.slideTo(orig);
          }}
        >
          {rotated.map((im, i) => (
            <SwiperSlide key={i} className="lightbox-slide" style={{ position: "relative" }}>
              <div className="swiper-zoom-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={im.src}
                  alt={im.alt}
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                  ref={fadeRef(im.src)}
                  className="max-h-full w-full object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div ref={chromeRef} className="pointer-events-none absolute inset-0 z-10">
      <div className={`transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Top bar — alt text left, close right */}
        <div className="pointer-events-auto absolute top-4 flex items-center justify-between" style={barStyle}>
          {images[current]?.alt ? (
            <GlassPill className="px-4 py-3 max-w-[60vw]">
              <MarqueeText text={images[current].alt} />
            </GlassPill>
          ) : <span />}
          <button onClick={handleClose} aria-label="Close" className={btn}>
            <Cross />
          </button>
        </div>

        {/* Bottom — thumbnail strip */}
        {many && (
          <div
            className="pointer-events-auto absolute bottom-0 inset-x-0 pb-8 pt-2"
            onMouseEnter={pauseInactivityTimer}
            onMouseLeave={resumeInactivityTimer}
          >
            <Swiper
              onSwiper={(s) => { thumbsSwiperRef.current = s; }}
              initialSlide={index}
              spaceBetween={8}
              slidesPerView="auto"
              centerInsufficientSlides
              className="thumbs-swiper"
              style={{ paddingInline: "8px" }}
            >
              {images.map((im, i) => (
                <SwiperSlide key={i} style={{ width: "auto" }} onClick={() => swiperRef.current?.slideToLoop((i - initial + n) % n, 0)}>
                  <div className="flex flex-col items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={im.src}
                      alt={im.alt}
                      draggable={false}
                      className="h-14 w-auto object-cover rounded-lg cursor-pointer"
                    />
                    <div className={`w-1 h-1 rounded-full bg-white transition-opacity ${i === current ? "opacity-100" : "opacity-0"}`} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
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

function MarqueeText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const overflow = textEl.scrollWidth - container.offsetWidth;
    if (overflow <= 0) return;

    const scrollDuration = Math.max(1500, overflow * 35);
    const pauseDuration = 1500;
    const total = scrollDuration * 2 + pauseDuration * 2;
    const p1 = pauseDuration / total;
    const p2 = (pauseDuration + scrollDuration) / total;
    const p3 = (pauseDuration * 2 + scrollDuration) / total;

    const anim = textEl.animate(
      [
        { transform: "translateX(0)", offset: 0, easing: "linear" },
        { transform: "translateX(0)", offset: p1, easing: "ease-in-out" },
        { transform: `translateX(-${overflow}px)`, offset: p2, easing: "linear" },
        { transform: `translateX(-${overflow}px)`, offset: p3, easing: "ease-in-out" },
        { transform: "translateX(0)", offset: 1 },
      ],
      { duration: total, iterations: Infinity },
    );

    return () => anim.cancel();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden"
      style={{
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
    >
      <span ref={textRef} className="whitespace-nowrap inline-block" style={{ paddingInline: "6px" }}>{text}</span>
    </div>
  );
}

