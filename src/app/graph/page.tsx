import { allPosts } from "content-collections";
import UnifiedGraph from "@/components/unified-graph/unified-graph";
import { generateGraphData } from "@/data/graph-data";

export const metadata = {
  title: "Harry's Unified Graph",
  description: "An interactive visualisation of the portfolio's structure and content.",
};

export default function GraphPage() {
  const data = generateGraphData(allPosts);

  return <UnifiedGraph data={data} />;
}
