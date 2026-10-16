"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const { resolvedTheme } = useTheme();
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Mermaid uses the id as a DOM id and CSS selector, so strip useId's colons.
    const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    void import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "dark" ? "dark" : "default",
          fontFamily: "inherit",
        });
        const { svg: renderedSvg } = await mermaid.render(diagramId, chart);
        if (!cancelled) {
          setSvg(renderedSvg);
          setFailed(false);
        }
      })
      .catch((error) => {
        console.error("Failed to render mermaid diagram:", error);
        // mermaid.render leaves an error element in the body when parsing fails.
        document.getElementById(`d${diagramId}`)?.remove();
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [chart, reactId, resolvedTheme]);

  if (failed) {
    return (
      <pre className="my-6 overflow-x-auto rounded-xl border border-border p-4 text-sm">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div
      role="img"
      aria-label="Diagram"
      className="not-prose my-6 flex justify-center overflow-x-auto rounded-xl border border-border p-4 [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {svg ? undefined : (
        <div className="h-32 w-full animate-pulse rounded-lg bg-muted/50" />
      )}
    </div>
  );
}
