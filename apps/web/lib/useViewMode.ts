"use client";

import { useSyncExternalStore } from "react";

export type ViewMode =
  | "masonry"
  | "archive"
  | "archive-sharp"
  | "list"
  | "list-text"
  | "list-sharp-crop";

const STORAGE_KEY = "portfolio-view-mode";
const DEFAULT: ViewMode = "archive";
const VALID = new Set<string>(["masonry", "archive", "archive-sharp", "list", "list-text", "list-sharp-crop"]);
const EVENT = "portfolio:view-mode";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function getSnapshot(): ViewMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && VALID.has(stored) ? (stored as ViewMode) : DEFAULT;
}

function getServerSnapshot(): ViewMode {
  return DEFAULT;
}

export function useViewMode() {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setView = (mode: ViewMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    window.dispatchEvent(new Event(EVENT));
  };

  return [view, setView] as const;
}
