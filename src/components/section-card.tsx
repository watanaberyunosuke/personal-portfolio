import { cn } from "@/lib/utils";
import BlurFade from "@/components/magicui/blur-fade";

interface SectionCardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly id?: string;
}

export function SectionCard({ children, className, delay = 0.04, id }: SectionCardProps) {
  return (
    <BlurFade delay={delay}>
      <section 
        id={id}
        className={cn(
          "rounded-3xl border bg-card/50 backdrop-blur-sm p-8 shadow-sm transition-all hover:shadow-md",
          className
        )}
      >
        {children}
      </section>
    </BlurFade>
  );
}
