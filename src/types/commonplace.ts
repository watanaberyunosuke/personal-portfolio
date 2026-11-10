export type CommonplaceItem = {
  readonly title: string;
  /** Optional one-line note shown under the title. */
  readonly note?: string;
  /** Optional external link for the item. */
  readonly href?: string;
};

export type CommonplaceSection = {
  readonly title: string;
  readonly subtitle: string;
  /** Lucide icon name, for example "Book". Falls back to a default by position. */
  readonly icon?: string;
  readonly items: readonly CommonplaceItem[];
};
