"use client";

import { useEffect, useRef, useState } from "react";

type Props = React.VideoHTMLAttributes<HTMLVideoElement>;

export function FadeVideo({ className = "", preload = "auto", onLoadedData, ...props }: Props) {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  // If the browser already has frame data by the time React mounts (e.g. from
  // cache on first load), the loadeddata event will never fire — check eagerly.
  useEffect(() => {
    if (ref.current && ref.current.readyState >= 2) setReady(true);
  }, []);

  return (
    <video
      ref={ref}
      {...props}
      preload={preload}
      onLoadedData={(e) => { setReady(true); onLoadedData?.(e); }}
      className={`transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
