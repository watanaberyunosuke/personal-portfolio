export type RecommendedPlace = {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly category: string;
  readonly locationLabel: string;
  readonly mapQuery: string;
  readonly coordinates?: [number, number];
  readonly summary: string;
  readonly tip: string;
  readonly mapHref: string;
};
