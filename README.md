# Portfolio

Built with next.js, [shadcn/ui](https://ui.shadcn.com/), and [magic ui](https://magicui.design/), deployed on Vercel.

Inspired by: https://github.com/dillionverma/portfolio

## Blog Content

The blog now supports both local MDX files and Notion-authored posts:

- Manual posts live in `content/*.mdx`.
- Notion posts sync into `content/notion/*.mdx` via `scripts/sync-notion-blog.ts`.
- `yarn build` / `npm run build` will run the Notion sync first when the required env vars are set.

### Notion Setup

1. Create a Notion database for blog posts.
2. Share that database with your integration.
3. Add the values from `.env.example`.
4. Run `npm run sync:blog`.

Recommended Notion properties:

- `Name` or `Title`
- `Slug`
- `Summary`
- `Published At`
- `Updated At`
- `Author`
- `Image`
- `Tags`
- `Published` or `Status`

If `Published` is missing, the sync script imports every page in the configured Notion data source. If `Tags` is missing, synced posts default to a single `Notion` tag.

# License

Licensed under the [MIT license](https://github.com/dillionverma/portfolio/blob/main/LICENSE.md).
