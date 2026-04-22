import { cache } from "react";
import { allPosts } from "content-collections";

type NotionQueryValue = string | undefined;
type LocalCompiledPost = (typeof allPosts)[number];

interface NotionRequestOptions {
  token: string;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  query?: Record<string, NotionQueryValue>;
}

interface NotionListResponse<T> {
  results?: T[];
  has_more?: boolean;
  next_cursor?: string | null;
}

interface NotionRichTextItem {
  plain_text?: string;
  href?: string | null;
  text?: {
    link?: {
      url?: string;
    } | null;
  } | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
}

interface NotionFormulaValue {
  type?: "string" | "number" | "boolean" | "date";
  string?: string | null;
  number?: number | null;
  boolean?: boolean | null;
  date?: {
    start?: string | null;
  } | null;
}

interface NotionPropertyValue {
  type: string;
  title?: NotionRichTextItem[];
  rich_text?: NotionRichTextItem[];
  url?: string | null;
  email?: string | null;
  phone_number?: string | null;
  select?: {
    name?: string | null;
  } | null;
  status?: {
    name?: string | null;
  } | null;
  formula?: NotionFormulaValue | null;
  date?: {
    start?: string | null;
  } | null;
  people?: Array<{
    name?: string | null;
  }>;
  files?: NotionFileLike[];
  checkbox?: boolean;
  multi_select?: Array<{
    name?: string | null;
  }>;
}

interface NotionFileLike {
  type?: "external" | "file";
  external?: {
    url?: string | null;
  } | null;
  file?: {
    url?: string | null;
  } | null;
  url?: string | null;
}

interface NotionPage {
  object: "page";
  id: string;
  in_trash?: boolean;
  properties?: Record<string, NotionPropertyValue>;
  created_time?: string;
  last_edited_time?: string;
  created_by?: {
    name?: string | null;
  } | null;
  cover?: NotionFileLike | null;
}

interface NotionDataSourceResponse {
  data_sources?: Array<{
    id?: string;
  }>;
}

interface NotionBlock {
  id: string;
  object?: "block";
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  paragraph?: {
    rich_text?: NotionRichTextItem[];
  };
  heading_1?: {
    rich_text?: NotionRichTextItem[];
  };
  heading_2?: {
    rich_text?: NotionRichTextItem[];
  };
  heading_3?: {
    rich_text?: NotionRichTextItem[];
  };
  bulleted_list_item?: {
    rich_text?: NotionRichTextItem[];
  };
  numbered_list_item?: {
    rich_text?: NotionRichTextItem[];
  };
  to_do?: {
    checked?: boolean;
    rich_text?: NotionRichTextItem[];
  };
  quote?: {
    rich_text?: NotionRichTextItem[];
  };
  callout?: {
    rich_text?: NotionRichTextItem[];
    icon?: {
      type?: "emoji";
      emoji?: string | null;
    } | null;
  };
  code?: {
    language?: string;
    rich_text?: NotionRichTextItem[];
  };
  image?: NotionFileLike & {
    caption?: NotionRichTextItem[];
  };
  video?: NotionFileLike & {
    caption?: NotionRichTextItem[];
  };
  file?: NotionFileLike;
  pdf?: NotionFileLike;
  audio?: NotionFileLike;
  bookmark?: {
    url?: string | null;
  };
  embed?: {
    url?: string | null;
  };
  link_preview?: {
    url?: string | null;
  };
  equation?: {
    expression?: string | null;
  };
  table_row?: {
    cells?: NotionRichTextItem[][];
  };
  toggle?: {
    rich_text?: NotionRichTextItem[];
  };
}

interface GenericBlockData extends NotionFileLike {
  rich_text?: NotionRichTextItem[];
  checked?: boolean;
  icon?: {
    type?: "emoji";
    emoji?: string | null;
  } | null;
  language?: string;
  caption?: NotionRichTextItem[];
  url?: string | null;
  expression?: string | null;
  cells?: NotionRichTextItem[][];
}

interface BlogPostBase {
  title: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string | null;
  author?: string;
  summary: string;
  image?: string;
  tags: string[];
}

