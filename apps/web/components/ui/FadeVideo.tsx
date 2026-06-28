"use client";

import { useEffect, useRef, useState } from "react";

type Props = React.VideoHTMLAttributes<HTMLVideoElement>;

export function FadeVideo({ className = "", src, onLoadedData, ...props }: Props) {
  const [ready, setReady] = useState(false);
  const [activeSrc, setActiveSrc] = useState<string | undefined>(undefined);
  const ref = useRef<HTMLVideoElement>(null);

  // Check if video data is already cached (e.g. on back-navigation).
  useEffect(() => {
    if (ref.current && ref.current.readyState >= 2) setReady(true);
  }, []);

  // Only set src once the card is near the viewport — prevents every autoPlay
  // video on the page from downloading simultaneously on load.
  // On touch/mobile devices skip entirely — poster image shows instead.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof src !== "string") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (!("IntersectionObserver" in window)) {
      setActiveSrc(src);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      {...props}
      src={activeSrc}
      preload={activeSrc ? "metadata" : "none"}
      onLoadedData={(e) => {
        setReady(true);
        onLoadedData?.(e);
      }}
      className={`transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
