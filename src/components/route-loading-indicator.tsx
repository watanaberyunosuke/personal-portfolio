"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const MIN_VISIBLE_MS = 350;
const INITIAL_VISIBLE_MS = 450;
const MAX_VISIBLE_MS = 8000;

export default function RouteLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const shownAtRef = useRef(0);
  const pendingRouteRef = useRef<string | null>(null);
  const currentUrl = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    shownAtRef.current = Date.now();

    const hideInitial = window.setTimeout(() => {
      setIsLoading(false);
    }, INITIAL_VISIBLE_MS);

    return () => window.clearTimeout(hideInitial);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    if (pendingRouteRef.current && pendingRouteRef.current !== currentUrl) {
      return;
    }

    pendingRouteRef.current = null;
    const elapsed = Date.now() - shownAtRef.current;
    const hideDelay = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    const hide = window.setTimeout(() => {
      setIsLoading(false);
    }, hideDelay);

    return () => window.clearTimeout(hide);
  }, [currentUrl, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const fallback = window.setTimeout(() => {
      setIsLoading(false);
    }, MAX_VISIBLE_MS);

    return () => window.clearTimeout(fallback);
  }, [isLoading]);

  useEffect(() => {
    const show = (targetRoute: string) => {
      pendingRouteRef.current = targetRoute;
      shownAtRef.current = Date.now();
      setIsLoading(true);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);

      if (destination.origin !== current.origin) {
        return;
      }

      const destinationRoute = destination.pathname + destination.search;
      const currentRoute = current.pathname + current.search;

      if (destinationRoute === currentRoute) {
        return;
      }

      show(destinationRoute);
    };

    const handlePageShow = () => setIsLoading(false);

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-background/85 backdrop-blur-sm"
    >
      <div className="flex items-center gap-4 rounded-lg border bg-card px-5 py-4 shadow-lg">
        <div
          aria-hidden="true"
          className="relative size-10 flex-none rounded-full border border-border bg-background"
        >
          <div className="absolute inset-2 rounded-full border-2 border-muted" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-foreground animate-spin" />
        </div>
        <span className="text-sm font-medium text-foreground">Loading</span>
      </div>
    </div>
  );
}
