"use client";

import { HOMEPAGE_SECTIONS } from "@/data/homepage-sections";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type HomepageSectionId = (typeof HOMEPAGE_SECTIONS)[number]["id"];

export default function HomepageSideNav() {
  const [activeId, setActiveId] = useState<HomepageSectionId>(
    HOMEPAGE_SECTIONS[0].id
  );

  useEffect(() => {
    const sectionElements = HOMEPAGE_SECTIONS.map((section) =>
      document.getElementById(section.id)
    ).filter((element): element is HTMLElement => Boolean(element));

    if (sectionElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const nextActiveId = visibleEntry?.target.id;

        if (
          nextActiveId &&
          HOMEPAGE_SECTIONS.some((section) => section.id === nextActiveId)
        ) {
          setActiveId(nextActiveId as HomepageSectionId);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="sticky top-24 z-20 hidden h-fit py-16 xl:block">
      <nav
        aria-label="Homepage sections"
        className="group/nav relative w-14 overflow-visible rounded-2xl border border-transparent bg-background/60 py-3 pl-5 pr-3 text-sm backdrop-blur-sm transition-all duration-300 hover:w-48 hover:border-border hover:shadow-lg focus-within:w-48 focus-within:border-border focus-within:shadow-lg"
      >
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border opacity-0 transition-opacity duration-200 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100" />
        <ol className="space-y-4">
          {HOMEPAGE_SECTIONS.map((section, index) => {
            const isActive = activeId === section.id;

            return (
              <li key={section.id} className="relative">
                <span
                  className={cn(
                    "pointer-events-none absolute left-[7px] top-1/2 z-0 h-px w-8 -translate-y-1/2 transition-all duration-200",
                    isActive
                      ? "bg-primary opacity-0 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100"
                      : "bg-border opacity-0 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100"
                  )}
                  aria-hidden
                />
                <a
                  href={`#${section.id}`}
                  className={cn(
                    "group grid w-40 grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-3 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={isActive ? "location" : undefined}
                >
                  <span
                    className={cn(
                      "relative z-10 flex size-3 items-center justify-center rounded-full border bg-background transition-all",
                      isActive
                        ? "border-primary ring-4 ring-primary/10"
                        : "border-border group-hover:border-primary/50"
                    )}
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full bg-primary transition-opacity",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "min-w-0 -translate-x-1 whitespace-nowrap opacity-0 transition-all duration-200 group-hover/nav:translate-x-0 group-hover/nav:opacity-100 group-focus-within/nav:translate-x-0 group-focus-within/nav:opacity-100",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="block font-mono text-[11px] leading-none text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-1 block truncate font-medium">
                      {section.label}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
