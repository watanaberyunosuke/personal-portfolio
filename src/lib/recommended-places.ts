import type { RecommendedPlace } from "@/types/recommended-place";

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

interface NotionFormulaValue {
  type?: "string" | "number" | "boolean";
  string?: string | null;
  number?: number | null;
  boolean?: boolean | null;
}

interface NotionPropertyValue {
  type: string;
  title?: NotionRichTextItem[];
  rich_text?: NotionRichTextItem[];
  url?: string | null;
  number?: number | null;
  select?: {
    name?: string | null;
  } | null;
  status?: {
    name?: string | null;
  } | null;
  multi_select?: Array<{
    name?: string | null;
  }>;
  place?: {
    lat?: number | null;
    lon?: number | null;
    name?: string | null;
    address?: string | null;
    google_place_id?: string | null;
    aws_place_id?: string | null;
  } | null;
  checkbox?: boolean;
  formula?: NotionFormulaValue | null;
}

interface NotionPage {
  object: "page";
  id: string;
  in_trash?: boolean;
  properties?: Record<string, NotionPropertyValue>;
}

interface NotionDataSourceResponse {
  data_sources?: Array<{
    id?: string;
  }>;
}

const NOTION_API_BASE_URL = "https://api.notion.com/v1";
const DEFAULT_NOTION_VERSION = process.env.NOTION_API_VERSION ?? "2026-03-11";

const PROPERTY_ALIASES = {
  name: splitAliases(process.env.NOTION_PLACES_NAME_PROPERTY, ["Name", "Title"]),
  category: splitAliases(process.env.NOTION_PLACES_CATEGORY_PROPERTY, [
    "Category",
    "Type",
  ]),
  city: splitAliases(process.env.NOTION_PLACES_CITY_PROPERTY, ["City"]),
  country: splitAliases(process.env.NOTION_PLACES_COUNTRY_PROPERTY, [
    "Country",
  ]),
  place: splitAliases(process.env.NOTION_PLACES_PLACE_PROPERTY, [
    "Location Query",
    "Map Query",
    "Address",
    "Place",
    "Location",
    "Area",
  ]),
  latitude: splitAliases(process.env.NOTION_PLACES_LATITUDE_PROPERTY, [
    "Latitude",
    "Lat",
  ]),
  longitude: splitAliases(process.env.NOTION_PLACES_LONGITUDE_PROPERTY, [
    "Longitude",
    "Lng",
    "Lon",
  ]),
  summary: splitAliases(process.env.NOTION_PLACES_SUMMARY_PROPERTY, [
    "Summary",
    "Description",
  ]),
  tip: splitAliases(process.env.NOTION_PLACES_TIP_PROPERTY, ["Tip", "Note"]),
  published: splitAliases(process.env.NOTION_PLACES_PUBLISHED_PROPERTY, [
    "Published",
    "Live",
  ]),
  sort: splitAliases(process.env.NOTION_PLACES_SORT_PROPERTY, ["Sort", "Order"]),
};

export async function getRecommendedPlaces(): Promise<
  readonly RecommendedPlace[]
> {
  const token = process.env.NOTION_TOKEN;
  const sourceId =
    process.env.NOTION_PLACES_DATA_SOURCE_ID ??
    process.env.NOTION_PLACES_DATABASE_ID;

  if (!token || !sourceId) {
    return [];
  }

  try {
    const dataSourceId = await resolvePlacesDataSourceId(sourceId, token);
    const pages = await queryPlacesPages(dataSourceId, token);
    const places = pages
      .map((page) => buildRecommendedPlace(page))
      .filter((place): place is RecommendedPlace => Boolean(place));

    return places;
  } catch (error) {
    console.error("Failed to load recommended places from Notion:", error);
    return [];
  }
}

async function resolvePlacesDataSourceId(input: string, token: string) {
  const normalized = normalizeNotionId(input);

  if (!normalized) {
    throw new Error(`Could not extract a Notion ID from "${input}".`);
  }

  if (process.env.NOTION_PLACES_DATA_SOURCE_ID) {
    return normalized;
  }

  const database = (await notionRequest(`/databases/${normalized}`, {
    token,
  })) as NotionDataSourceResponse;

  const firstDataSource = database?.data_sources?.[0]?.id;

  if (!firstDataSource) {
    throw new Error(
      "The configured places database does not expose a data source. Set NOTION_PLACES_DATA_SOURCE_ID directly instead."
    );
  }

  return normalizeNotionId(firstDataSource);
}

async function queryPlacesPages(dataSourceId: string, token: string) {
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
      ? payload.next_cursor ?? undefined
      : undefined;
  } while (startCursor);

  return pages
    .filter((page) => !page.in_trash && isPublishedPlace(page))
    .sort((a, b) => getSortValue(a) - getSortValue(b));
}

