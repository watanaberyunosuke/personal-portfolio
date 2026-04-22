import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { generateGraphData } from "@/data/graph-data";
import { getSortedPosts } from "@/lib/blog-posts";

export default async function GraphPreview() {
  const stats = generateGraphData(await getSortedPosts()).stats;

  return (
    <BlurFade delay={0.1}>
      <Link href="/graph" className="group block">
        <div className="relative overflow-hidden rounded-3xl border bg-card/50 p-10 backdrop-blur-sm transition-all duration-500 hover:bg-card/80 hover:shadow-2xl hover:ring-1 hover:ring-primary/20 min-h-[300px] flex items-center">
          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                <Network className="size-7" />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-background/50 border backdrop-blur-md p-2 rounded-full px-5 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>MIND MAP
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-4xl font-bold tracking-tight">Knowledge Graph</h3>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                An interactive, force-directed map of my knowledge base, connecting projects, technologies, and philosophies.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="rounded-full border bg-background/70 px-4 py-2 font-medium shadow-sm">
                <span className="text-foreground">{stats.posts}</span>{" "}
                <span className="text-muted-foreground">blogs</span>
              </div>
              <div className="rounded-full border bg-background/70 px-4 py-2 font-medium shadow-sm">
                <span className="text-foreground">{stats.topics}</span>{" "}
                <span className="text-muted-foreground">topics</span>
              </div>
              <div className="rounded-full border bg-background/70 px-4 py-2 font-medium shadow-sm">
                <span className="text-foreground">{stats.connections}</span>{" "}
                <span className="text-muted-foreground">connections</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform duration-300">
              EXPLORE THE GRAPH <ArrowRight className="size-4" />
            </div>
          </div>

          {/* Decorative Graph Background */}
          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-110 group-hover:scale-125 transition-transform duration-1000">
              <defs>
                <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Mock nodes and links with more structure */}
              <g stroke="currentColor" strokeWidth="1.5">
                <line x1="100" y1="100" x2="300" y2="150" />
                <line x1="300" y1="150" x2="250" y2="300" />
                <line x1="250" y1="300" x2="100" y2="100" />
                <line x1="300" y1="150" x2="500" y2="100" />
                <line x1="500" y1="100" x2="650" y2="200" />
                <line x1="650" y1="200" x2="450" y2="350" />
                <line x1="450" y1="350" x2="300" y2="150" />
                <line x1="650" y1="200" x2="750" y2="50" />
              </g>
              <g fill="currentColor">
                <circle cx="100" cy="100" r="10" className="animate-pulse" />
                <circle cx="300" cy="150" r="15" />
                <circle cx="250" cy="300" r="8" />
                <circle cx="500" cy="100" r="12" />
                <circle cx="650" cy="200" r="18" />
                <circle cx="450" cy="350" r="10" />
                <circle cx="750" cy="50" r="6" />
              </g>
            </svg>
          </div>
        </div>
      </Link>
    </BlurFade>
  );
}
