import { CodeBlock } from "@/components/mdx/code-block";
import { MediaContainer } from "@/components/mdx/media-container";
import type { ComponentProps } from "react";

type CodeProps = ComponentProps<"code"> & {
  "data-language"?: string;
};

function Rule(props: ComponentProps<"hr">) {
  return (
    <div className="my-10 flex w-full items-center" {...props}>
      <div
        className="flex-1 h-px bg-border"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      />
    </div>
  );
}

function Table(props: ComponentProps<"table">) {
  return (
    <div className="my-6 border border-border rounded-xl overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table
          className="m-0! w-full min-w-full border-separate border-spacing-0"
          {...props}
        />
      </div>
    </div>
  );
}

function InlineCode({ children, ...props }: CodeProps) {
  if (props["data-language"]) {
    return <code {...props}>{children}</code>;
  }

  return (
    <code
      className="px-1.5 py-0.5 rounded-md bg-muted/60 dark:bg-muted/40 text-sm font-mono text-foreground/90"
      {...props}
    >
      {children}
    </code>
  );
}

export const mdxComponents = {
  MediaContainer,
  pre: (props: ComponentProps<"pre">) => <CodeBlock {...props} />,
  hr: Rule,
  table: Table,
  code: InlineCode,
} as const;

type MarkdownCodeProps = ComponentProps<"code"> & {
  className?: string;
};

export const markdownComponents = {
  pre: (props: ComponentProps<"pre">) => <CodeBlock {...props} />,
  hr: Rule,
  table: Table,
  img: ({ src, alt }: ComponentProps<"img">) => {
    if (typeof src !== "string" || !src) {
      return null;
    }

    return <MediaContainer src={src} alt={alt} />;
  },
  code: ({ children, className, ...props }: MarkdownCodeProps) => (
    <InlineCode
      {...props}
      className={className}
      data-language={className?.includes("language-") ? className : undefined}
    >
      {children}
    </InlineCode>
  ),
} as const;
