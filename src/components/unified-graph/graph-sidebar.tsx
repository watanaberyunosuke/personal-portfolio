"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";
import type { GraphData } from "@/data/graph-data";

interface SidebarSectionProps {
  readonly title: string;
  readonly count: number;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly items: { id: string; name: string; href?: string }[];
}

function SidebarSection({
  title,
  count,
  isOpen,
  onToggle,
  items,
}: SidebarSectionProps) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-lg group"
      >
        <div className="flex items-center gap-3">
          <Hash className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/50">{count}</span>
          {isOpen ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="ml-11 mt-1 space-y-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href ?? "#"}
              className="px-4 py-1.5 text-sm text-muted-foreground/80 hover:text-foreground transition-colors block"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

interface GraphSidebarProps {
  readonly data: GraphData;
}

export function GraphSidebar({ data }: GraphSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        data.sections.slice(0, 4).map((section) => [section.id, true])
      )
  );

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  return (
    <div className="w-80 h-full border-r bg-card/50 backdrop-blur-xl flex flex-col p-6 z-20">
      <div className="mb-8 flex flex-col gap-6">
        <Link
          href="/"
          className="size-10 rounded-full border bg-background flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">UNIFIED GRAPH</h1>
          <p className="text-sm text-muted-foreground">
            Blog topics generated from MDX frontmatter tags.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {data.sections.map((section) => (
          <SidebarSection
            key={section.id}
            title={section.name}
            count={section.count}
            isOpen={openSections[section.id] || false}
            onToggle={() => toggleSection(section.id)}
            items={section.items}
          />
        ))}
      </div>
    </div>
  );
}
