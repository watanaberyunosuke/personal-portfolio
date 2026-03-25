/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DATA } from "@/data/resume";
import { ArrowUpRight, GraduationCap } from "lucide-react";

function LogoImage({ src, alt }: { readonly src: string; readonly alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="size-16 p-1.5 border rounded-2xl shadow-sm ring-1 ring-border bg-muted flex-none flex items-center justify-center">
        <GraduationCap className="size-7 text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="size-16 p-1.5 border rounded-2xl shadow-sm ring-1 ring-border overflow-hidden object-contain flex-none bg-white group-hover:shadow-md transition-all"
      onError={() => setImageError(true)}
    />
  );
}

export default function WorkSection() {
  return (
    <Accordion type="single" collapsible className="w-full grid gap-6">
      {DATA.work.map((work) => (
        <AccordionItem
          key={work.company}
          value={work.company}
          className="w-full border-b-0 grid gap-2"
        >
          <AccordionTrigger className="hover:no-underline p-0 cursor-pointer transition-colors rounded-none group">
            <div className="flex items-center gap-x-4 justify-between w-full text-left">
              <div className="flex items-center gap-x-4 flex-1 min-w-0">
                <LogoImage src={work.logoUrl} alt={work.company} />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="font-semibold leading-none flex items-center gap-2 text-xl">
                    {work.company}
                    <ArrowUpRight
                      className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                      aria-hidden
                    />
                  </div>
                  <div className="font-sans text-muted-foreground">
                    {work.title}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm tabular-nums text-muted-foreground text-right flex-none">
                <span>
                  {work.start} - {work.end ?? "Present"}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 ml-20 text-xs sm:text-sm text-muted-foreground">
            {work.description}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
