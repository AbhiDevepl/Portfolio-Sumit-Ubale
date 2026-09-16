/**
 * Checks the security-critical parts of the admin functions.
 *
 *   node --experimental-strip-types tests/check-admin-security.mjs
 *   (or `npm run check:admin`)
 *
 * Covers the three things that would actually hurt if they broke: the password
 * comparison, the session signature, and the filename/extension handling that
 * decides what can be written into the bucket. No network, no B2 account.
 */

import assert from 'node:assert/strict'
import { buildObjectKey, IMAGE_PREFIX, VIDEO_PREFIX } from '../netlify/lib/b2.ts'
import {
  checkPassword,
  clearSessionCookie,
  createSessionCookie,
  hasValidSession,
  requireSession,
} from '../netlify/lib/session.ts'

process.env.ADMIN_PASSWORD = 'correct-horse-battery-staple'

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
const checkAsync = async (name, fn) => {
  try {
    await fn()
    console.log(`  PASS  ${name}`)
  }
  catch (err) {
    failures++
    console.log(`  FAIL  ${name}\n        ${err.message}`)
  }
}

const cookieValue = header => header.split(';')[0]
const requestWith = cookie => new Request('https://supf.in/', { headers: cookie ? { cookie } : {} })

/* ---- password -------------------------------------------------------- */

check('correct password accepted', () => {
  assert.equal(checkPassword('correct-horse-battery-staple'), true)
})

check('wrong password rejected', () => {
  for (const bad of ['', 'wrong', 'correct-horse-battery-stapl', 'correct-horse-battery-staple ', undefined, null, 42, {}]) {
    assert.equal(checkPassword(bad), false, `accepted ${JSON.stringify(bad)}`)
  }
})

check('no password configured rejects everything', () => {
  const saved = process.env.ADMIN_PASSWORD
  delete process.env.ADMIN_PASSWORD
  try {
    assert.equal(checkPassword('anything'), false)
    assert.equal(checkPassword(''), false)
  }
  finally {
    process.env.ADMIN_PASSWORD = saved
  }
})

/* ---- session cookie -------------------------------------------------- */

check('fresh session validates', () => {
  assert.equal(hasValidSession(requestWith(cookieValue(createSessionCookie()))), true)
})

check('cookie is HttpOnly, Secure and SameSite=Strict', () => {
  const header = createSessionCookie()
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/']) {
    assert.ok(header.includes(flag), `missing ${flag}`)
  }
})

check('no cookie is rejected', () => {
  assert.equal(hasValidSession(requestWith(null)), false)
  assert.equal(hasValidSession(requestWith('other=1')), false)
})

check('tampered signature is rejected', () => {
  const cookie = cookieValue(createSessionCookie())
  const [name, value] = [cookie.slice(0, cookie.indexOf('=')), cookie.slice(cookie.indexOf('=') + 1)]
  const dot = value.lastIndexOf('.')
  const payload = value.slice(0, dot)
  const signature = value.slice(dot + 1)

  // Re-signed by hand, unsigned, and bit-flipped variants must all fail.
  assert.equal(hasValidSession(requestWith(`${name}=${payload}.`)), false, 'empty signature accepted')
  assert.equal(hasValidSession(requestWith(`${name}=${payload}`)), false, 'unsigned payload accepted')
  const flipped = `${signature.slice(0, -1)}${signature.at(-1) === 'A' ? 'B' : 'A'}`
  assert.equal(hasValidSession(requestWith(`${name}=${payload}.${flipped}`)), false, 'flipped signature accepted')
})

check('extending the expiry without re-signing is rejected', () => {
  const cookie = cookieValue(createSessionCookie())
  const value = cookie.slice(cookie.indexOf('=') + 1)
  const dot = value.lastIndexOf('.')
  const forged = `${Date.now() + 10 ** 12}.${value.slice(dot + 1)}`
  assert.equal(hasValidSession(requestWith(`sup_admin=${forged}`)), false)
})

