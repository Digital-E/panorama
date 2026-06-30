"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTransitionManager() {
  const router = useRouter();
  const outAnim = useRef<Animation | null>(null);
  const headerAnim = useRef<Animation | null>(null);

  useEffect(() => {
    const handleClick = async (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!window.matchMedia("(hover: hover)").matches) return;

      const anchor = (e.target as Element).closest("a");
      if (!anchor || anchor.target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("//")) return;
      if (anchor.hasAttribute("download")) return;

      const dest = new URL(anchor.href, window.location.origin);
      if (dest.origin !== window.location.origin) return;
      if (dest.pathname === window.location.pathname) return;

      e.preventDefault();

      outAnim.current?.cancel();
      headerAnim.current?.cancel();

      const content = document.querySelector("[data-page-content]") as HTMLElement | null;
      const header = document.querySelector("[data-slide-header]") as HTMLElement | null;

      const pending: Promise<Animation>[] = [];

      if (content) {
        outAnim.current = content.animate(
          [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.99 }],
          { duration: 300, easing: "ease", fill: "forwards" },
        );
        pending.push(outAnim.current.finished);
      }

      if (header) {
        headerAnim.current = header.animate(
          [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-10px)" }],
          { duration: 250, easing: "ease", fill: "forwards" },
        );
        pending.push(headerAnim.current.finished);
      }

      await Promise.all(pending);

      router.push(dest.pathname + dest.search + dest.hash);
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [router]);

  return null;
}
