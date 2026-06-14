"use client";

import NextImage, { type ImageProps } from "next/image";
import { useState } from "react";

export function FadeImage({ className = "", onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <NextImage
      {...props}
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
