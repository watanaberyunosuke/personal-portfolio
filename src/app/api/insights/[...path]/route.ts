import {
  AMPLITUDE_CONFIG_UPSTREAM,
  AMPLITUDE_EVENT_UPSTREAM,
} from "@/lib/amplitude-config";
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

// Statuses that must not carry a body — constructing a Response with one
// throws, which would turn a harmless upstream 304 into a 500.
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

/**
 * Headers Amplitude derives event attributes from. The client IP matters most:
 * without it every event would geolocate to the serverless region rather than
 * the visitor, silently flattening all location data.
 */
function forwardedHeaders(request: NextRequest): Headers {
  const headers = new Headers({ "Content-Type": "application/json" });

  // Vercel sends a comma-separated chain; the leftmost entry is the client.
  const forwardedFor =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const clientIp = forwardedFor?.split(",")[0]?.trim();
  if (clientIp) {
    headers.set("X-Forwarded-For", clientIp);
  }

  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    headers.set("User-Agent", userAgent);
  }

  return headers;
}

/** Mirrors an upstream response back to the browser, uncached. */
async function relayResponse(upstream: Response): Promise<NextResponse> {
  const headers = new Headers({ "Cache-Control": "no-store" });

  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const body = NULL_BODY_STATUSES.has(upstream.status)
    ? null
    : await upstream.text();

  return new NextResponse(body, { status: upstream.status, headers });
}

function errorResponse(status: number, message: string): NextResponse {
  return new NextResponse(message, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function relay(
  request: NextRequest,
  path: string[]
): Promise<NextResponse> {
  if (request.method === "POST") {
    if (path.join("/") !== "e") {
      return errorResponse(404, "Not found");
    }

    return relayResponse(
      await fetch(AMPLITUDE_EVENT_UPSTREAM, {
        method: "POST",
        headers: forwardedHeaders(request),
        body: await request.text(),
      })
    );
  }

  if (path[0] !== "c" || path.length < 2) {
    return errorResponse(404, "Not found");
  }

  const apiKey = path.slice(1).map(encodeURIComponent).join("/");

  return relayResponse(
    await fetch(`${AMPLITUDE_CONFIG_UPSTREAM}/${apiKey}${request.nextUrl.search}`, {
      method: "GET",
      headers: forwardedHeaders(request),
    })
  );
}

/**
 * Every failure path funnels through here so a relay problem shows up as a
 * retryable 502 with the cause in the function logs, rather than an opaque 500.
 */
async function handle(
  request: NextRequest,
  params: Promise<{ path: string[] }>
): Promise<NextResponse> {
  try {
    const { path } = await params;
    return await relay(request, path ?? []);
  } catch (error) {
    console.error("[insights] relay failed", {
      method: request.method,
      url: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : String(error),
    });

    // Retryable, so the SDK keeps events queued instead of dropping them.
    return errorResponse(502, "Upstream request failed");
  }
}

/** Event ingestion. The SDK POSTs its batch payload to /e. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handle(request, params);
}

/** Remote config. The SDK GETs /c/<apiKey>?<params>. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handle(request, params);
}
