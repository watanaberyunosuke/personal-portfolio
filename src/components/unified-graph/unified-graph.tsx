"use client";

import type { GraphData } from "@/data/graph-data";
import { GraphSidebar } from "./graph-sidebar";
import { ForceGraphView } from "./force-graph-view";

interface UnifiedGraphProps {
  readonly data: GraphData;
}

export default function UnifiedGraph({ data }: UnifiedGraphProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex overflow-hidden">
      <GraphSidebar data={data} />
      <div className="flex-1 relative">
        <ForceGraphView data={data} />
      </div>
    </div>
  );
}
