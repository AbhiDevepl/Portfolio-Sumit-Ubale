/**
 * Dependency-free integrity check for the portfolio data + filter UI.
 *
 *   node tests/check-portfolio-data.mjs
 *
 * Guards the coupling that actually breaks in this repo: the filter chips in
 * pages/portfolio.html filter on `item.category`, which portfolio-gallery.js
 * sets from the KEY of data.portfolio.images. So every chip's data-category
 * must match an images key, or the chip silently renders an empty grid.
 */

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('..', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

const data = JSON.parse(read('data/portfolio.json'));
const html = read('pages/portfolio.html');

const images = data.portfolio.images;
const imageKeys = Object.keys(images);
const categories = data.portfolio.categories;

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
};

// 1. Every filter chip maps to a real, non-empty data source.
const chips = [...html.matchAll(/data-category="([^"]+)"/g)].map((m) => m[1]);
assert.ok(chips.length > 1, 'no filter chips found in portfolio.html');

for (const chip of chips) {
  check(`chip "${chip}" has data`, () => {
    if (chip === 'all') {
      const total = imageKeys.reduce((n, k) => n + images[k].length, 0);
      assert.ok(total > 0, 'no images at all');
      return;
    }
    assert.ok(imageKeys.includes(chip), `no images key "${chip}" (have: ${imageKeys.join(', ')})`);
    assert.ok(images[chip].length > 0, `category "${chip}" is empty`);
  });
}

// 2. Every declared category resolves to data (an empty grid otherwise).
for (const cat of categories) {
  check(`category "${cat.id}" resolves`, () => {
    if (cat.id === 'all') return;
    assert.ok(imageKeys.includes(cat.id), `declared category "${cat.id}" has no images array`);
  });
}

// 3. Every item has the fields the renderer and lightbox rely on.
check('all items well-formed', () => {
  for (const [key, items] of Object.entries(images)) {
    items.forEach((item, i) => {
      assert.ok(item.src, `${key}[${i}] missing src`);
      assert.ok(/^https?:\/\//.test(item.src), `${key}[${i}] src is not absolute: ${item.src}`);
      assert.ok(item.alt, `${key}[${i}] missing alt text`);
      assert.ok(['image', 'video'].includes(item.type), `${key}[${i}] bad type: ${item.type}`);
    });
  }
});

// 4. Ids are unique within a category (used as React-less render keys / lightbox ids).
check('ids unique per category', () => {
  for (const [key, items] of Object.entries(images)) {
    const ids = items.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate ids in "${key}"`);
  }
});

// 5. Report the CDN split so a dead host is visible rather than silent.
const hosts = {};
for (const items of Object.values(images)) {
  for (const item of items) {
    const host = new URL(item.src).host;
    hosts[host] = (hosts[host] || 0) + 1;
  }
}
console.log('\n  Media hosts in use:');
for (const [host, n] of Object.entries(hosts).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(n).padStart(5)}  ${host}`);
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
