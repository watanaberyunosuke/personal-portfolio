"use client";

import { initAnalytics } from "@/lib/analytics";
import { useEffect } from "react";

/**
 * Mounted once from the root layout. Boots Amplitude Analytics and Session
 * Replay in the browser only — it renders nothing.
 */
export default function AmplitudeAnalytics() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
