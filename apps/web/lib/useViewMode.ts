"use client";

import { useState, useEffect } from "react";

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

export function useViewMode() {
  const [view, setViewState] = useState<ViewMode>(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID.has(stored)) setViewState(stored as ViewMode);
  }, []);

  const setView = (mode: ViewMode) => {
    setViewState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  return [view, setView] as const;
}