export interface LocalBlogPost extends BlogPostBase {
  source: "local";
  content: {
    kind: "mdx";
    code: LocalCompiledPost["mdx"];
  };
}

export interface NotionBlogPostSummary extends BlogPostBase {
  source: "notion";
  notionPageId: string;
}

export interface NotionBlogPost extends NotionBlogPostSummary {
  content: {
    kind: "markdown";
    markdown: string;
  };
}

export type BlogPostListItem = Omit<LocalBlogPost, "content"> | NotionBlogPostSummary;
export type BlogPost = LocalBlogPost | NotionBlogPost;

const NOTION_API_BASE_URL = "https://api.notion.com/v1";
const DEFAULT_NOTION_VERSION = process.env.NOTION_API_VERSION ?? "2026-03-11";

const PROPERTY_ALIASES = {
  title: splitAliases(process.env.NOTION_BLOG_TITLE_PROPERTY, ["Title", "Name"]),
  slug: splitAliases(process.env.NOTION_BLOG_SLUG_PROPERTY, ["Slug", "URL Slug"]),
  summary: splitAliases(process.env.NOTION_BLOG_SUMMARY_PROPERTY, [
    "Summary",
    "Description",
    "Excerpt",
  ]),
  publishedAt: splitAliases(process.env.NOTION_BLOG_PUBLISHED_AT_PROPERTY, [
    "Published At",
    "Publish Date",
    "Date",
  ]),
  updatedAt: splitAliases(process.env.NOTION_BLOG_UPDATED_AT_PROPERTY, [
    "Updated At",
    "Last Updated",
  ]),
  author: splitAliases(process.env.NOTION_BLOG_AUTHOR_PROPERTY, ["Author", "By"]),
  image: splitAliases(process.env.NOTION_BLOG_IMAGE_PROPERTY, [
    "Image",
    "Cover Image",
    "Hero Image",
  ]),
  tags: splitAliases(process.env.NOTION_BLOG_TAGS_PROPERTY, ["Tags", "Topics"]),
  published: splitAliases(process.env.NOTION_BLOG_PUBLISHED_PROPERTY, [
    "Published",
    "Publish",
    "Live",
  ]),
  status: splitAliases(process.env.NOTION_BLOG_STATUS_PROPERTY, ["Status"]),
};

const localPosts: LocalBlogPost[] = allPosts
  .filter((post) => post._meta.directory !== "notion")
  .map((post) => ({
    source: "local",
    title: post.title,
    slug: post.slug,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    author: post.author,
    summary: post.summary,
    image: post.image,
    tags: [...post.tags],
    content: {
      kind: "mdx",
      code: post.mdx,
    },
  }));

const localPostsBySlug = new Map(localPosts.map((post) => [post.slug, post]));

function toListItem(post: LocalBlogPost): BlogPostListItem {
  const { content: _content, ...summary } = post;
  return summary;
}

function sortPosts(posts: readonly BlogPostListItem[]) {
  return [...posts].sort((a, b) => {
    const publishedAtDiff =
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

    if (publishedAtDiff !== 0) {
      return publishedAtDiff;
    }

    return a.title.localeCompare(b.title);
  });
}

export function getPostSlug(post: Pick<BlogPostListItem, "slug">) {
  return post.slug;
}

const getNotionPostIndex = cache(async (): Promise<NotionBlogPostSummary[]> => {
  const token = process.env.NOTION_TOKEN;
  const dataSourceInput =
    process.env.NOTION_BLOG_DATA_SOURCE_ID ?? process.env.NOTION_BLOG_DATABASE_ID;

  if (!token || !dataSourceInput) {
    return [];
  }

  try {
    const dataSourceId = await resolveDataSourceId({
      token,
      input: dataSourceInput,
    });
    const pages = await queryAllPages({ token, dataSourceId });

    return pages
      .filter((page) => isPublishedPage(page))
      .map((page) => buildNotionPostSummary(page))
      .filter((post): post is NotionBlogPostSummary => Boolean(post));
  } catch (error) {
    console.error("Failed to load Notion blog posts at runtime:", error);
    return [];
  }
});

