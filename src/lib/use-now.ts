"use client";

import { useSyncExternalStore } from "react";
import { torontoStamp } from "./format";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearInterval(id);
    document.removeEventListener("visibilitychange", onChange);
  };
}

export function useTorontoNow(fallback: string) {
  return useSyncExternalStore(subscribe, () => torontoStamp(new Date()), () => fallback);
}
