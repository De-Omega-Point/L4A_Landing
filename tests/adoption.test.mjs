import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const app = 'https://de-omega-point.com/apps/';
const appOrigin = 'https://loyalty-for-all-community.sammielee.chatgpt.site';
const pages = readdirSync('.').filter(path => path.endsWith('.html'));
const html = page => readFileSync(page, 'utf8');
const anchors = source => [...source.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(match => ({
  attributes: match[1],
  href: match[1].match(/\bhref="([^"]*)"/)?.[1],
  text: match[2].replace(/<[^>]*>/g, '').trim()
}));

test('primary Get buttons route through the public Portal with consistent copy', () => {
  const context = vm.createContext({window:{}});
  vm.runInContext(readFileSync('assets/js/config.js','utf8'),context);
  assert.equal(context.window.L4A_CONFIG.webAppUrl,app);
  assert.equal(context.window.L4A_CONFIG.paymentsEnabled,false);
  assert.equal(context.window.L4A_CONFIG.privacyVersion,'2026-11-20');
  for (const page of ['index.html','pricing.html','download.html','checkout.html','success.html']) {
    const buttons = anchors(html(page)).filter(link => /\bdata-start-app\b/.test(link.attributes));
    assert(buttons.length > 0, `${page}: missing Portal button`);
    for (const button of buttons) {
      assert.equal(button.text,'Get Loyalty-4-All',page);
      assert.equal(button.href,app,page);
    }
  }
});

test('the home journey explains account-free use and optional installation', () => {
  const home = html('index.html');
  const hero = home.match(/<div class="hero-actions">([\s\S]*?)<\/div>/)[1];
  const links = anchors(hero);
  assert.equal(links[0].text,'Get Loyalty-4-All');
  assert.equal(links[0].href,app);
  assert.equal(links[1].text,'Download &amp; install');
  assert.equal(links[1].href,'download.html');
  const how = home.match(/<section[^>]*id="how"[^>]*>([\s\S]*?)<\/section>/)[1];
  for (const step of ['Get the app','Install or open the app','Use it with customers']) assert(how.includes(step));
  assert.doesNotMatch(how,/checkout\.html|Join free|register interest/i);
  assert(home.indexOf('After you’ve used it') > home.lastIndexOf('data-start-app'));
  assert.match(home,/optional and does not sign you up for updates/);
});

test('navigation preserves product discovery without pilot promotion', () => {
  for (const page of pages) {
    const source = html(page);
    const nav = source.match(/<nav class="nav-links"[^>]*>([\s\S]*?)<\/nav>/)[1];
    assert.deepEqual(anchors(nav).map(link => link.href),['index.html','index.html#how','pricing.html','download.html'],page);
    assert.doesNotMatch(source,/pilot|Register interest|Prepare a request/i,page);
    assert.match(source,/assets\/images\/loyalty-4-all-logo\.png/,page);
    assert.match(source,/Online payments unavailable/,page);
    assert.match(source,/connect-src 'none'/,page);
    assert.match(source,/form-action 'none'/,page);
  }
});

test('legacy checkout remains usable feedback without registration or automatic transmission', () => {
  const source = html('checkout.html');
  assert.match(source,/<form[^>]*data-feedback-form/);
  assert.match(source,/<textarea[^>]*name="message"[^>]*maxlength="2000"[^>]*required/);
  for (const name of ['businessName','email','contactName']) {
    const control = source.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))[0];
    assert.doesNotMatch(control,/\brequired\b/);
  }
  assert.match(source,/<input[^>]*name="privacyAccepted"[^>]*required/);
  assert.doesNotMatch(source,/data-registration|name="updatesConsent"|membershipForm/);
  assert.match(source,/<noscript>[\s\S]*Email support directly[\s\S]*mailto:hello@de-omega-point.com/);
  assert.match(source,/There is no checkout here/);
  assert.match(source,/De-Omega-Point has not received this message/);
  assert.match(source,/does not send email, create an account or subscribe you to updates/);
});

test('local-first limitations and optional updates stay explicit and separate', () => {
  const community = html('pricing.html');
  for (const text of ['Free to use','Export regular backups','not automatically uploaded','synchronised across devices','Google Play, App Store, APK and ZIP']) {
    assert(community.includes(text),text);
  }
  assert.match(community,/Optional updates, separately/);
  assert.match(community,/optional and is not needed to use the loyalty tools/);
  const privacy = html('privacy.html');
  assert.match(privacy,/Your business name, preferred reply email and name are optional/);
  assert.match(privacy,/does not register you for the app or subscribe you to updates/);
  assert.match(privacy,/This product website does not collect registrations/);
  assert.match(privacy,/do not require an account, password or registration/);
  assert.match(privacy,/Earlier app versions described registration contact details/);
  assert.match(privacy,/historical references are not a current access requirement/);
  assert.match(privacy,/does not connect a Portal account or upload your local workspace/);
  assert.match(privacy,/not a password, verified identity or proof of paid access/);
  assert.match(privacy,/local workspace ID is a separate on-device reference/);
  assert.match(privacy,/20 November 2026/);
  assert.match(html('download.html'),/does not guarantee offline operation/);
});


test('public app links use canonical routes and copy does not require signup', () => {
  for (const page of pages) {
    const source = html(page);
    const appLinks = anchors(source).filter(link => link.href?.startsWith(appOrigin));
    const installEntries = page === 'download.html' ? [`${appOrigin}/community/?install=1`, `${appOrigin}/community/`] : [];
    for (const link of appLinks) assert([...installEntries, `${appOrigin}/community/privacy`, `${appOrigin}/community/terms`].includes(link.href), `${page}: unexpected app entrypoint`);
    assert.doesNotMatch(source, /register free|registration is required|register if asked|complete registration|registration before|new users register/i, page);
  }
  for (const page of ['index.html','pricing.html','download.html']) {
    assert.match(html(page), /[Nn]o account/);
    assert.match(html(page), /installation is optional|optionally install|optional browser installation/i);
    assert.match(html(page), /password or payment/);
  }
});

test('installation guide keeps browser use optional and protects returning local workspaces', () => {
  const source = html('download.html');
  assert.match(source, /Open the live app first/);
  assert.match(source, /Installation is optional/);
  assert.match(source, /Google Play, App Store, APK and ZIP downloads remain paused/);
  assert.match(source, /not a native app-store download/);
  assert.match(source, /Historical Product IDs do not restore local records/);
  assert.match(source, /local workspace ID is an on-device reference/);
  assert.match(source, /Keep the original workspace intact and export a backup before moving/);
});