const getNotionPostMarkdown = cache(async (pageId: string): Promise<string> => {
  const token = process.env.NOTION_TOKEN;

  if (!token) {
    return "";
  }

  try {
    const rawMarkdown =
      (await readPageMarkdown({ token, pageId })) ||
      (await readMarkdownFromBlocks({ token, blockId: pageId }));

    return sanitizeNotionMarkdown(rawMarkdown);
  } catch (error) {
    console.error(`Failed to load Notion markdown for page ${pageId}:`, error);
    return "";
  }
});

export const getSortedPosts = cache(async (): Promise<BlogPostListItem[]> => {
  const postMap = new Map<string, BlogPostListItem>();

  for (const post of localPosts) {
    postMap.set(post.slug, toListItem(post));
  }

  for (const post of await getNotionPostIndex()) {
    if (!postMap.has(post.slug)) {
      postMap.set(post.slug, post);
    }
  }

  return sortPosts([...postMap.values()]);
});

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const localPost = localPostsBySlug.get(slug);

  if (localPost) {
    return localPost;
  }

  const notionPost = (await getNotionPostIndex()).find((post) => post.slug === slug);

  if (!notionPost) {
    return null;
  }

  const markdown = await getNotionPostMarkdown(notionPost.notionPageId);

  return {
    ...notionPost,
    summary: notionPost.summary || extractSummary(markdown),
    content: {
      kind: "markdown",
      markdown,
    },
  };
});

function buildNotionPostSummary(page: NotionPage): NotionBlogPostSummary | null {
  const properties = page.properties ?? {};
  const title =
    readStringProperty(properties, PROPERTY_ALIASES.title, ["title"], true) ?? "";
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    return null;
  }

  const slug = normalizeSlug(
    readStringProperty(properties, PROPERTY_ALIASES.slug, [
      "rich_text",
      "formula",
      "title",
    ]) ?? cleanTitle
  );

  if (!slug) {
    return null;
  }

  const publishedAt =
    readDateProperty(properties, PROPERTY_ALIASES.publishedAt) ??
    page.created_time?.slice(0, 10) ??
    new Date().toISOString().slice(0, 10);

  return {
    source: "notion",
    notionPageId: page.id,
    title: cleanTitle,
    slug,
    publishedAt,
    updatedAt:
      readDateProperty(properties, PROPERTY_ALIASES.updatedAt) ??
      page.last_edited_time?.slice(0, 10),
    author:
      readAuthorProperty(properties, PROPERTY_ALIASES.author) ??
      page.created_by?.name ??
      undefined,
    summary:
      readStringProperty(properties, PROPERTY_ALIASES.summary, [
        "rich_text",
        "formula",
        "title",
      ]) ?? "Synced from Notion.",
    image:
      readImageProperty(properties, PROPERTY_ALIASES.image) ??
      extractCoverUrl(page.cover) ??
      undefined,
    tags: (() => {
      const tags = readTagsProperty(properties, PROPERTY_ALIASES.tags);
      return tags.length > 0 ? tags : ["Notion"];
    })(),
  };
}

async function resolveDataSourceId({
  token,
  input,
}: {
  token: string;
  input: string;
}) {
  const normalized = normalizeNotionId(input);

  if (!normalized) {
    throw new Error(`Could not extract a Notion ID from "${input}".`);
  }

  if (process.env.NOTION_BLOG_DATA_SOURCE_ID) {
    return normalized;
  }

  const database = (await notionRequest(`/databases/${normalized}`, {
    token,
  })) as NotionDataSourceResponse;
  const firstDataSource = database?.data_sources?.[0]?.id;

  if (!firstDataSource) {
    throw new Error(
      "The configured Notion database does not expose a data source. Set NOTION_BLOG_DATA_SOURCE_ID directly instead."
    );
  }

  return normalizeNotionId(firstDataSource);
}

async function queryAllPages({
  token,
  dataSourceId,
}: {
  token: string;
  dataSourceId: string;
}) {
  const pages: NotionPage[] = [];
  let nextCursor: string | undefined;

  do {
    const payload = (await notionRequest(`/data_sources/${dataSourceId}/query`, {
      token,
      method: "POST",
      body: {
        page_size: 100,
        ...(nextCursor ? { start_cursor: nextCursor } : {}),
      },
    })) as NotionListResponse<NotionPage>;

    pages.push(...(payload.results ?? []));
    nextCursor = payload.has_more ? payload.next_cursor ?? undefined : undefined;
  } while (nextCursor);

  return pages.filter((page) => page.object === "page" && !page.in_trash);
}