function buildRecommendedPlace(page: NotionPage): RecommendedPlace | null {
  const properties = page.properties;

  if (!properties) {
    return null;
  }

  const name = getTextProperty(properties, PROPERTY_ALIASES.name);
  const notionPlace = getPlaceProperty(properties, PROPERTY_ALIASES.place);
  const placeText =
    notionPlace?.address ??
    notionPlace?.name ??
    getTextProperty(properties, PROPERTY_ALIASES.place);

  if (!name || !placeText) {
    return null;
  }

  const city = getTextProperty(properties, PROPERTY_ALIASES.city) ?? "";
  const latitude = getNumberProperty(properties, PROPERTY_ALIASES.latitude);
  const longitude = getNumberProperty(properties, PROPERTY_ALIASES.longitude);
  const coordinates =
    latitude !== null && longitude !== null
      ? ([latitude, longitude] as [number, number])
      : undefined;
  const country =
    getTextProperty(properties, PROPERTY_ALIASES.country) ??
    inferCountryFromPlace(placeText) ??
    city;
  const mapQuery = buildMapQuery({ name, placeText, city, country });
  const mapHref = buildGoogleMapsSearchUrl(
    coordinates ? coordinates.join(",") : mapQuery
  );

  return {
    id: slugify(name) || normalizeNotionId(page.id),
    name,
    city,
    country,
    category:
      getTextProperty(properties, PROPERTY_ALIASES.category) ?? "Place",
    mapQuery,
    coordinates,
    summary: getTextProperty(properties, PROPERTY_ALIASES.summary) ?? "",
    tip: getTextProperty(properties, PROPERTY_ALIASES.tip) ?? "",
    mapHref,
  };
}

function isPublishedPlace(page: NotionPage) {
  const properties = page.properties;

  if (!properties) {
    return false;
  }

  const published = getProperty(properties, PROPERTY_ALIASES.published);

  if (!published) {
    return true;
  }

  if (typeof published.checkbox === "boolean") {
    return published.checkbox;
  }

  const status = published.status?.name ?? published.select?.name;

  if (status) {
    return ["published", "live", "yes"].includes(status.toLowerCase());
  }

  return published.formula?.boolean ?? true;
}

function getSortValue(page: NotionPage) {
  return getNumberProperty(
    page.properties ?? {},
    PROPERTY_ALIASES.sort
  ) ?? Number.MAX_SAFE_INTEGER;
}

function getTextProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: readonly string[]
) {
  const property = getProperty(properties, aliases);

  if (!property) {
    return null;
  }

  return (
    richTextToPlainText(property.title) ??
    richTextToPlainText(property.rich_text) ??
    property.select?.name ??
    property.status?.name ??
    multiSelectToPlainText(property.multi_select) ??
    property.place?.address ??
    property.place?.name ??
    formulaValueToString(property.formula) ??
    property.url ??
    null
  );
}

function getNumberProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: readonly string[]
) {
  const property = getProperty(properties, aliases);

  if (!property) {
    return null;
  }

  if (typeof property.number === "number") {
    return property.number;
  }

  if (typeof property.formula?.number === "number") {
    return property.formula.number;
  }

  const value = formulaValueToString(property.formula);
  const parsed = value ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : null;
}

function getProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: readonly string[]
) {
  for (const alias of aliases) {
    const property = properties[alias];

    if (property) {
      return property;
    }
  }

  return null;
}

function richTextToPlainText(richText?: NotionRichTextItem[]) {
  const text = richText
    ?.map((item) => item.plain_text ?? "")
    .join("")
    .trim();

  return text || null;
}

function multiSelectToPlainText(
  multiSelect?: Array<{ name?: string | null }>
) {
  const text = multiSelect
    ?.map((item) => item.name)
    .filter(Boolean)
    .join(", ");

  return text || null;
}

function getPlaceProperty(
  properties: Record<string, NotionPropertyValue>,
  aliases: readonly string[]
) {
  const property = getProperty(properties, aliases);
  return property?.place ?? null;
}

function formulaValueToString(formula?: NotionFormulaValue | null) {
  if (!formula) {
    return null;
  }

  if (formula.type === "string") {
    return formula.string ?? null;
  }

  if (formula.type === "number" && typeof formula.number === "number") {
    return String(formula.number);
  }

  return null;
}

function inferCountryFromPlace(placeText: string) {
  const parts = placeText
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts[parts.length - 1] : null;
}

function buildMapQuery({
  name,
  placeText,
  city,
  country,
}: {
  name: string;
  placeText: string;
  city: string;
  country: string;
}) {
  return uniqueTextParts([name, placeText, city, country]).join(", ");
}

function uniqueTextParts(parts: readonly string[]) {
  const seen = new Set<string>();

  return parts
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) {
        return false;
      }

      const normalized = part.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

function buildGoogleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
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

function splitAliases(value: string | undefined, fallback: string[]) {
  const aliases =
    value
      ?.split(",")
      .map((alias) => alias.trim())
      .filter(Boolean) ?? fallback;

  return aliases;
}

function normalizeNotionId(value: string) {
  const match = value
    .replace(/-/g, "")
    .match(/[0-9a-f]{32}/i);

  return match?.[0] ?? value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
