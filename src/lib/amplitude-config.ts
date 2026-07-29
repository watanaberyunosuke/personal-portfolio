/**
 * Shared Amplitude configuration.
 *
 * Deliberately free of a "use client" directive so both the browser SDK setup
 * and the server-side relay read the same values. Keeping the data region in
 * one place matters: when the client and the relay disagree about it, events
 * are posted to the wrong region and rejected, which is easy to misread as a
 * bad API key.
 */

// Amplitude browser keys are public by design — they ship in the client
// bundle. The project key is the default so analytics works out of the box;
// NEXT_PUBLIC_AMPLITUDE_API_KEY overrides it so dev and prod can point at
// separate Amplitude projects.
export const AMPLITUDE_API_KEY =
  process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ??
  "8ad8238d6874f5ef00343453d92acb87";

// The project above lives in the US data region. Verified against
// sr-client-cfg.amplitude.com, which returns a config for this key while the
// EU host rejects it with "Invalid API key". Set the env var to EU only
// alongside a key from an EU-region project — a mismatch is rejected outright.
export const AMPLITUDE_SERVER_ZONE =
  process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE === "EU" ? "EU" : "US";

const IS_EU = AMPLITUDE_SERVER_ZONE === "EU";

/** Event ingestion host the relay forwards to. */
export const AMPLITUDE_EVENT_UPSTREAM = IS_EU
  ? "https://api.eu.amplitude.com/2/httpapi"
  : "https://api2.amplitude.com/2/httpapi";

/** Remote config host the relay forwards to. */
export const AMPLITUDE_CONFIG_UPSTREAM = IS_EU
  ? "https://sr-client-cfg.eu.amplitude.com/config"
  : "https://sr-client-cfg.amplitude.com/config";

// Events and remote config are relayed through a same-origin path (see
// src/app/api/insights/[...path]/route.ts) so content blockers, which match on
// hostname, do not drop them. Set NEXT_PUBLIC_AMPLITUDE_PROXY=off to talk to
// Amplitude directly instead — useful when diagnosing whether a delivery
// problem is the relay or Amplitude itself.
export const AMPLITUDE_USE_PROXY =
  process.env.NEXT_PUBLIC_AMPLITUDE_PROXY !== "off";

export const AMPLITUDE_PROXY_BASE = "/api/insights";
