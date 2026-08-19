# Miami Springs Historical Society — Style Guide

## Colors

All colors are defined as CSS custom properties in `src/layouts/Layout.astro`. **Never hardcode hex or rgba values in components.** Use these variables:

| Variable | Value | Use |
|---|---|---|
| `--color-primary` | `#8b4513` | Main brown — headings, buttons, links |
| `--color-primary-dark` | `#6b3410` | Hover state for primary |
| `--color-secondary` | `#d2b48c` | Tan — nav accents, decorative borders |
| `--color-accent` | `#2c5f2d` | Forest green — dividers, hover links, donate buttons |
| `--color-accent-dark` | `#1e4220` | Hover state for accent green elements |
| `--color-eyebrow` | `#a8e6a9` | Light green — accent text on dark backgrounds |
| `--color-bg` | `#faf6f0` | Off-white page background |
| `--color-bg-alt` | `#e8d8c4` | Warm tan — alternate section backgrounds |
| `--color-text` | `#2a1a0e` | Body text |
| `--color-text-muted` | `#6b5040` | Secondary text |
| `--color-white` | `#fff` | Pure white |
| `--color-nav-bg` | `rgba(42,26,14,0.93)` | Nav bar background |
| `--color-nav-bg-mobile` | `rgba(42,26,14,0.97)` | Nav mobile dropdown |
| `--color-overlay-dark` | `rgba(42,26,14,0.82)` | Dark photo overlay |
| `--color-overlay-light` | `rgba(250,246,240,0.88)` | Light panel overlay |
| `--color-panel-text-light` | `rgba(250,246,240,0.92)` | Body text on dark panels |
| `--color-panel-counter-light` | `rgba(250,246,240,0.7)` | Secondary text on dark panels |
| `--color-panel-counter-dark` | `rgba(42,26,14,0.6)` | Secondary text on light panels |
| `--color-footer-text` | `rgba(250,246,240,0.6)` | Footer body text |
| `--color-footer-link-border` | `rgba(250,246,240,0.5)` | Footer link underline |
| `--color-footer-link-border-hover` | `rgba(250,246,240,0.7)` | Footer link underline hover |
| `--color-btn-ghost-border` | `rgba(255,255,255,0.55)` | Ghost button border |
| `--color-btn-ghost-hover` | `rgba(255,255,255,0.08)` | Ghost button hover background |
| `--color-facebook` | `#1877f2` | Facebook brand blue |
| `--color-facebook-dark` | `#0f5cc9` | Facebook brand blue hover |
| `--color-overlay-gradient-start` | `rgba(42,26,14,0.6)` | Photo overlay gradient top |
| `--color-overlay-gradient-mid` | `rgba(42,26,14,0.75)` | Photo overlay gradient middle |
| `--color-overlay-gradient-end` | `rgba(42,26,14,0.88)` | Photo overlay gradient bottom |
| `--color-banner-overlay-start` | `rgba(42,26,14,0.35)` | Shorter banner overlay gradient top (lighter) |
| `--color-banner-overlay-mid` | `rgba(42,26,14,0.72)` | Shorter banner overlay gradient middle |
| `--color-photo-credit` | `rgba(255,255,255,0.5)` | Photo credit text on dark photo |
| `--color-photo-credit-link` | `rgba(255,255,255,0.6)` | Photo credit link on dark photo |
| `--color-photo-credit-link-hover` | `rgba(255,255,255,0.9)` | Photo credit link hover on dark photo |

### Contrast rules (WCAG 2.1 AA)

- Normal text on any background: **4.5:1 minimum**
- Large text (≥ 1.5rem bold or ≥ 2rem): **3:1 minimum**
- Decorative non-text elements (borders, dividers): **3:1 minimum**
- Dark green (`--color-accent`) **must not** be used for text or icons on the dark nav background — use `--color-secondary` instead
- Dark green **must not** be used for decorative elements on dark overlays — use `--color-eyebrow` instead

---

## Typography

| Variable | Value |
|---|---|
| `--font-display` | `'Playfair Display', Georgia, serif` |
| `--font-body` | `'Lora', Georgia, serif` |

- `--font-display` — headings (h1–h4), logo, section titles
- `--font-body` — all body copy, nav links, buttons, captions
- **Minimum font size: 0.75rem.** Never go smaller.
- Both fonts are loaded via Google Fonts in `Layout.astro`.

---

## Spacing

Max content width: `--max-width: 1100px`

Recurring patterns:
- Section top/bottom padding: `5rem 0`
- Container horizontal padding: `0 2rem`
- Section heading bottom margin: `1rem`
- Divider bottom margin: `2.5rem` (centered), `1.25rem` (left-aligned)

---

## Components

### Section title + divider

Every section uses this pattern:

```html
<h2 id="[section]-heading" class="section-heading">
  <a href="#[section]">Section Title</a>
</h2>
<div class="divider"></div>
```

```css
.section-heading {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  color: var(--color-primary);
  margin-bottom: 1rem;
  text-align: center;
}
.divider {
  width: 60px;
  height: 3px;
  background-color: var(--color-accent);
  margin: 0 auto 2.5rem;
}
```

Use `.divider--left` for left-aligned dividers (shorter bottom margin: `1.25rem`).
On **dark panel backgrounds**, use `--color-eyebrow` for the divider instead of `--color-accent`.

