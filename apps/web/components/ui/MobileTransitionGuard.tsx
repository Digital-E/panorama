"use client";

import { useEffect } from "react";

// On touch devices, bypass document.startViewTransition entirely.
// next-view-transitions calls it for every navigation; even with animation:none
// the screenshot/composite cycle causes FadeImage to flash at opacity-0.
export function MobileTransitionGuard() {
  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches) return;
    (document as any).startViewTransition = (cb: () => Promise<void> | void) => {
      const done = Promise.resolve().then(() => cb?.());
      return { ready: done, finished: done, updateCallbackDone: done, skipTransition: () => {} };
    };
  }, []);
  return null;
}
