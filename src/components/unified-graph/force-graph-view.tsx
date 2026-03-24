"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { GRAPH_DATA } from "@/data/graph-data";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export function ForceGraphView() {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    return {
      nodes: GRAPH_DATA.nodes.map(n => ({ ...n })),
      links: GRAPH_DATA.links.map(l => ({ ...l }))
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      <div className="absolute top-6 right-8 text-muted-foreground/50 text-xs font-mono z-10 select-none">
        {GRAPH_DATA.nodes.length} nodes • drag • zoom • click
      </div>
      
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel="name"
        nodeColor={(node: any) => node.color}
        nodeRelSize={6}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.005}
        linkColor={() => "rgba(255, 255, 255, 0.1)"}
        backgroundColor="rgba(0,0,0,0)"
        onNodeClick={(node: any) => {
          if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(2, 1000);
          }
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;

          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || "#61dafb";
          ctx.fill();
          
          // Add glow effect
          ctx.shadowColor = node.color || "#61dafb";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw label
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.fillText(label, node.x, node.y + 8);
        }}
      />

      <div className="absolute bottom-8 right-8 z-10">
        <button className="px-6 py-2.5 rounded-full border bg-card/80 backdrop-blur-xl text-sm font-medium hover:bg-muted transition-all flex items-center gap-2 shadow-2xl">
          <span className="size-2 rounded-full bg-primary animate-pulse" />{" "}
          Sections Only
        </button>
      </div>
    </div>
  );
}
