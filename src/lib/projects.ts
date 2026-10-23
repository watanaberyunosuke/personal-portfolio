import { DATA } from "@/data/resume";
import type { Project, ProjectLink } from "@/types/project";

type NotionQueryValue = string | undefined;

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
}

interface NotionPropertyValue {
  type: string;
  title?: NotionRichTextItem[];
  rich_text?: NotionRichTextItem[];
  url?: string | null;
  number?: number | null;
  checkbox?: boolean;
  multi_select?: Array<{ name?: string | null }>;
  relation?: Array<{ id: string }>;
}

interface NotionPage {
  object: "page";
  id: string;
  in_trash?: boolean;
  properties?: Record<string, NotionPropertyValue>;
}

interface NotionDataSourceResponse {
  data_sources?: Array<{ id?: string }>;
}

const NOTION_API_BASE_URL = "https://api.notion.com/v1";
const DEFAULT_NOTION_VERSION = process.env.NOTION_API_VERSION ?? "2026-03-11";

const LINK_PROPERTIES: ReadonlyArray<readonly [string, ProjectLink["type"]]> = [
  ["Website URL", "Website"],
  ["Source URL", "Source"],
  ["Dashboard URL", "Dashboard"],
];

/**
 * Loads portfolio projects from the Notion Projects database.
 * Falls back to the static list in resume.tsx when Notion is not configured,
 * is unreachable, or has no published projects, so the section never renders empty.
 */
export async function getProjects(): Promise<readonly Project[]> {
  const token = process.env.NOTION_TOKEN;
  const sourceId =
    process.env.NOTION_PROJECTS_DATA_SOURCE_ID ??
    process.env.NOTION_PROJECTS_DATABASE_ID;

  if (!token || !sourceId) {
    return getStaticProjects();
  }

  try {
    const dataSourceId = await resolveDataSourceId(sourceId, token);
    const pages = await queryProjectPages(dataSourceId, token);
    const projects = (
      await Promise.all(pages.map((page) => buildProject(page, token)))
    ).filter((project): project is Project => Boolean(project));

    return projects.length > 0 ? projects : getStaticProjects();
  } catch (error) {
    console.error("Failed to load projects from Notion:", error);
    return getStaticProjects();
  }
}

function getStaticProjects(): readonly Project[] {
  return DATA.projects.map((project) => ({
    title: project.title,
    description: project.description,
    dates: project.dates,
    technologies: project.technologies,
    href: project.href && project.href !== "#" ? project.href : undefined,
    links: project.links.map((link) => ({
      type: link.type as ProjectLink["type"],
      href: link.href,
    })),
    image: project.image || undefined,
    video: project.video || undefined,
    active: project.active,
  }));
}

async function resolveDataSourceId(input: string, token: string) {
  const normalized = normalizeNotionId(input);

  if (process.env.NOTION_PROJECTS_DATA_SOURCE_ID) {
    return normalized;
  }

  const database = (await notionRequest(`/databases/${normalized}`, {
    token,
  })) as NotionDataSourceResponse;
  const firstDataSource = database?.data_sources?.[0]?.id;

  if (!firstDataSource) {
    throw new Error(
      "The configured projects database does not expose a data source. Set NOTION_PROJECTS_DATA_SOURCE_ID directly instead."
    );
  }

  return normalizeNotionId(firstDataSource);
}

async function queryProjectPages(dataSourceId: string, token: string) {
  const pages: NotionPage[] = [];
  let startCursor: string | undefined;

  do {
    const payload = (await notionRequest(`/data_sources/${dataSourceId}/query`, {
      token,
      method: "POST",
      body: startCursor ? { start_cursor: startCursor } : {},
    })) as NotionListResponse<NotionPage>;

    pages.push(...(payload.results ?? []));
    startCursor = payload.has_more
      ? (payload.next_cursor ?? undefined)
      : undefined;
  } while (startCursor);

  return pages
    .map((page, index) => ({
      index,
      page,
      sort: page.properties?.Sort?.number ?? null,
    }))
    .filter(
      ({ page }) => !page.in_trash && page.properties?.Published?.checkbox
    )
    .sort((a, b) => {
      if (a.sort !== null && b.sort !== null) return a.sort - b.sort;
      if (a.sort !== null) return -1;
      if (b.sort !== null) return 1;
      return a.index - b.index;
    })
    .map(({ page }) => page);
}

async function buildProject(
  page: NotionPage,
  token: string
): Promise<Project | null> {
  const properties = page.properties ?? {};
  const title = richTextToPlainText(properties.Name?.title);

  if (!title) {
    return null;
  }

  const links = LINK_PROPERTIES.flatMap(([property, type]) => {
    const href = properties[property]?.url;
    return href ? [{ type, href }] : [];
  });

  const articleId = properties.Article?.relation?.[0]?.id;
  const articleSlug = articleId
    ? await resolveArticleSlug(articleId, token)
    : null;

  return {
    title,
    description: richTextToPlainText(properties.Description?.rich_text) ?? "",
    dates: richTextToPlainText(properties.Dates?.rich_text) ?? "",
    technologies: (properties.Technologies?.multi_select ?? [])
      .map((option) => option.name)
      .filter((name): name is string => Boolean(name)),
    href: properties["Primary URL"]?.url ?? undefined,
    articleHref: articleSlug ? `/blog/${articleSlug}` : undefined,
    links,
    image: properties["Image URL"]?.url ?? undefined,
    video: properties["Video URL"]?.url ?? undefined,
    active: properties.Active?.checkbox ?? false,
  };
}

/**
 * Resolves a related Blog page to its public slug, mirroring how the blog
 * loader derives it (Slug property, else the title). Returns null when the
 * post is not published, so a card never links to a 404.
 */
async function resolveArticleSlug(pageId: string, token: string) {
  try {
    const page = (await notionRequest(`/pages/${normalizeNotionId(pageId)}`, {
      token,
    })) as NotionPage;
    const properties = page.properties ?? {};
    const published = properties.Published?.checkbox;

    if (page.in_trash || published === false) {
      return null;
    }

    const slugSource =
      richTextToPlainText(properties.Slug?.rich_text) ??
      richTextToPlainText(properties.Name?.title);

    return slugSource ? normalizeSlug(slugSource) || null : null;
  } catch (error) {
    console.error("Failed to resolve project article from Notion:", error);
    return null;
  }
}

function richTextToPlainText(richText?: NotionRichTextItem[]) {
  const text = richText
    ?.map((item) => item.plain_text ?? "")
    .join("")
    .trim();

  return text || null;
}

async function notionRequest(
  requestPath: string,
  { token, method = "GET", body, query }: NotionRequestOptions
) {
  const url = new URL(`${NOTION_API_BASE_URL}${requestPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": DEFAULT_NOTION_VERSION,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Notion API request failed with ${response.status} ${response.statusText}: ${details}`
    );
  }

  return response.json();
}

function normalizeNotionId(value: string) {
  const match = value.replace(/-/g, "").match(/[0-9a-f]{32}/i);

  return match?.[0] ?? value;
}

// Keep identical to normalizeSlug in blog-posts.ts so links match blog routes.
function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\\/]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}
