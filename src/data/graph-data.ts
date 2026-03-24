export interface GraphNode {
  id: string;
  name: string;
  group: number; // 1: Category, 2: Item
  category: string;
  color?: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const GRAPH_DATA: GraphData = {
  nodes: [
    // Categories (Group 1)
    { id: "about-me", name: "About Me", group: 1, category: "about-me", color: "#61dafb" },
    { id: "professional", name: "Professional", group: 1, category: "professional", color: "#61dafb" },
    { id: "projects", name: "Projects", group: 1, category: "projects", color: "#61dafb" },
    { id: "places", name: "Places", group: 1, category: "places", color: "#61dafb" },

    // Sub-items for About Me (Group 2)
    { id: "intro", name: "intro", group: 2, category: "about-me", color: "#ff007f" },
    { id: "about", name: "about", group: 2, category: "about-me", color: "#ff007f" },
    { id: "ethics", name: "ethics", group: 2, category: "about-me", color: "#ff007f" },
    { id: "books", name: "books", group: 2, category: "about-me", color: "#ff007f" },

    // Sub-items for Professional (Group 2)
    { id: "work", name: "work", group: 2, category: "professional", color: "#ff007f" },
    { id: "education", name: "education", group: 2, category: "professional", color: "#ff007f" },
    { id: "tech-stack", name: "tech stack", group: 2, category: "professional", color: "#ff007f" },
    { id: "github", name: "github", group: 2, category: "professional", color: "#ff007f" },

    // Sub-items for Projects (Group 2)
    { id: "p1", name: "projects", group: 2, category: "projects", color: "#ff007f" },

    // Sub-items for Places (Group 2)
    { id: "hong-kong", name: "hong kong", group: 2, category: "places", color: "#ff007f" },

    // Extra nodes from image for filler/detail
    { id: "world", name: "world", group: 2, category: "about-me", color: "#ff007f" },
    { id: "medisafe", name: "medisafe", group: 2, category: "professional", color: "#ff007f" },
    { id: "gsoc", name: "gsoc", group: 2, category: "professional", color: "#ff007f" },
    { id: "iteration", name: "iteration", group: 2, category: "projects", color: "#ff007f" },
    { id: "privacy", name: "privacy", group: 2, category: "places", color: "#ff007f" },
    { id: "biohacking", name: "biohacking", group: 2, category: "about-me", color: "#ff007f" },
    { id: "keyboard", name: "keyboard", group: 2, category: "about-me", color: "#ff007f" },
    { id: "durov", name: "durov", group: 2, category: "about-me", color: "#ff007f" },
  ],
  links: [
    { source: "about-me", target: "intro" },
    { source: "about-me", target: "about" },
    { source: "about-me", target: "ethics" },
    { source: "about-me", target: "books" },
    { source: "about-me", target: "world" },
    { source: "about-me", target: "biohacking" },
    { source: "about-me", target: "keyboard" },
    { source: "about-me", target: "durov" },

    { source: "professional", target: "work" },
    { source: "professional", target: "education" },
    { source: "professional", target: "tech-stack" },
    { source: "professional", target: "github" },
    { source: "professional", target: "medisafe" },
    { source: "professional", target: "gsoc" },

    { source: "projects", target: "p1" },
    { source: "projects", target: "iteration" },

    { source: "places", target: "hong-kong" },
    { source: "places", target: "privacy" },

    // Cross links for visual complexity
    { source: "work", target: "education" },
    { source: "tech-stack", target: "projects" },
    { source: "about", target: "work" },
    { source: "world", target: "github" },
  ],
};
