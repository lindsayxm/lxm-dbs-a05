"use client";

import { useEffect, useState } from "react";

const IDLE_MS = 3000;
const HINT_MS = 6000;
const RELOAD_MS = 6 * 60 * 60 * 1000;

/**
 * Wall-screen housekeeping: hides the cursor when idle, offers the F key for
 * fullscreen, and reloads every few hours so a long-running tab picks up deploys
 * and sheds any memory growth.
 */
export function Kiosk() {
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    let idle: ReturnType<typeof setTimeout> | null = null;
    const wake = () => {
      root.classList.remove("cursor-hidden");
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => root.classList.add("cursor-hidden"), IDLE_MS);
    };
    wake();
    window.addEventListener("pointermove", wake);
    window.addEventListener("keydown", wake);

    const fine = window.matchMedia("(pointer: fine)").matches;
    const canFullscreen = Boolean(document.fullscreenEnabled);
    // Offer fullscreen a moment after mount (callback, so no synchronous setState in the effect body).
    const showHint = setTimeout(() => {
      if (fine && canFullscreen && !document.fullscreenElement) setHint(true);
    }, 400);
    const hideHint = setTimeout(() => setHint(false), HINT_MS);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "f" || event.key === "F") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        setHint(false);
      }
    };
    const onFullscreen = () => setHint(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreen);

    const reload = setTimeout(() => window.location.reload(), RELOAD_MS);

    return () => {
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreen);
      if (idle) clearTimeout(idle);
      clearTimeout(showHint);
      clearTimeout(hideHint);
      clearTimeout(reload);
      root.classList.remove("cursor-hidden");
    };
  }, []);

  if (!hint) return null;
  return (
    <p
      aria-live="polite"
      className="animate-fade-up fixed bottom-[1.4vh] left-1/2 z-30 -translate-x-1/2 rounded-full border border-cyan/50 bg-void/80 px-[1.6vw] py-[0.8vh] font-label text-[1.6vh] font-semibold tracking-[0.35em] text-cyan uppercase backdrop-blur"
    >
      Press F for fullscreen
    </p>
  );
}
