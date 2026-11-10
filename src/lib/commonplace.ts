import { DATA } from "@/data/resume";
import type {
  CommonplaceItem,
  CommonplaceSection,
} from "@/types/commonplace";

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
  select?: { name?: string | null } | null;
  relation?: Array<{ id: string }>;
}

interface NotionPage {
  object: "page";
  id: string;
  in_trash?: boolean;
  properties?: Record<string, NotionPropertyValue>;
}

interface NotionListResponse<T> {
  results?: T[];
  has_more?: boolean;
  next_cursor?: string | null;
}

interface NotionDatabaseResponse {
  data_sources?: Array<{ id?: string }>;
}

const NOTION_API_BASE_URL = "https://api.notion.com/v1";
const DEFAULT_NOTION_VERSION = process.env.NOTION_API_VERSION ?? "2026-03-11";

/**
 * Loads the Commonplace section from two Notion databases:
 * - Categories: Name (title), Subtitle, Icon (select), Sort, Published
 * - Items: Name (title), Category (relation to Categories), Note, URL, Sort, Published
 *
 * Falls back to the static list in resume.tsx when Notion is not configured,
 * is unreachable, or yields no published categories.
 */
export async function getCommonplace(): Promise<readonly CommonplaceSection[]> {
  const token = process.env.NOTION_TOKEN;
  const categoriesSource =
    process.env.NOTION_COMMONPLACE_CATEGORIES_DATA_SOURCE_ID ??
    process.env.NOTION_COMMONPLACE_CATEGORIES_DATABASE_ID;
  const itemsSource =
    process.env.NOTION_COMMONPLACE_ITEMS_DATA_SOURCE_ID ??
    process.env.NOTION_COMMONPLACE_ITEMS_DATABASE_ID;

  if (!token || !categoriesSource || !itemsSource) {
    return getStaticCommonplace();
  }

  try {
    const [categoryPages, itemPages] = await Promise.all([
      queryPublishedPages(
        await resolveDataSourceId(
          categoriesSource,
          Boolean(process.env.NOTION_COMMONPLACE_CATEGORIES_DATA_SOURCE_ID),
          token
        ),
        token
      ),
      queryPublishedPages(
        await resolveDataSourceId(
          itemsSource,
          Boolean(process.env.NOTION_COMMONPLACE_ITEMS_DATA_SOURCE_ID),
          token
        ),
        token
      ),
    ]);

    const itemsByCategory = new Map<string, CommonplaceItem[]>();

    for (const page of itemPages) {
      const item = buildItem(page);
      const categoryId = page.properties?.Category?.relation?.[0]?.id;

      if (!item || !categoryId) continue;

      const key = normalizeNotionId(categoryId);
      itemsByCategory.set(key, [...(itemsByCategory.get(key) ?? []), item]);
    }

    const sections = categoryPages
      .map((page): CommonplaceSection | null => {
        const properties = page.properties ?? {};
        const title = richTextToPlainText(properties.Name?.title);

        if (!title) return null;

        return {
          title,
          subtitle: richTextToPlainText(properties.Subtitle?.rich_text) ?? "",
          icon: properties.Icon?.select?.name ?? undefined,
          items: itemsByCategory.get(normalizeNotionId(page.id)) ?? [],
        };
      })
      .filter((section): section is CommonplaceSection => Boolean(section));

    return sections.length > 0 ? sections : getStaticCommonplace();
  } catch (error) {
    console.error("Failed to load commonplace from Notion:", error);
    return getStaticCommonplace();
  }
}

function getStaticCommonplace(): readonly CommonplaceSection[] {
  return DATA.commonplace.map((section) => ({
    title: section.title,
    subtitle: section.subtitle,
    items: section.items.map((title) => ({ title })),
  }));
}

function buildItem(page: NotionPage): CommonplaceItem | null {
  const properties = page.properties ?? {};
  const title = richTextToPlainText(properties.Name?.title);

  if (!title) return null;

  return {
    title,
    note: richTextToPlainText(properties.Note?.rich_text) ?? undefined,
    href: properties.URL?.url ?? undefined,
  };
}

async function resolveDataSourceId(
  input: string,
  isDataSourceId: boolean,
  token: string
) {
  const normalized = normalizeNotionId(input);

  if (isDataSourceId) return normalized;

  const database = (await notionRequest(`/databases/${normalized}`, {
    token,
  })) as NotionDatabaseResponse;
  const firstDataSource = database?.data_sources?.[0]?.id;

  if (!firstDataSource) {
    throw new Error(
      "A configured commonplace database does not expose a data source. Set the matching *_DATA_SOURCE_ID instead."
    );
  }

  return normalizeNotionId(firstDataSource);
}

async function queryPublishedPages(dataSourceId: string, token: string) {
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

function richTextToPlainText(richText?: NotionRichTextItem[]) {
  const text = richText
    ?.map((item) => item.plain_text ?? "")
    .join("")
    .trim();

  return text || null;
}

async function notionRequest(
  requestPath: string,
  {
    token,
    method = "GET",
    body,
  }: { token: string; method?: "GET" | "POST"; body?: Record<string, unknown> }
) {
  const response = await fetch(`${NOTION_API_BASE_URL}${requestPath}`, {
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

  return match?.[0]?.toLowerCase() ?? value;
}
