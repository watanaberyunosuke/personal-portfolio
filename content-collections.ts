import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { remarkCodeMeta } from "./src/lib/remark-code-meta";

const posts = defineCollection({
    name: "posts",
    directory: "content",
    include: "**/*.mdx",
    schema: z.object({
        title: z.string(),
        slug: z.string().optional(),
        publishedAt: z.string(),
        updatedAt: z.string().optional(),
        author: z.string().optional(),
        summary: z.string(),
        image: z.string().optional(),
        tags: z.array(z.string()).min(1),
        content: z.string(),
    }),
    transform: async (document, context) => {
        const defaultSlug = document._meta.path
            .split("/")
            .filter(Boolean)
            .pop() ?? document._meta.path;
        const mdx = await compileMDX(context, document, {
            remarkPlugins: [remarkGfm, remarkCodeMeta],
        });
        return {
            ...document,
            slug: document.slug?.trim() || defaultSlug,
            mdx,
        };
    },
});

export default defineConfig({
    collections: [posts],
});
