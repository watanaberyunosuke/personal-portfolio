"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import BlurFade from "@/components/magicui/blur-fade";
import { DATA } from "@/data/resume";
import { Github, ArrowUpRight } from "lucide-react";

export default function GitHubStatus() {
  const username = DATA.contact.social.GitHub.url.split("/").pop();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const heatmapUrl = `https://gh-heat.anishroy.com/api/${username}/svg?theme=green&darkMode=${isDark ? "true" : "false"}`;

  return (
    <BlurFade delay={0.2}>
      <div className="rounded-3xl border bg-card/50 p-10 backdrop-blur-sm transition-all duration-500 hover:bg-card/80 hover:shadow-2xl hover:ring-1 hover:ring-primary/20">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex gap-5 items-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-lg">
                <Github className="size-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">GitHub Activity</h3>
                <p className="text-muted-foreground">Open source contributions and statistics</p>
              </div>
            </div>
            <a 
              href={DATA.contact.social.GitHub.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all px-6 py-3 rounded-full shadow-md hover:shadow-lg"
            >
              VIEW PROFILE <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold tracking-tight">
                  Contribution Heatmap
                </h4>
                <p className="text-sm text-muted-foreground">
                  Yearly GitHub contribution activity in a calendar view.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/30 bg-muted/20 p-4 overflow-x-auto">
              <div className="min-w-[860px]">
                <Image
                  src={heatmapUrl}
                  alt="GitHub contribution heatmap"
                  width={1200}
                  height={220}
                  className="h-auto w-full object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  );
}
