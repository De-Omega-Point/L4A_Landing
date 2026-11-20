import test from 'node:test';
import assert from 'node:assert/strict';
import { checkApp } from '../scripts/check-app.mjs';

const html = text => new Response(text, {headers: {'content-type':'text/html'}});
const js = text => new Response(text, {headers: {'content-type':'text/javascript'}});
const manifest = (values = {}) => Response.json({name:'Loyalty-4-All',start_url:'./',scope:'./',display:'standalone',...values});
function fixture(overrides = {}) {
  const calls = [];
  const routes = {
    '/community/': () => html('<main id="appShell">Counter · Free, no sign-up</main><script type="module" src="js/app.js"></script>'),
    '/community/manifest.webmanifest': () => manifest(),
    '/community/service-worker.js': () => js("const CACHE_PREFIX = 'loyalty-4-all-community-'; self.addEventListener('install', () => {}); self.addEventListener('fetch', () => {});"),
    '/community/js/app.js': () => js("import {state} from './state.js';"),
    '/community/privacy': () => html('<h1>Privacy Notice</h1>'),
    '/community/terms': () => html('<h1>Community Edition Terms</h1>'),
    '/community/css/styles.css': () => new Response('body {color: black}', {headers:{'content-type':'text/css'}}),
    '/community/assets/loyalty-4-all-logo.png': () => new Response(new Uint8Array([137,80,78,71,13,10,26,10]), {headers:{'content-type':'image/png'}})
  };
  const fetcher = async (url, options) => {
    calls.push({url, options});
    const respond = overrides[url.pathname] || routes[url.pathname];
    assert(respond, `Unexpected request: ${url}`);
    return respond(options);
  };
  return {fetcher, calls};
}

test('probe uses only anonymous GETs for the public app and canonical assets', async () => {
  const {fetcher, calls} = fixture();
  assert.match(await checkApp(fetcher), /passed anonymous GET checks/);
  assert.equal(calls.length, 8);
  for (const {url, options} of calls) {
    assert.equal(url.origin, 'https://loyalty-for-all-community.sammielee.chatgpt.site');
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers, undefined);
    assert.equal(options.body, undefined);
    assert(options.signal instanceof AbortSignal);
    assert.doesNotMatch(url.pathname, /register|api\/|\.html$/);
  }
});

test('app checks reject a registration gate and a generic HTML success page', async () => {
  for (const body of ['<form>Register for Loyalty-4-All</form>', '<h1>Sign in</h1>', '<main>OK</main>']) {
    await assert.rejects(checkApp(fixture({'/community/': () => html(body)}).fetcher), /Public app shell missing/);
  }
});

test('all required resources must be public HTTP 200', async () => {
  const {calls, fetcher} = fixture();
  await checkApp(fetcher);
  for (const {url} of calls) {
    for (const status of [403, 404, 500]) {
      await assert.rejects(checkApp(fixture({[url.pathname]: () => new Response('unavailable',{status})}).fetcher), /expected public HTTP 200/);
    }
  }
});

test('canonical resources reject all redirects without requesting their destinations', async () => {
  for (const path of ['/community/', '/community/privacy', '/community/terms', '/community/service-worker.js']) {
    for (const location of ['/register', '/community/privacy.html', 'https://untrusted.example/', 'https://user:secret@loyalty-for-all-community.sammielee.chatgpt.site/']) {
      const {fetcher, calls} = fixture({[path]: () => new Response(null,{status:307,headers:{Location:location}})});
      await assert.rejects(checkApp(fetcher), /HTTP 307/);
      assert.equal(calls.at(-1).url.pathname, path, 'Redirect must not be followed');
    }
  }
});

test('manifest must retain the existing origin, app scope, start URL and standalone display', async () => {
  for (const key of ['start_url','scope']) {
    for (const value of [undefined, '/register', '/', 'https://another.example/community/']) {
      await assert.rejects(checkApp(fixture({'/community/manifest.webmanifest': () => manifest({[key]:value})}).fetcher), /Manifest/);
    }
  }
  await assert.rejects(checkApp(fixture({'/community/manifest.webmanifest': () => manifest({display:'browser'})}).fetcher), /manifest display/);
});

test('HTML fallback cannot masquerade as manifest, worker, app, CSS or logo', async () => {
  for (const path of ['/community/manifest.webmanifest','/community/service-worker.js','/community/js/app.js','/community/css/styles.css','/community/assets/loyalty-4-all-logo.png']) {
    await assert.rejects(checkApp(fixture({[path]: () => html('<h1>Sign in</h1>')}).fetcher), /unexpected content type/);
  }
});

test('expected legal headings and worker handlers must be present', async () => {
  for (const route of ['privacy','terms']) {
    await assert.rejects(checkApp(fixture({[`/community/${route}`]: () => html('<h1>Welcome</h1>')}).fetcher), /legal notice missing/);
  }
  await assert.rejects(checkApp(fixture({'/community/service-worker.js': () => js("const CACHE_PREFIX = 'loyalty-4-all-community-';")}).fetcher), /Worker install handler missing/);
});

test('network and body errors fail the probe', async () => {
  await assert.rejects(checkApp(async () => {throw new Error('network unavailable');}), /network unavailable/);
  await assert.rejects(checkApp(fixture({'/community/': () => ({status:200,headers:new Headers({'content-type':'text/html'}),text:async () => {throw new Error('body interrupted');}})}).fetcher), /body interrupted/);
});
