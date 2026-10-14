import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const base = new URL('https://de-omega-point.github.io/L4A_Landing/');
const hash = data => createHash('sha256').update(data).digest('hex');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const expected = hash(readFileSync('index.html'));
let ready = false;
for (let attempt = 0; attempt < 36; attempt++) {
  try {
    const response = await fetch(new URL('index.html?release=' + expected.slice(0,12),base), {signal:AbortSignal.timeout(15000),cache:'no-store'});
    if (response.ok && hash(new Uint8Array(await response.arrayBuffer())) === expected) { ready=true; break; }
  } catch { /* Pages may still be publishing. */ }
  console.log(`Waiting for matching Pages release (${attempt+1}/36).`);
  await sleep(10000);
}
assert(ready, 'Matching GitHub Pages release did not become publicly available.');
function assets(directory) {
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?assets(join(directory,entry.name)):[join(directory,entry.name)]);
}
const files=[...readdirSync('.').filter(path=>path.endsWith('.html')),...assets('assets')];
for (const path of files) {
  const response=await fetch(new URL(path + '?release=' + expected.slice(0,12),base),{signal:AbortSignal.timeout(15000),cache:'no-store'});
  assert(response.ok, `${path}: HTTP ${response.status}`);
  const bytes=new Uint8Array(await response.arrayBuffer());
  assert.equal(hash(bytes),hash(readFileSync(path)),`${path}: deployed file differs from checked source`);
  console.log(`PUBLIC_OK ${path}`);
}
console.log(`Verified ${files.length} published pages/assets against source at ${base.href}`);
