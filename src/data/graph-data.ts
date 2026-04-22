export interface GraphNode {
  id: string;
  name: string;
  group: number; // 1: Tag, 2: Post
  category: string;
  color?: string;
  href?: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphSectionItem {
  id: string;
  name: string;
  href?: string;
}

export interface GraphSection {
  id: string;
  name: string;
  count: number;
  items: GraphSectionItem[];
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  sections: GraphSection[];
  stats: {
    posts: number;
    topics: number;
    connections: number;
  };
}

export interface GraphPostSource {
  title: string;
  slug: string;
  tags: readonly string[];
}

const TAG_NODE_COLOR = "#61dafb";
const POST_NODE_COLOR = "#ff007f";

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateGraphData(posts: readonly GraphPostSource[]): GraphData {
  const tagMap = new Map<
    string,
    {
      id: string;
      name: string;
      items: GraphSectionItem[];
    }
  >();
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const sortedPosts = [...posts].sort((a, b) => a.title.localeCompare(b.title));

  for (const post of sortedPosts) {
    const slug = post.slug;
    const postId = `post:${slug}`;
    const uniqueTags = [...new Set(post.tags.map((tag) => tag.trim()).filter(Boolean))];

    nodes.push({
      id: postId,
      name: post.title,
      group: 2,
      category: "post",
      color: POST_NODE_COLOR,
      href: `/blog/${slug}`,
    });

    for (const tag of uniqueTags) {
      const tagSlug = toSlug(tag);
      const tagId = `tag:${tagSlug}`;
      const existingTag = tagMap.get(tagId);

      if (!existingTag) {
        tagMap.set(tagId, {
          id: tagId,
          name: tag,
          items: [{ id: postId, name: post.title, href: `/blog/${slug}` }],
        });
        nodes.push({
          id: tagId,
          name: tag,
          group: 1,
          category: "tag",
          color: TAG_NODE_COLOR,
        });
      } else {
        existingTag.items.push({ id: postId, name: post.title, href: `/blog/${slug}` });
      }

      links.push({
        source: tagId,
        target: postId,
      });
    }
  }

  const sections: GraphSection[] = [...tagMap.values()]
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      count: tag.items.length,
      items: [...tag.items].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(b.name);
    });

  return {
    nodes,
    links,
    sections,
    stats: {
      posts: sortedPosts.length,
      topics: sections.length,
      connections: links.length,
    },
  };
}
