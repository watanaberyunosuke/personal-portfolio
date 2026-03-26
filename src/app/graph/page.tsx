import { allPosts } from "content-collections";
import UnifiedGraph from "@/components/unified-graph/unified-graph";
import { generateGraphData } from "@/data/graph-data";

export const metadata = {
  title: "Harry's Unified Graph",
  description: "An interactive visualisation of blog posts and their MDX tags.",
};

export default function GraphPage() {
  const data = generateGraphData(allPosts);

  return <UnifiedGraph data={data} />;
}
