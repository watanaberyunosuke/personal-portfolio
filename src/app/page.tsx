/* eslint-disable @next/next/no-img-element */
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import ContactSection from "@/components/section/contact-section";
import ProjectsSection from "@/components/section/projects-section";
import WorkSection from "@/components/section/work-section";
import TechStackSection from "@/components/section/tech-stack";
import GraphPreview from "@/components/section/graph-preview";
import GitHubStatus from "@/components/section/github-status";
import Commonplace from "@/components/section/commonplace";
import { ArrowUpRight } from "lucide-react";
import { SectionCard } from "@/components/section-card";

const BLUR_FADE_DELAY = 0.04;

export default function Page() {
  return (
    <main className="min-h-dvh w-full flex flex-col gap-24 py-16 relative">
      {/* 1. Hero / About Combined Module */}
      <SectionCard id="hero" delay={BLUR_FADE_DELAY} className="p-10 space-y-10">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="space-y-4 order-2 md:order-1">
            <BlurFadeText
              delay={BLUR_FADE_DELAY}
              className="text-5xl font-bold tracking-tighter"
              yOffset={8}
              text={`Hi, I'm ${DATA.name.split(" ")[0]} 👋`}
            />
            <BlurFadeText
              className="text-muted-foreground text-xl leading-relaxed max-w-[480px]"
              delay={BLUR_FADE_DELAY}
              text={DATA.description}
            />
          </div>
          <div className="order-1 md:order-2">
            <Avatar className="size-28 border-4 border-background shadow-2xl rounded-3xl ring-1 ring-border">
              <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
              <AvatarFallback>{DATA.initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="border-t pt-10">
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">About</h2>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            <div className="prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
              <Markdown>{DATA.summary}</Markdown>
            </div>
          </BlurFade>
        </div>
      </SectionCard>

      {/* 2. Graph Preview */}
      <GraphPreview />

      {/* 3. Tech Stack */}
      <SectionCard id="tech-stack" delay={BLUR_FADE_DELAY * 7} className="p-10 space-y-8">
        <TechStackSection blurFadeDelay={BLUR_FADE_DELAY} />
      </SectionCard>

      {/* 4. GitHub Status */}
      <GitHubStatus />

      {/* 5. Commonplace */}
      <Commonplace />

      {/* 6. Projects */}
      <SectionCard id="projects" delay={BLUR_FADE_DELAY * 11} className="p-10">
        <ProjectsSection />
      </SectionCard>

      {/* 7. Work & Education */}
      <SectionCard id="experience" delay={BLUR_FADE_DELAY * 13} className="p-10 space-y-12">
        <section id="work" className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Experience</h2>
          <WorkSection />
        </section>

        <section id="education" className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Education</h2>
          <div className="flex flex-col gap-8">
            {DATA.education.map((education, index) => (
              <BlurFade
                key={education.school}
                delay={BLUR_FADE_DELAY * 16 + index * 0.05}
              >
                <Link
                  href={education.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-4 justify-between group"
                >
                  <div className="flex items-center gap-x-4 flex-1 min-w-0">
                    {education.logoUrl ? (
                      <img
                        src={education.logoUrl}
                        alt={education.school}
                        className="size-14 p-2 border rounded-2xl shadow-sm ring-1 ring-border overflow-hidden object-contain flex-none bg-background group-hover:shadow-md transition-all"
                      />
                    ) : (
                      <div className="size-14 p-2 border rounded-2xl shadow-sm ring-1 ring-border bg-muted flex-none" />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="font-semibold leading-none flex items-center gap-2 text-xl">
                        {education.school}
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden />
                      </div>
                      <div className="font-sans text-muted-foreground">
                        {education.degree}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm tabular-nums text-muted-foreground text-right flex-none">
                    <span>
                      {education.start} - {education.end}
                    </span>
                  </div>
                </Link>
              </BlurFade>
            ))}
          </div>
        </section>
      </SectionCard>

      {/* 8. Contact */}
      <SectionCard id="contact" delay={BLUR_FADE_DELAY * 18} className="p-10 text-center">
        <ContactSection />
      </SectionCard>
    </main>
  );
}
