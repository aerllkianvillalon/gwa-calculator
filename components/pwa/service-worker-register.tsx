"use client";

import { useEffect } from "react";

/** Registers /sw.js in production so the app is installable and shows an offline page. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Installability is a nice-to-have; the site works fine without it.
    });
  }, []);
  return null;
}