async function readPageMarkdown({
  token,
  pageId,
}: {
  token: string;
  pageId: string;
}) {
  try {
    const payload = await notionRequest(`/pages/${pageId}/markdown`, { token });
    return extractMarkdownString(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("404") || message.includes("400")) {
      return "";
    }

    throw error;
  }
}

async function readMarkdownFromBlocks({
  token,
  blockId,
}: {
  token: string;
  blockId: string;
}) {
  const tree = await fetchBlockTree({ token, blockId });
  return renderBlocks(tree).trim();
}

async function fetchBlockTree({
  token,
  blockId,
}: {
  token: string;
  blockId: string;
}): Promise<NotionBlock[]> {
  const children: NotionBlock[] = [];
  let nextCursor: string | undefined;

  do {
    const payload = (await notionRequest(
      `/blocks/${blockId}/children?page_size=100`,
      {
        token,
        query: nextCursor ? { start_cursor: nextCursor } : undefined,
      }
    )) as NotionListResponse<NotionBlock>;

    for (const block of payload.results ?? []) {
      const childTree = block.has_children
        ? await fetchBlockTree({ token, blockId: block.id })
        : [];
      children.push({ ...block, children: childTree });
    }

    nextCursor = payload.has_more ? payload.next_cursor ?? undefined : undefined;
  } while (nextCursor);

  return children;
}

function renderBlocks(blocks: NotionBlock[], depth = 0): string {
  return blocks
    .map((block) => renderBlock(block, depth))
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

function renderBlock(block: NotionBlock, depth = 0): string {
  const children = block.children ?? [];
  const typeData = getBlockData(block);
  const richText = richTextToMarkdown(typeData.rich_text ?? []);

  switch (block.type) {
    case "paragraph":
      return joinBlockWithChildren(richText, children, depth);
    case "heading_1":
      return `# ${richText}`;
    case "heading_2":
      return `## ${richText}`;
    case "heading_3":
      return `### ${richText}`;
    case "bulleted_list_item":
      return renderListItem("-", richText, children, depth);
    case "numbered_list_item":
      return renderListItem("1.", richText, children, depth);
    case "to_do": {
      const marker = typeData.checked ? "[x]" : "[ ]";
      return renderListItem("-", `${marker} ${richText}`.trim(), children, depth);
    }
    case "quote":
      return prefixLines(richText || renderBlocks(children, depth), "> ");
    case "callout": {
      const icon = extractEmoji(typeData.icon);
      return prefixLines(`${icon ? `${icon} ` : ""}${richText}`.trim(), "> ");
    }
    case "code": {
      const language = typeData.language || "";
      return `\`\`\`${language}\n${richTextToPlainText(
        typeData.rich_text ?? []
      )}\n\`\`\``;
    }
    case "divider":
      return "---";
    case "image":
      return renderMediaBlock(typeData);
    case "video":
      return renderMediaBlock(typeData, "video");
    case "file":
    case "pdf":
    case "audio": {
      const url = extractFileUrl(typeData);
      return url ? `[${block.type}](${url})` : "";
    }
    case "bookmark":
    case "embed":
    case "link_preview":
      return typeData.url ? `[${typeData.url}](${typeData.url})` : "";
    case "equation":
      return typeData.expression ? `$$${typeData.expression}$$` : "";
    case "table":
      return renderTable(children);
    case "toggle": {
      const summary = richText || "Details";
      const body = renderBlocks(children, depth + 1);
      return body ? `**${summary}**\n\n${body}` : `**${summary}**`;
    }
    default:
      return richText || renderBlocks(children, depth);
  }
}

function renderListItem(
  marker: string,
  content: string,
  children: NotionBlock[],
  depth: number
): string {
  const indent = "  ".repeat(depth);
  const line = `${indent}${marker} ${content}`.trimEnd();
  const childMarkdown = renderBlocks(children, depth + 1);

  if (!childMarkdown) {
    return line;
  }

  return `${line}\n${indentBlock(childMarkdown, `${indent}  `)}`;
}

function renderTable(rows: NotionBlock[]) {
  const cells = rows
    .filter((row) => row.type === "table_row")
    .map((row) =>
      (row.table_row?.cells ?? []).map((cell) =>
        richTextToPlainText(cell).replace(/\|/g, "\\|").trim()
      )
    );

  if (cells.length === 0) {
    return "";
  }

  const header = cells[0];
  const divider = header.map(() => "---");
  const body = cells.slice(1);

  return [
    `| ${header.join(" | ")} |`,
    `| ${divider.join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function renderMediaBlock(
  typeData: NotionFileLike & { caption?: NotionRichTextItem[] },
  mediaType = "image"
) {
  const url = extractFileUrl(typeData);

  if (!url) {
    return "";
  }

  const caption = richTextToPlainText(typeData.caption ?? []);

  if (mediaType === "image") {
    return `![${caption}](${url})`;
  }

  return `[${caption || "video"}](${url})`;
}

function joinBlockWithChildren(
  markdown: string,
  children: NotionBlock[],
  depth: number
): string {
  const childMarkdown = renderBlocks(children, depth);

  if (!markdown) {
    return childMarkdown;
  }

  if (!childMarkdown) {
    return markdown;
  }

  return `${markdown}\n\n${childMarkdown}`;
}

function richTextToMarkdown(richText: NotionRichTextItem[]) {
  return richText
    .map((item) => {
      let text = item.plain_text ?? "";
      const link = item.href ?? item.text?.link?.url;

      if (item.annotations?.code) {
        text = `\`${text.replace(/`/g, "\\`")}\``;
      }
      if (item.annotations?.bold) {
        text = `**${text}**`;
      }
      if (item.annotations?.italic) {
        text = `_${text}_`;
      }
      if (item.annotations?.strikethrough) {
        text = `~~${text}~~`;
      }

      return link ? `[${text}](${link})` : text;
    })
    .join("");
}

