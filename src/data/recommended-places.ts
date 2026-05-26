export type RecommendedPlace = {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly category: string;
  readonly coordinates: [number, number];
  readonly summary: string;
  readonly tip: string;
  readonly href: string;
};

export const RECOMMENDED_PLACES: readonly RecommendedPlace[] = [
  {
    id: "state-library-victoria",
    name: "State Library Victoria",
    city: "Melbourne",
    country: "Australia",
    category: "Study",
    coordinates: [-37.8098, 144.9652],
    summary: "A beautiful central reading room for deep work and wandering.",
    tip: "Go upstairs for the best view over the La Trobe Reading Room.",
    href: "https://www.slv.vic.gov.au/",
  },
  {
    id: "ngv-international",
    name: "NGV International",
    city: "Melbourne",
    country: "Australia",
    category: "Art",
    coordinates: [-37.8226, 144.9689],
    summary: "Reliable exhibitions, a strong permanent collection, and easy city access.",
    tip: "Pair it with a walk along Southbank or the Arts Centre precinct.",
    href: "https://www.ngv.vic.gov.au/",
  },
  {
    id: "carlton-gardens",
    name: "Carlton Gardens",
    city: "Melbourne",
    country: "Australia",
    category: "Outdoors",
    coordinates: [-37.8054, 144.9717],
    summary: "A calm green reset close to the CBD and the Royal Exhibition Building.",
    tip: "Best around golden hour when the paths and fountain are quieter.",
    href: "https://www.melbourne.vic.gov.au/carlton-gardens",
  },
  {
    id: "abbotsford-convent",
    name: "Abbotsford Convent",
    city: "Melbourne",
    country: "Australia",
    category: "Culture",
    coordinates: [-37.8024, 145.0033],
    summary: "Studios, gardens, food, and Yarra-side paths in one precinct.",
    tip: "Leave time for the river trail and Collingwood Children's Farm next door.",
    href: "https://abbotsfordconvent.com.au/",
  },
  {
    id: "market-lane-prahran",
    name: "Market Lane Coffee",
    city: "Melbourne",
    country: "Australia",
    category: "Coffee",
    coordinates: [-37.8474, 144.9932],
    summary: "A dependable stop for excellent filter coffee and beans.",
    tip: "The Prahran Market location is good when you want coffee plus food shopping.",
    href: "https://marketlane.com.au/",
  },
];
