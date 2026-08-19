# Deployment Guide

This site is an [Astro](https://astro.build) static site deployed to **Cloudflare Workers**
by **Cloudflare Workers Builds**, which builds and deploys straight from git. Every push to the
`main` branch triggers an automatic build and deploy — no manual steps required after initial
setup.

---

## How it works

```
Push to main → Cloudflare Workers Builds builds & deploys → site is live
```

Deployment is configured in the Cloudflare dashboard, not in this repo. GitHub Actions runs the
pull request checks and nothing else — it does not deploy.

The build runs `npm run build`, producing a `dist/` folder of static assets. The Cloudflare
Worker (`worker.ts`) serves those assets at the edge and handles automatic language detection
for the bilingual site. Custom 404 handling is configured in `wrangler.jsonc`.

### Language detection (Worker middleware)

On each request, `worker.ts` checks:
1. A `lang` cookie set by the user's explicit language choice in the nav
2. The `Accept-Language` request header

If Spanish is preferred and the visitor is on an English URL (no `/es/` prefix), they are
redirected to the Spanish equivalent. The cookie takes priority — once a user manually switches
language, the redirect does not override their choice.

---

## CI/CD workflows

### CI — `.github/workflows/ci.yml`
Runs on every pull request to `main`. Performs:
1. Astro type check (`npx astro check`)
2. Production build (`npm run build`)

Fails fast if the build is broken before anything reaches `main`.

This check is required by branch protection on `main`, so nothing broken can be merged — and
since Cloudflare deploys whatever lands on `main`, merge protection *is* the deploy gate.

### Branch protection on `main`

| Rule | Setting |
|---|---|
| Pull request required | Yes — no direct pushes |
| Approving reviews required | **0** — you can merge your own PR |
| Required check | `Type check & build` |
| Conversations must be resolved | Yes |
| Force pushes / branch deletion | Blocked |
| Applies to admins | No — admins retain a break-glass path |

Approvals are deliberately set to 0. Requiring even one would lock out a solo maintainer,
since GitHub does not let you approve your own pull request, and it would stall Dependabot
auto-merge permanently — a bot cannot obtain an approval.

To make the rules binding on admins too, set `enforce_admins` to true. That removes the
emergency path for pushing a fix directly, so it is a deliberate trade rather than a
straightforward upgrade.

### Purge cache — `.github/workflows/purge-cache.yml`
**On demand only.** Run it from the Actions tab ("Run workflow"), or `gh workflow run
purge-cache.yml`. It is not part of deploying and nothing triggers it automatically.

You should rarely need it. Assets are served with `Cache-Control: public, max-age=0,
must-revalidate` and a content-derived ETag, so replacing a file — even under the same
filename — makes caches revalidate and fetch the new bytes. It exists for the case where that
stops being true: a Cache Rule or Page Rule added in the Cloudflare dashboard can override
origin cache headers, and nothing in this repo would reveal it.

### Deployment used to run here
Until 2026-08-19 a `deploy.yml` workflow also built the site and ran `wrangler deploy` on every
push. That duplicated what Cloudflare Workers Builds was already doing — two pipelines building
the same commit, potentially with different Node and wrangler versions, both publishing to the
same Worker. It was removed. If you ever need to go back to deploying from GitHub, restore it
from history and disable the git integration in the Cloudflare dashboard, so only one pipeline
deploys.

### Required GitHub secrets

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Authenticates the cache purge API call |
| `CLOUDFLARE_ZONE_ID` | Identifies the DNS zone for cache purge |

Set these in the repo under **Settings → Secrets and variables → Actions**.

`CLOUDFLARE_API_TOKEN` needs the `Zone → Cache Purge` permission on this zone. Keep it scoped
to only what the workflow uses.

If a purge run fails, the workflow prints Cloudflare's HTTP status and response body, which
identifies the cause.

---

## One-time Cloudflare setup

These steps only need to be done once.

### 1. Log in to Cloudflare

Go to https://dash.cloudflare.com and log in.

### 2. Create a new Workers application

1. In the left sidebar, click **Workers & Pages**
2. Click **Create** → **Workers** → **Connect to Git**
3. Authorize Cloudflare to access your GitHub account if prompted
4. Select the repository: `Miami-Springs-Historical-Society/miami-springs-historical`
5. Click **Begin setup**

> **Note:** Choose **Workers**, not Pages. The repo uses `wrangler.jsonc` to configure
> static asset serving via the Workers platform.

### 3. Configure the build

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler@4.100.0 deploy` |
| Non-production branch deploy command | `npx wrangler@4.100.0 versions upload` |
| Build output directory | `dist` |
| Root directory | *(leave blank)* |

### 4. Set Node version

Expand **Environment variables** and add:

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |

> The `.node-version` file in the repo also signals this, but setting it explicitly
> ensures compatibility across all Cloudflare build environments.

### 5. Deploy

Click **Save and Deploy**. The first build takes about a minute.

---

## Custom domain

The live site is at **https://miamispringshistoricalsociety.com**.

To configure a custom domain after the initial deploy:

1. In your Workers application, go to **Settings → Domains & Routes**
2. Click **Add** → **Custom domain**
3. Enter `miamispringshistoricalsociety.com`
4. If the domain is on Cloudflare, DNS is configured automatically

---

## Caching

The `public/_headers` file disables caching for HTML:

```
/*.html
  Cache-Control: no-cache, no-store, must-revalidate

/
  Cache-Control: no-cache, no-store, must-revalidate
```

So content changes (events, board members) appear immediately after deploy.

Everything else is safe without a purge too, for two different reasons. CSS and JS ship under
content-hashed filenames (`_astro/Board.Dn6KGzMU.css`), so each build produces new URLs. Images
and other files in `public/` keep fixed names, but Cloudflare serves them with
`Cache-Control: public, max-age=0, must-revalidate` and a content-derived ETag — caches must
revalidate before reuse, and replacing a file changes its ETag, so the new bytes are fetched.

That is why purging is a manual button rather than a deploy step. Verify the behavior any time
with:

```bash
curl -sI https://miamispringshistoricalsociety.com/curtiss-mansion-entrance.jpg \
  | grep -i 'cache-control\|etag'
```

---

## Making content changes

All content is stored as files in this repository:

| Content | Location |
|---|---|
| Site settings (email, phone, Facebook URL) | `src/data/general.json` |
| Museum hours | Three places: `src/data/general.json`, plus `footer.hours` in `src/i18n/en.json` and `es.json` |
| Events | `src/content/events/` — one `.md` file per event |
| Board members | `src/content/board/` — one `.md file` per member |
| Resources page links | `src/data/resources.ts` |
| Images | `public/` |

`main` is protected — it takes pull requests, not direct pushes.

**From the command line:**
1. `git checkout -b your-change` — branch first
2. Edit the relevant file, then `git add` and `git commit`
3. `git push -u origin your-change`
4. `gh pr create` (or use the link git prints), wait for the check, then merge
5. Cloudflare rebuilds and deploys (~1 minute)

**From github.com**, which is easier for a one-line content edit:
1. Navigate to the file and click the pencil icon
2. Make the edit, then choose **Create a new branch for this commit and start a pull request**
3. Merge the pull request once the check goes green
4. Cloudflare rebuilds and deploys (~1 minute)

No approving review is required — you can merge your own pull request. The check just has to
pass first, which is what keeps a broken build from reaching the live site.

---

## Local development

```bash
npm install          # first time only
npm run dev          # dev server at http://localhost:4321
npm run build        # production build to dist/
npx astro check      # TypeScript type check
```

---

## Project structure

```
miami-springs-historical/
├── public/                  # Static files served as-is
│   └── _headers             # Edge caching headers
├── src/
│   ├── components/          # Astro components (Nav, Hero, About, Events, FacebookFeed, Board, Footer)
│   ├── content.config.ts    # Zod schema for content collections
│   ├── content/
│   │   ├── board/           # Board member markdown files
│   │   └── events/          # Event markdown files
│   ├── data/
│   │   ├── general.json     # Site-wide settings
│   │   └── resources.ts     # Resources page link data
│   ├── i18n/
│   │   ├── en.json          # English strings
│   │   ├── es.json          # Spanish strings
│   │   └── utils.ts         # useTranslations() helper
│   ├── layouts/
│   │   └── Layout.astro     # Base HTML layout with SEO and structured data
│   └── pages/
│       ├── index.astro      # Home page (English)
│       ├── museum.astro     # Museum page (English)
│       ├── resources.astro  # Resources & references page (English)
│       ├── 404.astro        # Custom 404 page (English)
│       ├── rss.xml.ts       # RSS feed
│       └── es/              # Spanish equivalents of all pages
├── worker.ts                # Cloudflare Worker entry point
├── wrangler.jsonc           # Cloudflare Workers config (assets, 404 handling)
├── astro.config.mjs         # Astro config (sitemap, i18n routing, output)
├── .github/workflows/       # CI and deploy workflows
├── .node-version            # Pins Node 22
└── package.json
```

---

## Tech stack

| Tool | Purpose |
|---|---|
| [Astro 5](https://astro.build) | Static site framework |
| [Cloudflare Workers](https://workers.cloudflare.com) | Hosting and CDN |
| [GitHub Actions](https://github.com/features/actions) | Pull request checks, dependency audit, manual cache purge |
| [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) | Builds and deploys every push to `main` |
| Markdown | Content authoring (events, board members) |
| TypeScript + Zod | Schema validation for content collections |