function richTextToPlainText(richText: NotionRichTextItem[]) {
  return richText.map((item) => item.plain_text ?? "").join("");
}

function readStringProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: string[],
  allowedTypes: string[] = [],
  allowTypeFallback = false
) {
  const property = findProperty(
    properties,
    aliases,
    allowedTypes,
    allowTypeFallback
  );

  if (!property) {
    return null;
  }

  switch (property.type) {
    case "title":
      return richTextToPlainText(property.title ?? []).trim() || null;
    case "rich_text":
      return richTextToPlainText(property.rich_text ?? []).trim() || null;
    case "url":
      return property.url?.trim() || null;
    case "email":
      return property.email?.trim() || null;
    case "phone_number":
      return property.phone_number?.trim() || null;
    case "select":
      return property.select?.name?.trim() || null;
    case "status":
      return property.status?.name?.trim() || null;
    case "formula":
      return formulaValueToString(property.formula);
    default:
      return null;
  }
}

function readDateProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: string[]
) {
  const property = findProperty(properties, aliases, ["date", "formula"], true);

  if (!property) {
    return null;
  }

  if (property.type === "date") {
    return property.date?.start?.slice(0, 10) ?? null;
  }

  if (property.type === "formula") {
    if (property.formula?.type === "date") {
      return property.formula.date?.start?.slice(0, 10) ?? null;
    }

    const stringValue = formulaValueToString(property.formula);
    return stringValue?.slice(0, 10) ?? null;
  }

  return null;
}

function readAuthorProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: string[]
) {
  const property = findProperty(properties, aliases, ["people", "rich_text"], true);

  if (!property) {
    return null;
  }

  if (property.type === "people") {
    const names = (property.people ?? [])
      .map((person) => person.name)
      .filter(Boolean);
    return names.join(", ") || null;
  }

  return readStringProperty(properties, aliases, ["rich_text"]);
}

function readImageProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: string[]
) {
  const property = findProperty(properties, aliases, [
    "files",
    "url",
    "rich_text",
    "formula",
  ]);

  if (!property) {
    return null;
  }

  switch (property.type) {
    case "files":
      return extractFileUrl(property.files?.[0]) ?? null;
    case "url":
      return property.url ?? null;
    case "rich_text":
      return richTextToPlainText(property.rich_text ?? []).trim() || null;
    case "formula":
      return formulaValueToString(property.formula);
    default:
      return null;
  }
}

function readTagsProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: string[]
) {
  const property = findProperty(
    properties,
    aliases,
    ["multi_select", "select", "rich_text", "formula"],
    true
  );

  if (!property) {
    return [];
  }

  switch (property.type) {
    case "multi_select":
      return (property.multi_select ?? [])
        .map((option) => option.name?.trim())
        .filter((value): value is string => Boolean(value));
    case "select":
      return property.select?.name ? [property.select.name.trim()] : [];
    case "rich_text":
      return splitTagString(richTextToPlainText(property.rich_text ?? []));
    case "formula":
      return splitTagString(formulaValueToString(property.formula) ?? "");
    default:
      return [];
  }
}

function isPublishedPage(page: NotionPage) {
  const properties = page.properties ?? {};
  const publishedProperty = findProperty(
    properties,
    PROPERTY_ALIASES.published,
    ["checkbox", "formula"]
  );

  if (publishedProperty) {
    if (publishedProperty.type === "checkbox") {
      return Boolean(publishedProperty.checkbox);
    }

    if (publishedProperty.type === "formula") {
      if (publishedProperty.formula?.type === "boolean") {
        return Boolean(publishedProperty.formula.boolean);
      }

      const value = formulaValueToString(publishedProperty.formula);
      return matchesPublishedValue(value);
    }
  }

  const statusProperty = findProperty(properties, PROPERTY_ALIASES.status, [
    "status",
    "select",
    "formula",
  ]);

  if (!statusProperty) {
    return true;
  }

  if (statusProperty.type === "status") {
    return matchesPublishedValue(statusProperty.status?.name);
  }

  if (statusProperty.type === "select") {
    return matchesPublishedValue(statusProperty.select?.name);
  }

  return matchesPublishedValue(formulaValueToString(statusProperty.formula));
}

function matchesPublishedValue(value: unknown) {
  return ["published", "live", "public", "done"].includes(normalizeName(value));
}

function findProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: string[],
  allowedTypes: string[] = [],
  allowTypeFallback = false
) {
  const entries = Object.entries(properties ?? {});
  const normalizedAliases = new Set(aliases.map(normalizeName));

  for (const [name, property] of entries) {
    if (
      normalizedAliases.has(normalizeName(name)) &&
      (allowedTypes.length === 0 || allowedTypes.includes(property.type))
    ) {
      return property;
    }
  }

  if (allowedTypes.length === 0 || !allowTypeFallback) {
    return null;
  }

  return entries.find(([, property]) => allowedTypes.includes(property.type))?.[1] ?? null;
}

function extractMarkdownString(payload: unknown) {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "markdown" in payload &&
    typeof (payload as { markdown?: unknown }).markdown === "string"
  ) {
    return (payload as { markdown: string }).markdown;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "results" in payload &&
    Array.isArray((payload as { results?: unknown[] }).results)
  ) {
    return ((payload as { results: unknown[] }).results)
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          typeof item === "object" &&
          item !== null &&
          "markdown" in item &&
          typeof (item as { markdown?: unknown }).markdown === "string"
        ) {
          return (item as { markdown: string }).markdown;
        }

        return "";
      })
      .join("\n\n");
  }

  return "";
}

