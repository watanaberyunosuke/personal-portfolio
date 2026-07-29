"use client";

import * as amplitude from "@amplitude/unified";

// Amplitude browser keys are public by design — they ship in the client
// bundle. The project key is the default so analytics works out of the box;
// NEXT_PUBLIC_AMPLITUDE_API_KEY overrides it so dev and prod can point at
// separate Amplitude projects.
const AMPLITUDE_API_KEY =
  process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ??
  "8ad8238d6874f5ef00343453d92acb87";

// The Amplitude project lives in the EU data region, so events must go to the
// EU endpoint. This is not optional: the SDK defaults to 'US' and posts to
// api2.amplitude.com, where events for an EU project are accepted and then
// silently discarded — no error surfaces client-side, the data simply never
// appears. Override only when pointing at a project in another region.
const AMPLITUDE_SERVER_ZONE =
  process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE === "US" ? "US" : "EU";

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
    serverZone: AMPLITUDE_SERVER_ZONE,
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
