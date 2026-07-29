"use client";

import {
  AMPLITUDE_API_KEY,
  AMPLITUDE_PROXY_BASE,
  AMPLITUDE_SERVER_ZONE,
  AMPLITUDE_USE_PROXY,
} from "@/lib/amplitude-config";
import * as amplitude from "@amplitude/unified";

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

  // Absolute URLs: the SDK passes serverUrl straight to fetch, and the remote
  // config client concatenates its serverUrl with the API key.
  const origin = window.location.origin;

  amplitude.initAll(AMPLITUDE_API_KEY, {
    // Still required even when relaying — it is what routes Session Replay,
    // which has no configurable endpoint of its own.
    serverZone: AMPLITUDE_SERVER_ZONE,
    analytics: {
      autocapture: true,
      ...(AMPLITUDE_USE_PROXY && {
        serverUrl: `${origin}${AMPLITUDE_PROXY_BASE}/e`,
        remoteConfig: { serverUrl: `${origin}${AMPLITUDE_PROXY_BASE}/c` },
      }),
    },
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
