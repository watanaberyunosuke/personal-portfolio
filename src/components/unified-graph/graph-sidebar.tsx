"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, User, Briefcase, Folder, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { GRAPH_DATA } from "@/data/graph-data";

interface SidebarSectionProps {
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly count: number;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly items: { id: string; name: string }[];
}

function SidebarSection({ title, icon, count, isOpen, onToggle, items }: SidebarSectionProps) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-lg group"
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </span>
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/50">{count}</span>
          {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </div>
      </button>
      {isOpen && (
        <div className="ml-11 mt-1 space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="px-4 py-1.5 text-sm text-muted-foreground/80 hover:text-foreground cursor-pointer transition-colors"
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GraphSidebar() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "About Me": true,
    "Professional": true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const sections = [
    { title: "About Me", icon: <User className="size-5" />, category: "about-me" },
    { title: "Professional", icon: <Briefcase className="size-5" />, category: "professional" },
    { title: "Projects", icon: <Folder className="size-5" />, category: "projects" },
    { title: "Places", icon: <MapPin className="size-5" />, category: "places" },
  ];

  return (
    <div className="w-80 h-full border-r bg-card/50 backdrop-blur-xl flex flex-col p-6 z-20">
      <div className="mb-8 flex flex-col gap-6">
        <Link href="/" className="size-10 rounded-full border bg-background flex items-center justify-center hover:bg-muted transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">UNIFIED GRAPH</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {sections.map((section) => {
          const items = GRAPH_DATA.nodes.filter(n => n.category === section.category && n.group === 2);
          return (
            <SidebarSection
              key={section.title}
              title={section.title}
              icon={section.icon}
              count={items.length}
              isOpen={openSections[section.title] || false}
              onToggle={() => toggleSection(section.title)}
              items={items}
            />
          );
        })}
      </div>
    </div>
  );
}
