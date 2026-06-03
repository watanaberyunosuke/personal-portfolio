import { CodeBlock } from "@/components/mdx/code-block";
import { MediaContainer } from "@/components/mdx/media-container";
import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactNode,
} from "react";

type CodeProps = ComponentProps<"code"> & {
  "data-language"?: string;
  node?: unknown;
};

type ParagraphProps = ComponentProps<"p"> & {
  node?: unknown;
};

type RuleProps = ComponentProps<"hr"> & {
  node?: unknown;
};

type TableProps = ComponentProps<"table"> & {
  node?: unknown;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = ComponentProps<"h1"> & {
  node?: unknown;
};

function Rule({ node: _node, ...props }: RuleProps) {
  void _node;

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

function Table({ node: _node, ...props }: TableProps) {
  void _node;

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

function InlineCode({ children, node: _node, ...props }: CodeProps) {
  void _node;

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

function isEmptyNotionParagraph(children: ParagraphProps["children"]) {
  const childArray = Children.toArray(children);

  return (
    childArray.length === 1 &&
    typeof childArray[0] === "string" &&
    childArray[0].replace(/\u00a0/g, "").trim() === ""
  );
}

function Paragraph({ children, node: _node, ...props }: ParagraphProps) {
  void _node;

  if (isEmptyNotionParagraph(children)) {
    return <div aria-hidden="true" className="notion-empty-paragraph" />;
  }

  return <p {...props}>{children}</p>;
}

function childrenToPlainText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return childrenToPlainText(child.props.children);
      }

      return "";
    })
    .join("");
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createHeading(level: HeadingLevel) {
  const HeadingTag = `h${level}` as const;

  function Heading({ children, node: _node, ...props }: HeadingProps) {
    void _node;

    const id = props.id ?? slugifyHeading(childrenToPlainText(children));

    return (
      <HeadingTag {...props} id={id}>
        {children}
      </HeadingTag>
    );
  }

  return Heading;
}

const headingComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
} as const;

export const mdxComponents = {
  MediaContainer,
  ...headingComponents,
  p: Paragraph,
  pre: (props: ComponentProps<"pre">) => <CodeBlock {...props} />,
  hr: Rule,
  table: Table,
  code: InlineCode,
} as const;

type MarkdownCodeProps = CodeProps & {
  className?: string;
};

export const markdownComponents = {
  ...headingComponents,
  p: Paragraph,
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
