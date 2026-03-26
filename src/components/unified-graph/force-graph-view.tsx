"use client";

import { useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { GraphData, GraphNode } from "@/data/graph-data";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface ForceGraphViewProps {
  readonly data: GraphData;
}

export function ForceGraphView({ data }: ForceGraphViewProps) {
  const fgRef = useRef<any>(null);
  const router = useRouter();

  const graphData = useMemo(() => {
    return {
      nodes: data.nodes.map((node) => ({ ...node })),
      links: data.links.map((link) => ({ ...link })),
    };
  }, [data.links, data.nodes]);

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      <div className="absolute top-6 right-8 text-muted-foreground/50 text-xs font-mono z-10 select-none">
        {data.nodes.length} nodes • {data.links.length} links • drag • zoom • click
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: any) => node.color}
        nodeRelSize={7}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.005}
        linkColor={() => "rgba(255, 255, 255, 0.1)"}
        backgroundColor="rgba(0,0,0,0)"
        nodeVal={(node: any) => (node.group === 1 ? 1.8 : 1)}
        onNodeClick={(node: any) => {
          const graphNode = node as GraphNode & { x?: number; y?: number };

          if (fgRef.current) {
            fgRef.current.centerAt(graphNode.x, graphNode.y, 1000);
            fgRef.current.zoom(2, 1000);
          }

          if (graphNode.href) {
            window.setTimeout(() => {
              router.push(graphNode.href!);
            }, 250);
          }
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = (node.group === 1 ? 14 : 11) / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;

          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.group === 1 ? 5.5 : 4, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || "#61dafb";
          ctx.fill();

          // Add glow effect
          ctx.shadowColor = node.color || "#61dafb";
          ctx.shadowBlur = node.group === 1 ? 14 : 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw label
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle =
            node.group === 1 ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)";
          ctx.fillText(label, node.x, node.y + (node.group === 1 ? 10 : 8));
        }}
      />

      <div className="absolute bottom-8 right-8 z-10">
        <div className="px-6 py-2.5 rounded-full border bg-card/80 backdrop-blur-xl text-sm font-medium flex items-center gap-2 shadow-2xl">
          <span className="size-2 rounded-full bg-primary animate-pulse" />{" "}
          Generated from MDX tags
        </div>
      </div>
    </div>
  );
}
