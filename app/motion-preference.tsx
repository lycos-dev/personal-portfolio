"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "lycos-portfolio-motion";

/** Motion starts on; a visitor's saved off choice always takes precedence. */
export function useMotionPreference() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    function sync() {
      let saved: string | null = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* Storage can be unavailable. */ }
      const full = saved !== "reduced";
      document.documentElement.dataset.motionMode = full ? "full" : "reduced";
      setEnabled(full);
    }
    sync();
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("storage", sync); delete document.documentElement.dataset.motionMode; };
  }, []);

  function toggle() {
    const next = !enabled;
    const mode = next ? "full" : "reduced";
    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* Keep the current-page choice usable. */ }
    document.documentElement.dataset.motionMode = mode;
    setEnabled(next);
  }
  return { enabled, toggle };
}

export function MotionControl({ enabled, onToggle }: { enabled: boolean | null; onToggle: () => void }) {
  return <div className="motion-control">
    <button type="button" aria-pressed={enabled !== false} aria-label="Website motion" onClick={onToggle}>
      <span className="motion-indicator" aria-hidden="true" />{enabled !== false ? "Motion on" : "Enable motion"}
    </button>
  </div>;
}
