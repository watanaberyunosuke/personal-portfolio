import { DATA } from "@/data/resume";
import {
  normalizeNotionId,
  notionRequest,
  queryPublishedPages,
  resolveDataSourceId,
  richTextToPlainText,
  type NotionPage,
} from "@/lib/notion";
import type { Project, ProjectLink } from "@/types/project";

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
    const dataSourceId = await resolveDataSourceId(
      sourceId,
      Boolean(process.env.NOTION_PROJECTS_DATA_SOURCE_ID),
      token
    );
    const pages = await queryPublishedPages(dataSourceId, token);
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
