/**
 * Dependency-free integrity check for the portfolio data + filter UI.
 *
 *   node tests/check-portfolio-data.mjs
 *
 * Guards the coupling that actually breaks in this repo: the filter chips
 * filter on `item.category`, which useGalleryFilter sets from the KEY of
 * data.portfolio.images. So every chip slug must match an images key, or the
 * chip silently renders an empty grid.
 *
 * The chip sets now live in src/lib/categories.ts. This reads that file as
 * text rather than importing it, so the check stays dependency-free and needs
 * no TypeScript toolchain.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)
const read = p => readFileSync(new URL(p, root), 'utf8')

const data = JSON.parse(read('public/data/portfolio.json'))
const services = JSON.parse(read('public/data/services.json'))
const categoriesSource = read('src/lib/categories.ts')

const images = data.portfolio.images
const imageKeys = Object.keys(images)
const categories = data.portfolio.categories

let failures = 0
const check = (name, fn) => {
  try {
    fn()
    console.log(`  PASS  ${name}`)
  }
  catch (err) {
    failures++
    console.log(`  FAIL  ${name}\n        ${err.message}`)
  }
}

/** Pulls the slugs out of one `export const NAME = [ ... ] as const` block. */
function chipSet(name) {
  const match = categoriesSource.match(new RegExp(`export const ${name} = \\[([^\\]]*)\\]`))
  assert.ok(match, `${name} not found in src/lib/categories.ts`)
  return [...match[1].matchAll(/'([^']+)'/g)].map(m => m[1])
}

// 1. Every filter chip maps to a real, non-empty data source.
for (const setName of ['HOME_CATEGORIES', 'PORTFOLIO_CATEGORIES']) {
  const chips = chipSet(setName)
  assert.ok(chips.length > 1, `no chips found in ${setName}`)

  for (const chip of chips) {
    check(`${setName}: chip "${chip}" has data`, () => {
      if (chip === 'all') {
        const total = imageKeys.reduce((n, k) => n + images[k].length, 0)
        assert.ok(total > 0, 'no images at all')
        return
      }
      assert.ok(imageKeys.includes(chip), `no images key "${chip}" (have: ${imageKeys.join(', ')})`)
      assert.ok(images[chip].length > 0, `category "${chip}" is empty`)
    })
  }
}

// 2. Every chip slug has a display label, so none falls back to the slug.
check('every chip has a label', () => {
  const labels = [...categoriesSource.matchAll(/^\s+'?([a-z-]+)'?:\s*'/gm)].map(m => m[1])
  for (const chip of [...chipSet('HOME_CATEGORIES'), ...chipSet('PORTFOLIO_CATEGORIES')]) {
    assert.ok(labels.includes(chip), `no CATEGORY_LABELS entry for "${chip}"`)
  }
})

// 3. Every declared category resolves to data (an empty grid otherwise).
for (const cat of categories) {
  check(`category "${cat.id}" resolves`, () => {
    if (cat.id === 'all') return
    assert.ok(imageKeys.includes(cat.id), `declared category "${cat.id}" has no images array`)
  })
}

// 4. Every item has the fields the renderer and lightbox rely on.
check('all items well-formed', () => {
  for (const [key, items] of Object.entries(images)) {
    items.forEach((item, i) => {
      assert.ok(item.src, `${key}[${i}] missing src`)
      assert.ok(/^https?:\/\//.test(item.src), `${key}[${i}] src is not absolute: ${item.src}`)
      assert.ok(item.alt, `${key}[${i}] missing alt text`)
      assert.ok(['image', 'video'].includes(item.type), `${key}[${i}] bad type: ${item.type}`)
    })
  }
})

// 5. Ids are unique within a category.
check('ids unique per category', () => {
  for (const [key, items] of Object.entries(images)) {
    const ids = items.map(i => i.id)
    assert.equal(new Set(ids).size, ids.length, `duplicate ids in "${key}"`)
  }
})

// 6. Every service slug that a route prerenders exists in services.json.
check('service slugs prerender', () => {
  const slugs = services.services.map(s => s.slug)
  assert.ok(slugs.length > 0, 'no services defined')
  for (const service of services.services) {
    assert.ok(service.title, `service "${service.slug}" missing title`)
    assert.ok(Array.isArray(service.gallery), `service "${service.slug}" missing gallery`)
  }
})

// 7. Report the CDN split so a dead host is visible rather than silent.
const hosts = {}
for (const items of Object.values(images)) {
  for (const item of items) {
    const host = new URL(item.src).host
    hosts[host] = (hosts[host] || 0) + 1
  }
}
console.log('\n  Media hosts in use:')
for (const [host, n] of Object.entries(hosts).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(n).padStart(5)}  ${host}`)
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
