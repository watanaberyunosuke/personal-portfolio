"use client";

import { useMemo, useState } from "react";
import { DATA } from "@/data/resume";
import { Book, Lightbulb, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = [Book, Lightbulb, Wrench] as const;

export default function Commonplace() {
  const sections = useMemo(
    () =>
      DATA.commonplace.map((section, idx) => ({
        ...section,
        Icon: ICONS[idx % ICONS.length],
      })),
    []
  );

  const [activeTab, setActiveTab] = useState(sections[0]?.title ?? "");

  const activeSection =
    sections.find((section) => section.title === activeTab) ?? sections[0];

  if (!activeSection) {
    return null;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-bold tracking-tight">Commonplace</h2>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
          A curated collection of books, philosophies, and tools that have shaped
          my perspective and workflow.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {sections.map((section) => {
          const isActive = section.title === activeSection.title;

          return (
            <button
              key={section.title}
              type="button"
              onClick={() => setActiveTab(section.title)}
              className={cn(
                "rounded-2xl border px-5 py-3 text-left transition-all duration-200",
                "min-w-[180px] bg-background/60 backdrop-blur-sm hover:border-primary/30 hover:bg-background",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                  : "border-border text-foreground"
              )}
              aria-pressed={isActive}
            >
              <div className="text-sm font-semibold uppercase tracking-[0.18em] opacity-80">
                {section.title}
              </div>
              <div
                className={cn(
                  "mt-1 text-sm",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {section.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border bg-card/50 p-8 md:p-10 backdrop-blur-sm shadow-sm">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,320px)_1fr] xl:items-start">
          <div className="space-y-5">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <activeSection.Icon className="size-7" />
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Commonplace
              </div>
              <h3 className="text-3xl font-bold tracking-tight">
                {activeSection.title}
              </h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {activeSection.subtitle}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeSection.items.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-background/70 px-5 py-6 shadow-sm transition-colors hover:border-primary/20 hover:bg-background"
              >
                <div className="text-base font-semibold text-foreground">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
