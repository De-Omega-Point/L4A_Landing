import { readFileSync, existsSync } from 'node:fs';

const pages = ['index.html', 'pricing.html', 'checkout.html', 'success.html', 'download.html', 'privacy.html', 'admin.html'];
const localHrefPattern = /(?:href|src)="([^"]+)"/g;
let failures = 0;

for (const page of pages) {
  if (!existsSync(page)) {
    console.error(`Missing required page: ${page}`);
    failures += 1;
    continue;
  }
  const html = readFileSync(page, 'utf8');
  for (const match of html.matchAll(localHrefPattern)) {
    const target = match[1];
    if (target.startsWith('http') || target.startsWith('#') || target.startsWith('mailto:')) continue;
    const clean = target.split('?')[0].split('#')[0];
    if (!clean || clean.endsWith('/')) continue;
    if (!existsSync(clean)) {
      console.error(`${page} references missing local file: ${target}`);
      failures += 1;
    }
  }
}

if (failures) process.exit(1);
console.log(`Checked ${pages.length} pages and local asset references.`);
