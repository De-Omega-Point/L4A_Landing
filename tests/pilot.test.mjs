import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const coreSource = readFileSync('assets/js/core.js', 'utf8');
const configSource = readFileSync('assets/js/config.js', 'utf8');
const checkoutSource = readFileSync('assets/js/checkout.js', 'utf8');
function core() {
  const context = vm.createContext({});
  vm.runInContext(coreSource, context);
  return context.L4A;
}
const valid = {businessName:'Example Test Café', email:'OWNER@example.test', contactName:'Test Merchant', businessType:'Retail', privacyAccepted:true, updatesConsent:false};
test('valid merchant request normalises email and keeps marketing consent separate', () => {
  const api = core();
  const data = api.normaliseRequest(valid);
  assert.equal(data.email, 'owner@example.test');
  assert.equal(api.validateRequest(data), '');
  const text = api.buildRequestText(data, '2026-10-15');
  assert.match(text, /updates: NO, I have not opted in/);
  assert.match(text, /not a purchase/);
  assert.equal(api.normaliseRequest({...valid,updatesConsent:'true'}).updatesConsent, false);
  assert.match(api.buildRequestText({...data,updatesConsent:true}, '2026-10-15'), /YES, I opt in/);
});
test('empty, invalid, oversized and unacknowledged requests do not proceed', () => {
  const api = core();
  for (const change of [{businessName:'  '},{email:'wrong'},{email:'a@b'},{email:'a\n@b.test'},{businessName:'x'.repeat(121)},{contactName:'x'.repeat(121)},{privacyAccepted:false},{businessType:'driver'}]) {
    assert.notEqual(api.validateRequest(api.normaliseRequest({...valid,...change})), '');
  }
});
test('mailto encodes text and addresses only the configured recipient', () => {
  const api = core();
  const data = api.normaliseRequest({...valid,businessName:'A&B <script>alert(1)</script> ?subject=oops\nBcc:bad@example.test'});
  const body = api.buildRequestText(data,'2026-10-15');
  const url = new URL(api.buildMailto('hello@de-omega-point.com',body));
  assert.equal(url.protocol,'mailto:');
  assert.equal(url.pathname,'hello@de-omega-point.com');
  assert.equal(url.searchParams.get('body'),body);
  assert.deepEqual([...url.searchParams.keys()],['subject','body']);
  assert.equal(url.searchParams.has('bcc'),false);
  assert.throws(()=>api.buildMailto('bad@example.test?bcc=evil',body));
});
test('legacy removal touches only the two old prototype keys', () => {
  const deleted=[];
  core().forgetLegacyData({removeItem:key=>deleted.push(key)});
  assert.deepEqual(deleted,['l4a_orders','l4a_current_order']);
});
// Execute the production scripts against a small DOM harness. No backend or email is contacted.
function journey({clipboardFails=false, data=valid}={}) {
  const nodes=new Map();
  function element(key) {
    if (!nodes.has(key)) nodes.set(key,{hidden:key==='[data-request-review]',disabled:false,textContent:'',attributes:{},events:{},focus(){this.focused=true;},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];delete this[k];},addEventListener(k,fn){this.events[k]=fn;},async fire(event='click'){return await this.events[event]?.({preventDefault(){}});}});
    return nodes.get(key);
  }
  let values={...data};
  const form=element('[data-registration-form]');
  form.reportValidity=()=>true;
  form.reset=()=>{values={};};
  const copies=[],files=[],revoked=[],timers=[];
  const FakeURL={createObjectURL:blob=>{files.push(blob);return 'blob:test';},revokeObjectURL:url=>revoked.push(url)};
  const window={location:{search:'?order=forged&plan=driver&paid=true'},get localStorage(){throw new Error('storage blocked');}};
  const context=vm.createContext({window,document:{querySelector:element,getElementById:element,body:{append(){}},createElement(){return {click(){},remove(){}};}},FormData:class {get(name){return typeof values[name]==='boolean'?(values[name]?'on':null):(values[name]??null);}},navigator:{clipboard:{writeText:async text=>{if(clipboardFails) throw Error('denied');copies.push(text);}}},Blob,URL:FakeURL,setTimeout:fn=>timers.push(fn)});
  vm.runInContext(configSource,context);
  vm.runInContext(coreSource,context);
  vm.runInContext(checkoutSource,context);
  return {element,form,window,copies,files,revoked,timers,setValues:d=>values=d};
}
test('complete request journey: review, email hand-off, copy, edit and clear', async () => {
  const j=journey();
  assert.equal(j.element('[data-registration-fields]').disabled,false);
  await j.form.fire('submit');
  assert.equal(j.form.hidden,true);
  assert.equal(j.element('[data-request-review]').hidden,false);
  assert.equal(j.element('review-title').focused,true);
  assert.match(j.element('[data-compose-email]').href,/^mailto:hello@de-omega-point.com\?/);
  assert.match(j.element('[data-request-text]').textContent,/owner@example.test/);
  await j.element('[data-compose-email]').fire();
  assert.match(j.element('[data-copy-status]').textContent,/cannot verify delivery/);
  await j.element('[data-copy-request]').fire();
  assert.equal(j.copies.length,1);
  await j.element('[data-edit-request]').fire();
  assert.equal(j.form.hidden,false);
  assert.equal(j.element('[data-compose-email]').href,undefined);
  j.setValues({...valid,updatesConsent:true});
  await j.form.fire('submit');
  assert.match(j.element('[data-request-text]').textContent,/YES, I opt in/);
  await j.element('[data-clear-request]').fire();
  assert.equal(j.element('[data-request-text]').textContent,'');
  assert.equal(j.element('[data-compose-email]').href,undefined);
  assert.equal(j.form.hidden,false);
  assert.equal(j.window.L4A_CONFIG.paymentsEnabled,false);
  assert.equal(j.window.L4A.confirmPaymentWithBackend,undefined);
});
test('clipboard denial and text download remain truthful and usable', async () => {
  const j=journey({clipboardFails:true});
  await j.form.fire('submit');
  await j.element('[data-copy-request]').fire();
  assert.match(j.element('[data-copy-status]').textContent,/Select and copy/);
  await j.element('[data-save-request]').fire();
  assert.equal(j.files.length,1);
  assert.match(await j.files[0].text(),/Example Test Café/);
  assert.match(j.element('[data-copy-status]').textContent,/does not submit/);
  j.timers.forEach(fn=>fn());
  assert.deepEqual(j.revoked,['blob:test']);
});
test('invalid input stays on the form without an email link', async () => {
  const j=journey({data:{...valid,email:'bad'}});
  await j.form.fire('submit');
  assert.equal(j.form.hidden,false);
  assert.equal(j.element('[data-request-review]').hidden,true);
  assert.equal(j.element('[data-compose-email]').href,undefined);
  assert.match(j.element('[data-form-message]').textContent,/valid contact email/);
});
test('untrusted input is rendered as text without executing HTML', async () => {
  const j=journey({data:{...valid,businessName:'<img src=x onerror=alert(1)>'}});
  await j.form.fire('submit');
  assert.match(j.element('[data-request-text]').textContent,/<img src=x/);
  assert.equal(j.element('[data-request-text]').innerHTML,undefined);
});
test('legacy URLs and storage cannot turn status pages into proof of access', () => {
  for(const file of ['success.html','download.html','admin.html']) {
    const html=readFileSync(file,'utf8');
    assert.doesNotMatch(html,/success\.js|download\.js|admin\.js|data-download-button|data-order-summary/);
  }
  assert.match(readFileSync('success.html','utf8'),/not a payment receipt/);
  const form=readFileSync('checkout.html','utf8');
  assert.match(form,/<fieldset disabled/);
  assert.match(form,/<noscript>/);
  assert.doesNotMatch(form,/name="updatesConsent"[^>]*checked/);
});
