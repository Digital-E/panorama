"use client";

import { useLayoutEffect, useState } from "react";

export type ViewMode =
  | "masonry"
  | "archive"
  | "archive-sharp"
  | "list"
  | "list-text"
  | "list-sharp-crop";

const STORAGE_KEY = "portfolio-view-mode";
export const DEFAULT: ViewMode = "archive";
const VALID = new Set<string>(["masonry", "archive", "archive-sharp", "list", "list-text", "list-sharp-crop"]);
const EVENT = "portfolio:view-mode";

function read(): ViewMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && VALID.has(stored) ? (stored as ViewMode) : DEFAULT;
}

function applyToDOM(mode: ViewMode) {
  document.documentElement.dataset.viewMode = mode;
}

// Module-level singleton: survives navigations, initialized eagerly on client.
let _cached: ViewMode | null = null;
if (typeof window !== "undefined") {
  _cached = read();
}

export function useViewMode() {
  const [view, setViewState] = useState<ViewMode>(() => _cached ?? DEFAULT);

  useLayoutEffect(() => {
    const current = read();
    _cached = current;
    applyToDOM(current);
    setViewState(current);

    const handler = () => {
      const v = read();
      _cached = v;
      applyToDOM(v);
      setViewState(v);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const setView = (mode: ViewMode) => {
    _cached = mode;
    localStorage.setItem(STORAGE_KEY, mode);
    applyToDOM(mode);
    window.dispatchEvent(new Event(EVENT));
  };

  return [view, setView] as const;
}
