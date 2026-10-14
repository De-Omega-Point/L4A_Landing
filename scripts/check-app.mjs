import assert from 'node:assert/strict';
// Non-mutating probes: GETs and deliberately invalid/forbidden input only.
const app = new URL('https://loyalty-for-all-community.sammielee.chatgpt.site/community/');
const get = async path => {
  const response=await fetch(new URL(path,app),{signal:AbortSignal.timeout(20000)});
  const body=await response.text();
  assert.equal(response.status,200,`${path}: HTTP ${response.status}`);
  return body;
};
const index=await get('index.html');
assert(index.includes('id="appShell"'),'Core app shell missing.');
assert(index.includes('id="membershipForm"'),'Optional membership form missing.');
assert(!index.includes('id="registrationGate"'),'Unexpected compulsory registration gate.');
assert(index.includes('Loyalty-4-All'),'Product identity missing.');
await get('privacy.html');
await get('terms.html');
const manifest=JSON.parse(await get('manifest.webmanifest'));
assert(manifest.start_url,'App manifest start URL missing.');
await get(manifest.start_url);
for (const icon of manifest.icons || []) {
  const response=await fetch(new URL(icon.src,app),{signal:AbortSignal.timeout(20000)});
  assert(response.ok,'App icon missing: '+icon.src);
}
for (const path of ['js/app.js','js/membership.js','css/styles.css']) await get(path);
const endpoint=new URL('/api/community-members',app);
const invalid=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});
assert.equal(invalid.status,400,'Invalid membership must be rejected without creating a record.');
const forbidden=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://de-omega-point.github.io'},body:'{}',signal:AbortSignal.timeout(20000)});
assert.equal(forbidden.status,403,'Cross-origin registration must be rejected.');
console.log('Existing app: public pages, manifest, icons and entry assets reachable; optional membership form present; no compulsory registration gate.');
console.log('Invalid membership rejected (400); cross-origin request rejected (403); no record created.');
console.log('Valid membership/database persistence, browser rendering and installation were not tested.');