check('a session signed with the old password is rejected', () => {
  const cookie = cookieValue(createSessionCookie())
  process.env.ADMIN_PASSWORD = 'rotated-password'
  try {
    assert.equal(hasValidSession(requestWith(cookie)), false)
  }
  finally {
    process.env.ADMIN_PASSWORD = 'correct-horse-battery-staple'
  }
})

check('logout cookie expires immediately', () => {
  assert.ok(clearSessionCookie().includes('Max-Age=0'))
})

/* ---- requireSession gate --------------------------------------------- */

await checkAsync('protected handler answers 401 without a session', async () => {
  let ran = false
  const handler = requireSession(async () => {
    ran = true
    return new Response('secret')
  })
  const response = await handler(requestWith(null))
  assert.equal(response.status, 401)
  assert.equal(ran, false, 'handler ran for an unauthenticated request')
})

await checkAsync('protected handler runs with a valid session', async () => {
  const handler = requireSession(async () => new Response('ok'))
  const response = await handler(requestWith(cookieValue(createSessionCookie())))
  assert.equal(response.status, 200)
})

await checkAsync('handler errors do not leak beyond their message', async () => {
  const handler = requireSession(async () => {
    throw new Error('B2 b2_list_file_names failed (401: bad_auth_token)')
  })
  const response = await handler(requestWith(cookieValue(createSessionCookie())))
  assert.equal(response.status, 502)
  const body = await response.json()
  assert.ok(!/B2_APPLICATION_KEY|B2_KEY_ID/.test(JSON.stringify(body)), 'response mentions a credential name')
})

/* ---- object keys ----------------------------------------------------- */

check('images and videos are routed to their prefix', () => {
  assert.ok(buildObjectKey('Haldi Shot.JPG').key.startsWith(IMAGE_PREFIX))
  assert.ok(buildObjectKey('teaser.mp4').key.startsWith(VIDEO_PREFIX))
  assert.equal(buildObjectKey('teaser.mp4').contentType, 'video/mp4')
  assert.equal(buildObjectKey('x.jpeg').contentType, 'image/jpeg')
})

check('unsupported types are rejected', () => {
  for (const name of ['payload.exe', 'icon.svg', 'notes.txt', 'archive.zip', 'noextension', '.jpg', 'x.php.jpg.php']) {
    assert.throws(() => buildObjectKey(name), /Unsupported file type/, `accepted ${name}`)
  }
})

check('non-string filenames are rejected', () => {
  for (const value of [undefined, null, 42, {}, [], '', '   ']) {
    assert.throws(() => buildObjectKey(value), `accepted ${JSON.stringify(value)}`)
  }
})

check('path traversal is stripped', () => {
  for (const name of ['../../etc/passwd.jpg', '..\\..\\windows\\evil.png', '/absolute/path/a.jpg', 'a/b/c/d.webp']) {
    const { key } = buildObjectKey(name)
    assert.ok(!key.includes('..'), `${name} -> ${key} still contains ..`)
    const rest = key.slice(key.indexOf('/') + 1)
    assert.ok(!rest.includes('/'), `${name} -> ${key} escaped its prefix`)
    assert.ok(key.startsWith(IMAGE_PREFIX) || key.startsWith(VIDEO_PREFIX), `${name} -> ${key}`)
  }
})

check('keys are URL-safe and unique', () => {
  const { key } = buildObjectKey('Ünïcode  name!!  (final)@#$.png')
  assert.match(key, /^images\/[a-z0-9-]+\.png$/, key)
  const a = buildObjectKey('same.jpg').key
  const b = buildObjectKey('same.jpg').key
  assert.notEqual(a, b, 'the same filename produced the same key twice')
})

console.log(failures ? `\n${failures} check(s) failed` : '\nAll admin security checks passed')
process.exit(failures ? 1 : 0)
