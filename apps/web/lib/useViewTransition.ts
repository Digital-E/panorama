"use client";

import { useState, useEffect, useRef } from "react";
import { useViewMode, type ViewMode } from "./useViewMode";

export function useViewTransition() {
  const [view, setView] = useViewMode();
  const [displayedView, setDisplayedView] = useState<ViewMode>(view);
  const contentRef = useRef<HTMLDivElement>(null);
  const canAnimate = useRef(false);
  const animRef = useRef<Animation | null>(null);

  // Defer animation permission by one frame so the initial useSyncExternalStore
  // reconciliation (SSR DEFAULT → client localStorage value) doesn't animate.
  useEffect(() => {
    const raf = requestAnimationFrame(() => { canAnimate.current = true; });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (view === displayedView) return;

    const el = contentRef.current;
    if (!canAnimate.current || !el || !window.matchMedia("(hover: hover)").matches) {
      setDisplayedView(view);
      return;
    }

    // Cancel any in-progress animation (fill:forwards or fade-in)
    animRef.current?.cancel();
    animRef.current = null;
    el.style.opacity = "";

    const next = view;

    // Fade out current content
    const fadeOut = el.animate(
      [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.99 }],
      { duration: 200, easing: "ease", fill: "forwards" },
    );
    animRef.current = fadeOut;

    fadeOut.finished
      .then(() => {
        // Cancel fill:forwards so it won't compete with the fade-in
        fadeOut.cancel();
        animRef.current = null;

        // Hold at 0 via inline style while React re-renders with new content
        el.style.opacity = "0";
        setDisplayedView(next);

        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const target = contentRef.current;
            if (!target) return;
            // Clear inline hold — animation's from:{opacity:0} applies in same frame
            target.style.opacity = "";
            const fadeIn = target.animate(
              [{ opacity: 0, scale: 0.99 }, { opacity: 1, scale: 1 }],
              { duration: 200, easing: "ease" },
            );
            animRef.current = fadeIn;
            fadeIn.finished.then(() => { animRef.current = null; }).catch(() => {});
          }),
        );
      })
      .catch(() => {
        // Cancelled by a rapid subsequent view change — clear any leftover inline style
        el.style.opacity = "";
        animRef.current = null;
      });
  }, [view, displayedView]);

  return { view, setView, displayedView, contentRef };
}
