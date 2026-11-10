import { DATA } from "@/data/resume";
import {
  queryPublishedPages,
  resolveDataSourceId,
  richTextToPlainText,
  normalizeNotionId,
  type NotionPage,
} from "@/lib/notion";
import type {
  CommonplaceItem,
  CommonplaceSection,
} from "@/types/commonplace";

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
