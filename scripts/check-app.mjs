import assert from 'node:assert/strict';
// Non-mutating probes: GETs and deliberately invalid registration input only.
const app = new URL('https://loyalty-for-all-community.sammielee.chatgpt.site/community/');
const get = async path => {
  const response=await fetch(new URL(path,app),{signal:AbortSignal.timeout(20000)});
  const body=await response.text();
  assert.equal(response.status,200,`${path}: HTTP ${response.status}`);
  return body;
};
const index=await get('index.html');
assert.match(index,/registrationForm/,'Existing app registration form missing.');
assert.match(index,/Loyalty-4-All/);
await get('privacy.html');
await get('terms.html');
const manifest=JSON.parse(await get('manifest.webmanifest'));
assert(manifest.start_url,'App manifest start URL missing.');
const endpoint=new URL('/api/register',app);
const invalid=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});
assert.equal(invalid.status,400,'Invalid registration must be rejected without creating a record.');
console.log('Existing app: public index, privacy, terms and manifest reachable; invalid registration rejected (no record created).');
console.log('Valid registration/database persistence, browser rendering and installation were not tested.');
