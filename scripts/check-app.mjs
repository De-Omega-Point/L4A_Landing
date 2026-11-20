import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const origin = 'https://loyalty-for-all-community.sammielee.chatgpt.site';

// Public availability/contract check only: no browser storage, auth, API calls or writes.
// Canonical routes must serve directly. Never follow a redirect to a sign-in page.
export async function checkApp(fetcher = fetch) {
  const get = async (path, type) => {
    const response = await fetcher(new URL(path, origin), {
      method: 'GET', redirect: 'manual', credentials: 'omit',
      signal: AbortSignal.timeout(20000)
    });
    assert.equal(response.status, 200, `${path}: expected public HTTP 200, got HTTP ${response.status}`);
    assert.match(response.headers.get('content-type') || '', type, `${path}: unexpected content type`);
    return response;
  };
  const html = await (await get('/community/', /text\/html/i)).text();
  assert.match(html, /id=["']appShell["']/, 'Public app shell missing');
  assert.match(html, /<script\b[^>]*src=["']js\/app\.js["']/, 'Public app module missing');
  assert.match(html, /Counter/, 'Counter entry missing');
  assert.match(html, /no sign-up|no account|without an account/i, 'Account-free app description missing');

  const manifestPath = '/community/manifest.webmanifest';
  const manifest = await (await get(manifestPath, /application\/(?:manifest\+json|json)/i)).json();
  assert.match(manifest.name || '', /Loyalty-4-All/, 'Unexpected manifest name');
  for (const key of ['start_url', 'scope']) {
    assert.equal(typeof manifest[key], 'string', `Manifest ${key} missing`);
    assert.equal(new URL(manifest[key], origin + manifestPath).href, origin + '/community/', `Manifest ${key} changed`);
  }
  assert.equal(manifest.display, 'standalone', 'Unexpected manifest display');

  const worker = await (await get('/community/service-worker.js', /(?:application|text)\/javascript/i)).text();
  assert.match(worker, /loyalty-4-all-community-/, 'Community worker cache marker missing');
  for (const event of ['install', 'fetch']) {
    assert.match(worker, new RegExp(`addEventListener\\(['"]${event}['"]`), `Worker ${event} handler missing`);
  }
  const app = await (await get('/community/js/app.js', /(?:application|text)\/javascript/i)).text();
  assert.match(app, /import\s/, 'App module content missing');
  for (const [route, heading] of [['privacy', /<h1\b[^>]*>Privacy Notice<\/h1>/i], ['terms', /<h1\b[^>]*>Community Edition Terms<\/h1>/i]]) {
    const legal = await (await get(`/community/${route}`, /text\/html/i)).text();
    assert.match(legal, heading, `${route}: legal notice missing`);
  }
  const css = await (await get('/community/css/styles.css', /text\/css/i)).text();
  assert.match(css, /\{[^}]+\}/, 'App styles missing');
  const logo = new Uint8Array(await (await get('/community/assets/loyalty-4-all-logo.png', /image\/png/i)).arrayBuffer());
  assert.deepEqual([...logo.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'Official logo is not a PNG');
  return 'Public Community app, manifest, service worker, module, canonical legal routes, styles and logo passed anonymous GET checks. No registration API, cookies or POSTs used. This does not prove installation, offline readiness or workspace retention.';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(await checkApp()); }
  catch (error) { console.error(error); process.exitCode = 1; }
}
