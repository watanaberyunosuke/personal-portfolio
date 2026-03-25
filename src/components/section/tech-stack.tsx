"use client";

import Image from "next/image";
import { useState } from "react";
import { useTheme } from "next-themes";
import { DATA } from "@/data/resume";
import BlurFade from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";

const SKILL_ICON_IDS: Record<string, string> = {
  Python: "py",
  Java: "java",
  Rust: "rust",
  Go: "go",
  Scala: "scala",
  Typescript: "ts",
  React: "react",
  Angular: "angular",
  "Tailwind CSS": "tailwind",
  FastAPI: "fastapi",
  Flask: "flask",
  Django: "django",
  "Next.js": "nextjs",
  "Node.js": "nodejs",
  Databricks: "databricks",
  Snowflake: "snowflake",
  Spark: "spark",
  Kafka: "kafka",
  PostgreSQL: "postgres",
  MongoDB: "mongodb",
  "scikit-learn": "sklearn",
  TensorFlow: "tensorflow",
  PyTorch: "pytorch",
  NumPy: "numpy",
  Matplotlib: "matplotlib",
  Plotly: "plotly",
  Kotlin: "kotlin",
  Swift: "swift",
  Unity: "unity",
  "Unreal Engine": "unreal",
  "C#": "cs",
  AWS: "aws",
  Azure: "azure",
  GCP: "gcp",
  Bash: "bash",
  PowerShell: "powershell",
  Terraform: "terraform",
  Git: "git",
  Docker: "docker",
  Kubernetes: "kubernetes",
  Cloudflare: "cloudflare",
  GraphQL: "graphql",
  Prisma: "prisma",
  Markdown: "md",
  LaTeX: "latex",
};

interface TechStackSectionProps {
  readonly blurFadeDelay: number;
}

function getFallbackLabel(skill: string) {
  return skill
    .split(/[\s./#+-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SkillChip({
  skill,
  theme,
}: {
  readonly skill: string;
  readonly theme: "light" | "dark";
}) {
  const skillIconId = SKILL_ICON_IDS[skill];
  const iconUrl = skillIconId
    ? `https://skillicons.dev/icons?i=${skillIconId}&theme=${theme}`
    : null;

  return (
    <div className="flex h-full min-h-16 items-center gap-3 rounded-2xl border border-border bg-background/50 px-4 py-4 transition-all hover:bg-background hover:shadow-sm hover:ring-1 hover:ring-primary/20">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted/70 text-foreground">
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt={`${skill} icon`}
            className="size-7 object-contain"
            width={28}
            height={28}
            loading="lazy"
            unoptimized
          />
        ) : (
          <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
            {getFallbackLabel(skill)}
          </span>
        )}
      </div>
      <span className="text-sm font-medium leading-snug text-foreground">
        {skill}
      </span>
    </div>
  );
}

export default function TechStackSection({
  blurFadeDelay,
}: TechStackSectionProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const [activeSectionTitle, setActiveSectionTitle] = useState(
    DATA.techStack[0]?.title ?? ""
  );

  const activeSection =
    DATA.techStack.find((section) => section.title === activeSectionTitle) ??
    DATA.techStack[0];

  if (!activeSection) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Tech Stack</h2>
        <p className="text-muted-foreground text-lg">
          Grouped the same way as the GitHub self-introduction README.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {DATA.techStack.map((section) => {
          const isActive = section.title === activeSection.title;

          return (
            <button
              key={section.title}
              type="button"
              onClick={() => setActiveSectionTitle(section.title)}
              className={cn(
                "rounded-2xl border px-5 py-3 text-left transition-all duration-200",
                "min-w-[180px] bg-background/60 backdrop-blur-sm hover:border-primary/30 hover:bg-background",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                  : "border-border text-foreground"
              )}
              aria-pressed={isActive}
            >
              <div className="text-sm font-semibold uppercase tracking-[0.18em] opacity-80">
                {section.title}
              </div>
            </button>
          );
        })}
      </div>

      <BlurFade key={activeSection.title} delay={blurFadeDelay * 8}>
        <section className="space-y-8 pt-2">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <h3 className="shrink-0 text-xl font-bold tracking-tight">
              {activeSection.title}
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-8">
            {activeSection.groups.map((group) => (
              <div key={group.title} className="space-y-4">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {group.title}
                </div>

                {"skills" in group ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {group.skills.map((skill) => (
                      <SkillChip
                        key={`${activeSection.title}-${group.title}-${skill}`}
                        skill={skill}
                        theme={theme}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {group.subgroups.map((subgroup) => (
                      <div key={subgroup.title} className="space-y-3">
                        <div className="text-sm font-medium text-foreground/80">
                          {subgroup.title}
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                          {subgroup.skills.map((skill) => (
                            <SkillChip
                              key={`${activeSection.title}-${group.title}-${subgroup.title}-${skill}`}
                              skill={skill}
                              theme={theme}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </BlurFade>
    </div>
  );
}
