"use client";

import { GraphSidebar } from "./graph-sidebar";
import { ForceGraphView } from "./force-graph-view";

export default function UnifiedGraph() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex overflow-hidden">
      <GraphSidebar />
      <div className="flex-1 relative">
        <ForceGraphView />
      </div>
    </div>
  );
}
