import UnifiedGraph from "@/components/unified-graph/unified-graph";
import { generateGraphData } from "@/data/graph-data";
import { getSortedPosts } from "@/lib/blog-posts";

export const metadata = {
  title: "Harry's Unified Graph",
  description: "An interactive visualisation of blog posts and their MDX tags.",
};

export default async function GraphPage() {
  const data = generateGraphData(await getSortedPosts());

  return <UnifiedGraph data={data} />;
}
