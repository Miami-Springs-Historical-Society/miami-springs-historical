# Claude Code Guide — Miami Springs Historical Society

## Text and copy

All user-facing text is managed through translation files — never hardcode strings in components or pages.

- **`src/i18n/en.json`** — English strings (source of truth)
- **`src/i18n/es.json`** — Spanish strings (must mirror every key in en.json)

When updating copy, edit the JSON files. When adding a new string, add it to both files. Components use `const t = useTranslations(Astro.currentLocale)` and reference keys with dot notation: `t('hero.tagline')`.

**Exception:** Proper nouns (org name, place names, addresses), photo credits/citations, and email addresses may be hardcoded where appropriate.

**Museum hours** appear in both `src/data/general.json` and `src/i18n/en.json` (`footer.hours`) — update both if hours change, and update `es.json` too.

## Content (events, board members)

Dynamic content is stored as Markdown files, not in components:

- **Events** → `src/content/events/` — one `.md` file per event
- **Board members** → `src/content/board/` — one `.md` file per board member
- **Resources page links** → `src/data/resources.ts`
- **Site settings** (email, phone, Facebook URL) → `src/data/general.json`
- **Photographs** → `src/assets/`, imported and rendered with `<Image />` from `astro:assets` — never `public/`, which is copied verbatim and skips optimization entirely
- **Museum hours** → `src/i18n/en.json` under `footer.hours` (also update `es.json` and `src/data/general.json`)

## Design system

All colors, fonts, and spacing use CSS custom properties defined in `src/layouts/Layout.astro`. Never hardcode hex values, rgba colors, or font names in components — use the variables:

```css
var(--color-primary)      /* brown */
var(--color-accent)       /* green */
var(--color-bg)           /* off-white */
var(--color-text-muted)   /* muted brown */
var(--font-display)       /* Playfair Display */
var(--font-body)          /* Lora */
```

## Accessibility

The site targets WCAG 2.1 AA. When adding new sections or components:

- Add `aria-labelledby` to all `<section>` elements
- Use semantic HTML (`<nav>`, `<main>`, `<header>`, `<footer>`)
- Ensure focus styles are visible (use `:focus-visible` with `var(--color-accent)`)
- Don't go below 0.75rem font size
- Alt text on images should be descriptive

## Deployment

Pushing to `main` automatically builds and deploys via Cloudflare Workers Builds (configured in the Cloudflare dashboard, not in this repo — GitHub Actions only runs the PR checks). The site is static — Astro generates HTML at build time, served via Cloudflare Workers.

Verify changes locally before pushing: `npm run build`.
