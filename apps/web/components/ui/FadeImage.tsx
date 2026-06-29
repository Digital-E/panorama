"use client";

import NextImage, { type ImageProps } from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

// Persists across client-side navigations — once a URL has loaded, skip the fade.
const loadedUrls = new Set<string>();

export function FadeImage({ className = "", onLoad, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const [loaded, setLoaded] = useState(() => loadedUrls.has(src));
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
      if (src) loadedUrls.add(src);
    }
  }, [src]);

  return (
    <NextImage
      {...props}
      ref={imgRef}
      onLoad={(e) => {
        setLoaded(true);
        if (src) loadedUrls.add(src);
        onLoad?.(e);
      }}
      className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
