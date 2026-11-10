export interface NotionRichTextItem {
  plain_text?: string;
}

export interface NotionPropertyValue {
  type: string;
  title?: NotionRichTextItem[];
  rich_text?: NotionRichTextItem[];
  url?: string | null;
  number?: number | null;
  checkbox?: boolean;
  select?: { name?: string | null } | null;
  multi_select?: Array<{ name?: string | null }>;
  relation?: Array<{ id: string }>;
}

export interface NotionPage {
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

export async function notionRequest(
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

export function normalizeNotionId(value: string) {
  const match = value.replace(/-/g, "").match(/[0-9a-f]{32}/i);

  return match?.[0]?.toLowerCase() ?? value;
}

export function richTextToPlainText(richText?: NotionRichTextItem[]) {
  const text = richText
    ?.map((item) => item.plain_text ?? "")
    .join("")
    .trim();

  return text || null;
}

/**
 * Resolves a database ID to its first data source ID. When the input is
 * already a data source ID, it is returned as is.
 */
export async function resolveDataSourceId(
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
      "The configured Notion database does not expose a data source. Set the matching *_DATA_SOURCE_ID instead."
    );
  }

  return normalizeNotionId(firstDataSource);
}

/**
 * Queries every page of a data source, keeps those with Published ticked and
 * orders them by the Sort number, then by Notion's own order.
 */
export async function queryPublishedPages(
  dataSourceId: string,
  token: string
) {
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
