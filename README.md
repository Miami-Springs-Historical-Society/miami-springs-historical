# Miami Springs Historical Society Website

Static website for the [Miami Springs Historical Society](https://miamispringshistoricalsociety.com), built with [Astro](https://astro.build) and hosted on [Cloudflare Workers](https://workers.cloudflare.com).

## How it works

```
Edit files → git commit → git push to main → GitHub Actions builds & deploys → site is live (~1 min)
```

Content — events, board members, and site settings — is stored as plain files in this repo. There is intentionally **no admin/CMS panel** — content is edited directly in the files (see [Updating content](#updating-content)). Change a file, push it, and the site updates automatically.

## Quick start (local development)

```bash
npm install        # first time only
npm run dev        # http://localhost:4321
npm run build      # verify production build locally
npx astro check    # type check (same as CI)
```

Node 22 (see `.node-version`).

## Updating content

### Site settings
Edit `src/data/general.json` — tagline, about text, hours, email, phone, P.O. box, Facebook URL, donate link, EIN. Changes propagate to all sections of the site automatically.

> **Note:** Museum hours appear in **three** places — `src/data/general.json`, and `footer.hours` in both `src/i18n/en.json` and `src/i18n/es.json`. Update all three if hours change.

### Events
Add a file to `src/content/events/` named `YYYY-MM-DD-slug.md`:

```markdown
---
title: "Annual Membership Meeting"
date: 2026-04-14T18:30:00-04:00
location: "Curtiss Mansion, 500 Deer Run Drive"
time: "6:30 PM"      # optional display string
price: "Free"        # optional
endDate: 2026-04-15  # optional, for multi-day events
---

Description of the event.
```

The site automatically sorts events by date and hides them after they pass.

For a recurring event (second Tuesday each month), use `recurring` instead of `date`:

```markdown
---
title: "Museum Open Hours"
recurring: "monthly-second-tuesday"
recurringStartAfter: 2026-04-14
location: "501 East Drive"
---
```

Every event needs either `date` or `recurring` — the schema in `src/content.config.ts` rejects a file with neither.

### Board members
Add or edit a file in `src/content/board/`. The `order` field controls display order.

```markdown
---
name: "Jane Smith"
role: "President"
order: 1
photo: "/jane-smith.jpg"   # optional
---
```

For a vacant seat, set `vacant: true` and omit `name` — the seat still renders, showing the role with a "vacant" label. Setting `name: "TBD"` instead hides the seat from the site entirely.

### Images
Drop files into `public/`. Reference them in components as `/filename.jpg`.

## Internationalization

The site is fully bilingual (English / Spanish) on `main`. Spanish pages live under the `/es/` prefix.

- Translation strings live in `src/i18n/en.json` and `src/i18n/es.json`
- The `useTranslations(locale)` helper in `src/i18n/utils.ts` looks up keys with dot notation and falls back to English if a key is missing
- All components use `const t = useTranslations(Astro.currentLocale)` to get locale-appropriate strings
- Astro's i18n routing (`astro.config.mjs`) handles the `/es/` prefix — the default locale (English) has no prefix
- A Cloudflare Worker (`worker.ts`) redirects Spanish-preferring browsers to `/es` on first visit based on `Accept-Language`, and a `lang` cookie persists the user's explicit choice when they switch manually

To update translations, edit `src/i18n/es.json`. Every key in `en.json` should have a corresponding key in `es.json`.

## Pages

| English | Spanish | Description |
|---|---|---|
| `/` | `/es` | Home — hero, about, history slideshow, events, connect, board, footer |
| `/museum` | `/es/museum` | Museum exhibits, visit info, satellite locations |
| `/resources` | `/es/resources` | Curated external references for Miami Springs history research |
| `/welcome` | `/es/welcome` | Membership landing page (`noindex`) |
| `/thank-you` | `/es/thank-you` | Post-donation thank-you page (`noindex`) |
| `/rss.xml` | — | RSS feed of upcoming events |
| `/*` (no match) | `/es/*` | Custom 404 page with 1920s land boom theme |

## Project structure

```
miami-springs-historical/
├── public/                  # Static assets (images, favicon, _headers)
├── src/
│   ├── components/          # Page sections
│   │   ├── Nav.astro        # Navigation with language switcher
│   │   ├── Hero.astro       # Full-bleed hero with CTA
│   │   ├── About.astro      # About section + history slideshow
│   │   ├── Events.astro     # Upcoming events from content collection
│   │   ├── FacebookFeed.astro  # Embedded Facebook Page widget + connect section
│   │   ├── Board.astro      # Board of directors from content collection
│   │   └── Footer.astro     # Footer with hours, links, attribution
│   ├── content.config.ts    # Zod schema validation for content collections
│   ├── content/
│   │   ├── events/          # One .md file per event
│   │   └── board/           # One .md file per board member
│   ├── data/
│   │   ├── general.json     # Site-wide settings (hours, contact, donate link)
│   │   └── resources.ts     # Curated links data for the resources page
│   ├── i18n/
│   │   ├── en.json          # English translation strings
│   │   ├── es.json          # Spanish translation strings
│   │   └── utils.ts         # useTranslations() helper with English fallback
│   ├── layouts/
│   │   └── Layout.astro     # Base HTML, SEO meta, structured data, global styles
│   ├── utils/
│   │   └── events.ts        # Resolves recurring events to their next date
│   └── pages/
│       ├── index.astro      # Home page (English)
│       ├── museum.astro     # Museum page (English)
│       ├── resources.astro  # Resources & references page (English)
│       ├── welcome.astro    # Membership page (English)
│       ├── thank-you.astro  # Donation thank-you page (English)
│       ├── 404.astro        # Custom 404 page (English)
│       ├── rss.xml.ts       # RSS feed generator
│       └── es/              # Spanish equivalents of all pages
├── docs/
│   └── archive/             # Reference copy of the former Wix site's content
├── worker.ts                # Cloudflare Worker — static assets + language detection/redirect
├── wrangler.jsonc           # Cloudflare Workers configuration
├── astro.config.mjs         # Astro config (i18n, sitemap, build-time CSP script hashes)
├── .github/
│   └── workflows/
│       ├── ci.yml           # astro check + build on PRs to main
│       ├── deploy.yml       # Build + deploy to Cloudflare on push to main
│       └── audit.yml        # Monthly npm audit; alerts on new advisories
├── CLAUDE.md                # Conventions for AI-assisted edits
├── STYLE_GUIDE.md           # Design system — colors, type, spacing, components
└── package.json
```

## Security headers

`public/_headers` carries the site's CSP and related headers. The `script-src` hashes are **generated at build time** by the `csp-script-hashes` integration in `astro.config.mjs`, which scans the built HTML for inline scripts and rewrites the header in `dist/`. Don't hand-edit the hashes in the source `_headers` file — add or change inline scripts and rebuild instead.

`.github/workflows/audit.yml` runs `npm audit` monthly and fails only when an advisory appears that isn't in its reviewed `BASELINE` set.

## Accessibility

The site targets WCAG 2.1 AA compliance:

- Skip-to-main-content link for keyboard users
- `aria-labelledby` on all landmark sections
- `aria-current="page"` on active nav link
- Focus ring with sufficient contrast (green accent)
- Minimum font size 0.75rem across all elements
- Two-factor link styling (color + border-bottom) for non-color-dependent identification
- Semantic HTML throughout

## Tech stack

| Tool | Purpose |
|---|---|
| [Astro 7](https://astro.build) | Static site framework |
| [Cloudflare Workers](https://workers.cloudflare.com) | Hosting, CDN, and edge Worker |
| GitHub Actions | CI (type check + build on PRs), CD (deploy on push to main), monthly dependency audit |
| Markdown | Content authoring for events and board members |
| TypeScript + Zod | Schema validation for content collections |
| `@astrojs/sitemap` | Automatic sitemap generation |
| `@astrojs/rss` | RSS feed generation |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for one-time Cloudflare setup, required secrets, and deployment details.