**Exception — list/directory pages** (`resources.astro`): Use left-aligned `display: inline-block` headings with `border-bottom: 2px solid var(--color-accent)` instead of the centered + divider pattern. This suits grouped link lists better than a decorative divider bar.

### Buttons

Shared by every variant: `--font-body`, `0.8125rem`, uppercase, `letter-spacing: 0.1em`, `2px` border, `white-space: nowrap`.

**Primary:**
- Background: `--color-primary` / hover: `--color-primary-dark`
- Text: `--color-white`
- Border: `2px solid --color-primary`
- Padding: `0.75rem 1.5rem`

**Ghost (on dark/photo backgrounds):**
- Background: transparent / hover: `--color-btn-ghost-hover`
- Text: `--color-white`
- Border: `2px solid --color-btn-ghost-border`
- Padding: `0.75rem 2rem`
- The border token's `0.7` alpha is load-bearing — see Accessibility below before lowering it.

**Link-style:**
- Text: `--color-primary` / hover: `--color-accent`
- `border-bottom: 2px solid --color-accent`
- Font: `0.8125rem`, uppercase

**Donate (accent green):**
- Background: `--color-accent` / hover: `--color-accent-dark`
- Text: `--color-white`
- Border: `2px solid --color-accent`
- Padding: `0.75rem 2rem` in the hero, `0.5rem 1.5rem` in the footer
- Use exclusively for donation/financial support CTAs to visually distinguish them from navigation actions. Do not use for general page navigation.

**Nav pills (JOIN / DONATE in the menu):**
- Padding: `0.3rem 0.875rem`, `letter-spacing: 0.08em`
- Border: `1px solid --color-secondary` — **required**, not decorative. Both fills sit at roughly 2.2–2.4:1 against the nav bar, so the border is what carries the 3:1 boundary contrast, and it holds on hover where the fills darken further.
- JOIN uses `--color-primary`, DONATE uses `--color-accent`. Membership signup is not a donation, so it does not take the green.

### Button groups

- Side by side above `640px`, `1rem` gap, centered
- Below `640px`, stack in a column at equal width, `max-width: 22rem`, centered

Equal width matters on the stack: left to wrap naturally, a button's width tracks its label length, so the longest label wins the most visual weight regardless of importance — and Spanish labels run considerably longer than English. Stacked at one width, emphasis comes from color, which is the part you control.

### Hover states

Every interactive element needs a hover change someone can actually perceive.

- If the only change is color and the two states are under roughly `1.5:1` apart, add a second cue. A nav link going `--color-bg` → `--color-white` is a 1.08:1 change, i.e. nothing.
- The second cue should be an underline, applied as a `border-bottom` that is present but `transparent` at rest so nothing reflows when it appears.
- Never signal hover with italic, bold, or a size change — they alter text metrics, so the element shifts under the cursor.
- Solid-fill buttons are the exception: darkening a large area of fill reads on its own and needs no underline.

---

## Accessibility

This site targets **WCAG 2.1 AA**.

- Every `<section>` must have `aria-labelledby` pointing to its heading `id`
- Use semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`
- All images must have descriptive `alt` text (not empty, not "image of")
- Focus styles use the global rule in `Layout.astro` — do not override `:focus-visible` without maintaining visibility
- Do not go below `0.75rem` font size
- The skip link (`<a class="skip-link">`) in `Layout.astro` must remain as-is
- Any link that opens a new tab gets `aria-label={`${label} ${t('layout.opens_new_tab')}`}` — never hardcode the phrase, it has to translate
- Mark the current page with `aria-current="page"` wherever a page links to itself

### Contrast

Two different thresholds, and it's easy to meet one while failing the other:

- **Text — 4.5:1** against its background (WCAG 1.4.3 AA)
- **Boundaries and non-text — 3:1** against *adjacent* colors (WCAG 1.4.11). This covers what makes a control identifiable as a control.

A filled button can pass the first and fail the second. Both nav pills do exactly that: white on them is 7.1:1 and 7.55:1, comfortably legible, while the fills are only 2.2–2.4:1 against the nav bar. Hence the required `--color-secondary` border.

When fixing a boundary, prefer adding a border over lightening the fill. Fills usually darken on hover, which re-breaks a fix made in the fill; a border color that doesn't change holds in every state.

Check the worst case, not the typical one. `--color-btn-ghost-border` sits over a photograph, so the relevant background is the *brightest* area the photo can present, not its average. At `0.55` alpha that measured 2.99:1 and failed; `0.7` gives 3.80:1.

---

## Internationalization

All user-facing strings go in `src/i18n/en.json` (English) and `src/i18n/es.json` (Spanish). Every key in `en.json` must have a matching key in `es.json`.

**Allowed exceptions for hardcoded strings:** proper nouns (org name, place names), addresses, email addresses, phone numbers, photo credits, board member role titles (President, Vice President, etc. — intentionally left in English on both locales).

---

## Adding new CSS variables

If a new color or opacity variant is needed and no existing variable fits, add it to the `:root` block in `src/layouts/Layout.astro` before using it. Name variables by role, not by value (e.g., `--color-footer-link-border`, not `--color-white-50`).
