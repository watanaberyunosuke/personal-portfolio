"use client";

import { useEffect, useState } from "react";
import type { GraphData } from "@/data/graph-data";
import { GraphSidebar } from "./graph-sidebar";
import { ForceGraphView } from "./force-graph-view";

interface UnifiedGraphProps {
  readonly data: GraphData;
}

const DEFAULT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 520;

function getMaxSidebarWidth() {
  if (typeof window === "undefined") {
    return MAX_SIDEBAR_WIDTH;
  }

  return Math.max(
    MIN_SIDEBAR_WIDTH,
    Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth - 120)
  );
}

function clampSidebarWidth(width: number) {
  return Math.min(getMaxSidebarWidth(), Math.max(MIN_SIDEBAR_WIDTH, width));
}

export default function UnifiedGraph({ data }: UnifiedGraphProps) {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setSidebarWidth((currentWidth) => clampSidebarWidth(currentWidth));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      setSidebarWidth(clampSidebarWidth(event.clientX));
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex overflow-hidden">
      <div
        className="relative shrink-0 min-w-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        <GraphSidebar data={data} />
        <button
          type="button"
          aria-label="Resize sidebar"
          aria-pressed={isResizing}
          onPointerDown={(event) => {
            event.preventDefault();
            setIsResizing(true);
          }}
          onDoubleClick={() => setSidebarWidth(DEFAULT_SIDEBAR_WIDTH)}
          className="absolute top-0 right-0 h-full w-3 translate-x-1/2 cursor-col-resize touch-none group z-30"
        >
          <span
            className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-colors ${
              isResizing ? "bg-primary" : "bg-border group-hover:bg-primary/70"
            }`}
          />
        </button>
      </div>
      <div className="flex-1 relative">
        <ForceGraphView data={data} />
      </div>
    </div>
  );
}
