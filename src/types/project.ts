export type ProjectLinkType = "Website" | "Source" | "Dashboard";

export type ProjectLink = {
  readonly type: ProjectLinkType;
  readonly href: string;
};

export type Project = {
  readonly title: string;
  readonly description: string;
  readonly dates: string;
  readonly technologies: readonly string[];
  readonly links: readonly ProjectLink[];
  /** External fallback destination, used when there is no article. */
  readonly href?: string;
  /** Internal path of the write-up, for example /blog/my-post. */
  readonly articleHref?: string;
  readonly image?: string;
  readonly video?: string;
  readonly active: boolean;
};
