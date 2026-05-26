import BlurFade from "@/components/magicui/blur-fade";
import { getPostSlug, getSortedPosts } from "@/lib/blog-posts";
import { ArrowRight, ChevronRight, PenLine } from "lucide-react";
import Link from "next/link";

const BLUR_FADE_DELAY = 0.04;
const POST_PREVIEW_COUNT = 3;

function formatPostDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function BlogPreview() {
  const posts = (await getSortedPosts()).slice(0, POST_PREVIEW_COUNT);
  const [featuredPost, ...secondaryPosts] = posts;

  if (!featuredPost) {
    return (
      <BlurFade delay={BLUR_FADE_DELAY * 5}>
        <section id="blog" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col gap-3 rounded-3xl border bg-card/50 p-10 backdrop-blur-sm">
            <h2 className="text-4xl font-bold tracking-tight">Latest Writing</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Blog posts will appear here once they are published.
            </p>
          </div>
        </section>
      </BlurFade>
    );
  }

  const featuredSlug = getPostSlug(featuredPost);

  return (
    <BlurFade delay={BLUR_FADE_DELAY * 5}>
      <section id="blog" className="scroll-mt-24 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <PenLine className="size-7" aria-hidden />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-bold tracking-tight">Latest Writing</h2>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Recent notes on software, systems, and the ideas I keep returning to.
              </p>
            </div>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-transform duration-300 hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            VIEW ALL POSTS <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <Link
            href={`/blog/${featuredSlug}`}
            className="group flex min-h-[260px] flex-col justify-between rounded-2xl border bg-background/70 p-7 shadow-sm transition-all duration-300 hover:border-primary/20 hover:bg-background hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>{formatPostDate(featuredPost.publishedAt)}</span>
                {featuredPost.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border bg-card px-3 py-1 normal-case tracking-normal"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold tracking-tight transition-colors group-hover:text-primary">
                  {featuredPost.title}
                </h3>
                <p className="line-clamp-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {featuredPost.summary}
                </p>
              </div>
            </div>
            <div className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary">
              READ LATEST{" "}
              <ChevronRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </div>
          </Link>

          <div className="flex flex-col divide-y divide-border rounded-2xl border bg-background/50">
            {secondaryPosts.length > 0 ? (
              secondaryPosts.map((post) => {
                const slug = getPostSlug(post);

                return (
                  <Link
                    key={slug}
                    href={`/blog/${slug}`}
                    className="group flex flex-1 flex-col justify-center gap-3 p-6 transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="text-xs font-medium text-muted-foreground">
                      {formatPostDate(post.publishedAt)}
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
                        {post.title}
                      </h3>
                      <ChevronRight
                        className="mt-1 size-4 flex-none -translate-x-2 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden
                      />
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {post.summary}
                    </p>
                  </Link>
                );
              })
            ) : (
              <div className="flex flex-1 items-center p-6 text-sm leading-relaxed text-muted-foreground">
                More posts will appear here as the archive grows.
              </div>
            )}
          </div>
        </div>
      </section>
    </BlurFade>
  );
}
