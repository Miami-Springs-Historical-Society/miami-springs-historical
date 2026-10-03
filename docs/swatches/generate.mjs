// Generates the color swatches shown in STYLE_GUIDE.md from the
// --color-* custom properties in src/layouts/Layout.astro.
//
// Run after changing a color:  node docs/swatches/generate.mjs
//
// Solid colors fill the swatch. Translucent colors are drawn over a light
// half (--color-bg) and a dark half (--color-text) so the alpha is visible.
// It also reports any STYLE_GUIDE.md table value that no longer matches.

import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const layout = readFileSync(join(root, 'src/layouts/Layout.astro'), 'utf8');
const colors = new Map(
  [...layout.matchAll(/^\s*--(color-[\w-]+):\s*([^;]+);/gm)].map(([, name, value]) => [name, value.trim()])
);

const light = colors.get('color-bg');
const dark = colors.get('color-text');
const W = 64;
const H = 24;

const isTranslucent = (v) => /^rgba\(/.test(v) && !/,\s*1(\.0+)?\s*\)$/.test(v);

const svg = (value) => {
  const body = isTranslucent(value)
    ? `<rect width="${W / 2}" height="${H}" fill="${light}"/>` +
      `<rect x="${W / 2}" width="${W / 2}" height="${H}" fill="${dark}"/>` +
      `<rect width="${W}" height="${H}" fill="${value}"/>`
    : `<rect width="${W}" height="${H}" fill="${value}"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<clipPath id="r"><rect width="${W}" height="${H}" rx="4"/></clipPath>` +
    `<g clip-path="url(#r)">${body}</g>` +
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="3.5" fill="none" stroke="#000" stroke-opacity="0.2"/>` +
    `</svg>\n`
  );
};

for (const file of readdirSync(here)) {
  if (file.endsWith('.svg') && !colors.has(file.slice(0, -4))) unlinkSync(join(here, file));
}
for (const [name, value] of colors) writeFileSync(join(here, `${name}.svg`), svg(value));
console.log(`Wrote ${colors.size} swatches to docs/swatches/`);

// Compare with the STYLE_GUIDE.md table (whitespace-insensitive).
const norm = (v) => v.replace(/\s+/g, '').toLowerCase();
const guide = readFileSync(join(root, 'STYLE_GUIDE.md'), 'utf8');
const rows = new Map(
  [...guide.matchAll(/^\|[^|]*\|\s*`--(color-[\w-]+)`\s*\|\s*`([^`]+)`/gm)].map(([, name, value]) => [name, value])
);
let stale = 0;
for (const [name, value] of colors) {
  if (!rows.has(name)) { console.warn(`STYLE_GUIDE.md: no row for --${name}`); stale++; }
  else if (norm(rows.get(name)) !== norm(value)) {
    console.warn(`STYLE_GUIDE.md: --${name} is ${rows.get(name)}, Layout.astro has ${value}`); stale++;
  }
}
for (const name of rows.keys()) {
  if (!colors.has(name)) { console.warn(`STYLE_GUIDE.md: --${name} is not in Layout.astro`); stale++; }
}
if (stale) process.exitCode = 1;
