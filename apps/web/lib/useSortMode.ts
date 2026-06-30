"use client";

import { useSyncExternalStore } from "react";

type SortMode = "default" | "az" | "year";
const KEY = "portfolio-sort-mode";
const EVENT = "portfolio:sort-mode";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function getSnapshot(): SortMode {
  const stored = localStorage.getItem(KEY);
  return stored === "az" || stored === "year" ? stored : "default";
}

function getServerSnapshot(): SortMode {
  return "default";
}

export function useSortMode() {
  const sort = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setSortMode = (s: SortMode) => {
    localStorage.setItem(KEY, s);
    window.dispatchEvent(new Event(EVENT));
  };

  return [sort, setSortMode] as const;
}
