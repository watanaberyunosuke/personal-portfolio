"use client";

import * as amplitude from "@amplitude/unified";

// Amplitude browser keys are public by design — they ship in the client
// bundle. This lives in the environment so dev and prod can point at separate
// Amplitude projects, and so secret scanners don't trip on it.
const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

let initialized = false;

/**
 * Initializes Amplitude Analytics + Session Replay exactly once per browser
 * session. Safe to call repeatedly — subsequent calls are no-ops.
 */
export function initAnalytics() {
  if (typeof window === "undefined" || initialized) {
    return;
  }

  if (!AMPLITUDE_API_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[analytics] NEXT_PUBLIC_AMPLITUDE_API_KEY is not set — Amplitude is disabled."
      );
    }
    return;
  }

  initialized = true;

  amplitude.initAll(AMPLITUDE_API_KEY, {
    analytics: { autocapture: true },
    sessionReplay: { sampleRate: 1 },
  });
}

/**
 * Tracks a custom event. No-ops on the server, and lazily initializes on the
 * client so an event fired before the provider's effect runs is never dropped.
 */
export function trackEvent(
  eventName: string,
  eventProperties?: Record<string, unknown>
) {
  if (typeof window === "undefined") {
    return;
  }

  initAnalytics();

  if (!initialized) {
    return;
  }

  amplitude.track(eventName, eventProperties);
}
