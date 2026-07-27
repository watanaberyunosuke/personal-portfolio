import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PostLabelsProps {
  tags: string[];
  className?: string;
}

export default function PostLabels({ tags, className }: PostLabelsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    // role="list" is not redundant: Tailwind's preflight sets `list-style: none`,
    // which drops list semantics in Safari/VoiceOver.
    <ul
      role="list"
      className={cn("flex flex-wrap gap-2 m-0 p-0 list-none", className)}
      aria-label="Post labels"
    >
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/blog?tag=${encodeURIComponent(tag)}`}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Badge
              className="text-[11px] font-medium border border-border h-6 w-fit px-2 hover:bg-accent/50 transition-colors"
              variant="outline"
            >
              {tag}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}
