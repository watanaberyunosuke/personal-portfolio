import { join } from "node:path";

const projectRoot = process.cwd();
const previousTailwindResolve = globalThis.__tw_resolve;

globalThis.__tw_resolve = (id, base) => {
  if (id === "tailwindcss") {
    return join(projectRoot, "node_modules/tailwindcss/index.css");
  }

  if (id === "tw-animate-css") {
    return join(projectRoot, "node_modules/tw-animate-css/dist/tw-animate.css");
  }

  if (id === "@tailwindcss/typography") {
    return join(projectRoot, "node_modules/@tailwindcss/typography/src/index.js");
  }

  return typeof previousTailwindResolve === "function"
    ? previousTailwindResolve(id, base)
    : undefined;
};

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
