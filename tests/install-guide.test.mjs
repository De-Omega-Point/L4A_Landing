import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const script = readFileSync('assets/js/install-guide.js', 'utf8');
const html = readFileSync('download.html', 'utf8');
function run(ua, platform = '', touch = 0) {
  const keys = ['ios', 'android', 'desktop', 'safari', 'other'];
  let value = 'other';
  let onChange;
  const select = { options: keys.map(text => ({text})),
    get value() { return value; }, set value(next) { value = next; },
    get selectedIndex() { return keys.indexOf(value); },
    addEventListener(event, fn) { assert.equal(event, 'change'); onChange = fn; }
  };
  const panels = keys.map(guide => ({dataset: {guide}, hidden: false}));
  const picker = {hidden: true}, status = {textContent: ''};
  const classes = [];
  const document = {
    getElementById: id => ({'device-picker': picker, device: select, 'detected-device': status}[id]),
    querySelectorAll: query => { assert.equal(query, '[data-guide]'); return panels; },
    documentElement: {classList: {add: value => classes.push(value)}}
  };
  vm.runInNewContext(script, {document, navigator: {userAgent: ua, platform, maxTouchPoints: touch}});
  return {select, panels, picker, status, classes, change(next) { select.value = next; onChange(); }};
}
test('device guide suggests iOS, touch iPad, Android, desktop, Mac Safari and fallback', () => {
  for (const [ua, platform, touch, expected] of [
    ['iPhone Version/18 Safari', '', 0, 'ios'],
    ['Macintosh Version/18 Safari', 'MacIntel', 5, 'ios'],
    ['Android Chrome/130', '', 0, 'android'],
    ['Windows Chrome/130 Edg/130', '', 0, 'desktop'],
    ['Macintosh Version/18 Safari', '', 0, 'safari'],
    ['Android Firefox', '', 0, 'other'],
    ['Linux Firefox', '', 0, 'other'], ['', '', 0, 'other']
  ]) {
    const result = run(ua, platform, touch);
    assert.equal(result.select.value, expected);
    assert.equal(result.picker.hidden, false);
    assert.deepEqual(result.panels.filter(p => !p.hidden).map(p => p.dataset.guide), [expected]);
    assert.match(result.status.textContent, new RegExp(expected));
  }
});
test('manual selection overrides suggestion, with no focus theft or navigation', () => {
  const result = run('iPhone Safari');
  result.change('desktop');
  assert.equal(result.select.value, 'desktop');
  assert.deepEqual(result.panels.filter(p => !p.hidden).map(p => p.dataset.guide), ['desktop']);
  assert.equal(result.status.textContent, 'Showing: desktop.');
});
test('all five instruction panels and real app links work without JavaScript', () => {
  assert.equal([...html.matchAll(/<article data-guide="[^"]+">/g)].length, 5);
  assert.match(html, /<noscript>/);
  assert.match(html, /aria-describedby="device-hint"/);
  assert.match(html, /aria-live="polite"/);
  assert.equal([...html.matchAll(/href="https:\/\/loyalty-for-all-community\.sammielee\.chatgpt\.site\/community\/\?install=1"/g)].length, 2);
  assert.match(html, /same browser and profile/);
  assert.match(html, /L4A.Help@De-Omega-Point.Com/);
  assert.match(html, /working app still opens/);
  assert.doesNotMatch(html, /rel="manifest"|data-download-button|download=/i);
});
test('guide neither installs this storefront nor reads or sends user records', () => {
  assert.doesNotMatch(script, /serviceWorker|beforeinstallprompt|\.prompt\(|localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon|cookie|location\s*=/);
  assert.doesNotMatch(html, /<form|serviceWorker|rel="manifest"/);
});

test('every product logo links home and installation never implies recovery', () => {
  const logos = [...html.matchAll(/<a\b[^>]*href="index.html"[^>]*aria-label="Loyalty-4-All home"[^>]*>[\s\S]*?<img[^>]+loyalty-4-all-logo\.png[^>]*>/g)];
  assert.equal(logos.length, 2);
  assert.match(html, /Installing or opening another browser does not recover existing local records/);
  assert.match(html, /return to your original browser and profile or contact support/);
});
