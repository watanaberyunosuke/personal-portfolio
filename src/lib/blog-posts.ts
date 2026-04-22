import { allPosts } from "content-collections";

export type BlogPost = (typeof allPosts)[number];

export function getPostSlug(post: Pick<BlogPost, "slug">) {
  return post.slug;
}

export function getSortedPosts() {
  return [...allPosts].sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1;
    }

    return 1;
  });
}

export function getPostBySlug(slug: string) {
  return allPosts.find((post) => post.slug === slug);
}
