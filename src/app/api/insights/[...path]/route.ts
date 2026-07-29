import { NextRequest, NextResponse } from "next/server";

/**
 * First-party relay for Amplitude.
 *
 * Content blockers match on hostname, so a browser request straight to
 * amplitude.com is dropped before it leaves the machine. Routing through this
 * same-origin path means the browser only ever talks to our own domain, and
 * the server-to-server hop to Amplitude is not subject to client-side blocking.
 *
 * Only the two endpoints the analytics SDK lets us redirect are relayed:
 * event ingestion and remote config. Session Replay hard-codes its own hosts,
 * so its traffic still goes direct and is still blockable.
 */

// Relaying is inherently per-request; never cache or prerender it.
export const dynamic = "force-dynamic";

const EVENT_UPSTREAM = "https://api.eu.amplitude.com/2/httpapi";
const CONFIG_UPSTREAM = "https://sr-client-cfg.eu.amplitude.com/config";

/**
 * Headers Amplitude derives event attributes from. The client IP matters most:
 * without it every event would geolocate to the serverless region rather than
 * the visitor, silently flattening all location data.
 */
function forwardedHeaders(request: NextRequest): Headers {
  const headers = new Headers({ "Content-Type": "application/json" });

  const clientIp =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  if (clientIp) {
    headers.set("X-Forwarded-For", clientIp);
  }

  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    headers.set("User-Agent", userAgent);
  }

  return headers;
}

function noStore(body: BodyInit | null, status: number): NextResponse {
  return new NextResponse(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Event ingestion. The SDK POSTs its batch payload here. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (path.join("/") !== "e") {
    return noStore("Not found", 404);
  }

  try {
    const upstream = await fetch(EVENT_UPSTREAM, {
      method: "POST",
      headers: forwardedHeaders(request),
      body: await request.text(),
    });

    return noStore(await upstream.text(), upstream.status);
  } catch {
    // Surface a retryable status so the SDK keeps the events queued rather
    // than treating them as permanently rejected.
    return noStore("Upstream request failed", 502);
  }
}

/** Remote config. The SDK GETs /c/<apiKey>?<params>. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (path[0] !== "c" || path.length < 2) {
    return noStore("Not found", 404);
  }

  const apiKey = path.slice(1).map(encodeURIComponent).join("/");
  const query = request.nextUrl.search;

  try {
    const upstream = await fetch(`${CONFIG_UPSTREAM}/${apiKey}${query}`, {
      method: "GET",
      headers: forwardedHeaders(request),
    });

    return noStore(await upstream.text(), upstream.status);
  } catch {
    return noStore("Upstream request failed", 502);
  }
}