function sanitizeNotionMarkdown(markdown: string) {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/\s+\{color="[^"]+"\}/g, "")
    .replace(/<bookmark url="([^"]+)"\s*\/>/g, "[$1]($1)")
    .replace(/<embed url="([^"]+)"\s*\/>/g, "[$1]($1)")
    .replace(/<empty-block\s*\/>/g, "")
    .replace(
      /<file url="([^"]+)"(?: alt="([^"]*)")?\s*\/>/g,
      (_match, url: string, alt: string) => `[${alt || "file"}](${url})`
    )
    .replace(
      /<image url="([^"]+)"(?: alt="([^"]*)")?\s*\/>/g,
      (_match, url: string, alt: string) => `![${alt || ""}](${url})`
    )
    .replace(
      /<video url="([^"]+)"(?: alt="([^"]*)")?\s*\/>/g,
      (_match, url: string, alt: string) => `[${alt || "video"}](${url})`
    )
    .replace(/<mention-user name="([^"]+)"\s*\/>/g, "@$1")
    .replace(/<page url="([^"]+)">([^<]*)<\/page>/g, "[$2]($1)")
    .replace(/<database url="([^"]+)">([^<]*)<\/database>/g, "[$2]($1)")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractSummary(markdown: string) {
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_`~>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Synced from Notion.";
  }

  return cleaned.slice(0, 180).trim();
}

async function notionRequest(
  requestPath: string,
  { token, method = "GET", body, query }: NotionRequestOptions
): Promise<unknown> {
  const url = new URL(`${NOTION_API_BASE_URL}${requestPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": DEFAULT_NOTION_VERSION,
    },
    cache: "no-store",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Notion API request failed with ${response.status} ${response.statusText}`;
    throw new Error(`${response.status} ${message}`);
  }

  return data;
}

function normalizeNotionId(value: string) {
  if (!value) {
    return "";
  }

  const compact = value.replace(/-/g, "");
  const directMatch = compact.match(/[0-9a-fA-F]{32}/);

  if (!directMatch) {
    return "";
  }

  const id = directMatch[0].toLowerCase();
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(
    16,
    20
  )}-${id.slice(20)}`;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\\/]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeName(value: unknown) {
  return (value ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function splitAliases(value: string | undefined, defaults: string[]) {
  if (!value) {
    return defaults;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitTagString(value: string) {
  return value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formulaValueToString(formula?: NotionFormulaValue | null) {
  if (!formula) {
    return null;
  }

  switch (formula.type) {
    case "string":
      return formula.string?.trim() || null;
    case "number":
      return formula.number != null ? String(formula.number) : null;
    case "boolean":
      return formula.boolean != null ? String(formula.boolean) : null;
    case "date":
      return formula.date?.start ?? null;
    default:
      return null;
  }
}

function extractFileUrl(fileValue?: NotionFileLike | null) {
  if (!fileValue) {
    return null;
  }

  if (fileValue.type === "external") {
    return fileValue.external?.url ?? null;
  }

  if (fileValue.type === "file") {
    return fileValue.file?.url ?? null;
  }

  if (fileValue.url) {
    return fileValue.url;
  }

  return null;
}

function extractCoverUrl(cover?: NotionFileLike | null) {
  return extractFileUrl(cover);
}

function extractEmoji(icon?: { type?: "emoji"; emoji?: string | null } | null) {
  if (!icon || icon.type !== "emoji") {
    return "";
  }

  return icon.emoji ?? "";
}

function prefixLines(value: string, prefix: string) {
  return value
    .split("\n")
    .filter(Boolean)
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function indentBlock(value: string, indent: string) {
  return value
    .split("\n")
    .map((line) => (line ? `${indent}${line}` : line))
    .join("\n");
}

function getBlockData(block: NotionBlock): GenericBlockData {
  switch (block.type) {
    case "paragraph":
      return block.paragraph ?? {};
    case "heading_1":
      return block.heading_1 ?? {};
    case "heading_2":
      return block.heading_2 ?? {};
    case "heading_3":
      return block.heading_3 ?? {};
    case "bulleted_list_item":
      return block.bulleted_list_item ?? {};
    case "numbered_list_item":
      return block.numbered_list_item ?? {};
    case "to_do":
      return block.to_do ?? {};
    case "quote":
      return block.quote ?? {};
    case "callout":
      return block.callout ?? {};
    case "code":
      return block.code ?? {};
    case "image":
      return block.image ?? {};
    case "video":
      return block.video ?? {};
    case "file":
      return block.file ?? {};
    case "pdf":
      return block.pdf ?? {};
    case "audio":
      return block.audio ?? {};
    case "bookmark":
      return block.bookmark ?? {};
    case "embed":
      return block.embed ?? {};
    case "link_preview":
      return block.link_preview ?? {};
    case "equation":
      return block.equation ?? {};
    case "table_row":
      return block.table_row ?? {};
    case "toggle":
      return block.toggle ?? {};
    default:
      return {};
  }
}
