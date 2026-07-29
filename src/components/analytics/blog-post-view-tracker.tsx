"use client";

import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

interface BlogPostViewTrackerProps {
  readonly slug: string;
  readonly title: string;
  readonly publishedAt: string;
  readonly author?: string;
}

/**
 * Client-side view tracker for a single blog post. Rendered from the server
 * component page so the post metadata travels with the event.
 */
export default function BlogPostViewTracker({
  slug,
  title,
  publishedAt,
  author,
}: BlogPostViewTrackerProps) {
  useEffect(() => {
    trackEvent("Blog Post Viewed", { slug, title, publishedAt, author });
  }, [slug, title, publishedAt, author]);

  return null;
}
