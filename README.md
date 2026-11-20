# Loyalty-4-All merchant website

A mobile-friendly product website for **Loyalty-4-All Community Edition**, reusing the seven-page static implementation from PR #1. It explains the merchant loyalty product and makes landing page → public Portal → account-free app use or optional browser installation the primary journey. Optional feedback and support use a visitor-controlled email hand-off after use. Online payments and paid entitlements are unavailable.

## Customer journeys

- **Get the app:** Understand the benefit here → **Get Loyalty-4-All** → the [De-Omega-Point Portal](https://de-omega-point.com/apps/) → Community Edition → set up a reward → use it with customers. No account, password or payment is needed. Browser installation is optional; the download guide also links directly to the live app’s install guide.
- **Optional feedback/support:** After use, share what worked or ask for help → message + privacy acknowledgement → review → compose email / copy / save text → visitor sends via their email provider. Business name, preferred reply email and name are optional; the sending email address is shared by the visitor’s email service.
- **Optional updates:** Any subscription is separate from app use. Feedback does not register anyone or subscribe them to updates. A Portal account prototype is not connected by this website and is not a launch requirement.
- **No JavaScript / no mail app:** a direct contact address is provided; copy into webmail or use the text-file fallback.
- **Old links:** `checkout.html?plan=driver` opens feedback and support without restoring checkout or signup. `success.html?order=anything` cannot confirm a payment or registration. `download.html` ignores browser order records and does not grant paid access. `admin.html` is a non-functional retirement notice, with no order table or activation controls.

A prepared email is **not a received message**. There is no automated acknowledgement, mailing-list subscription, account creation or paid access issuance. The visitor must send the email. Test the receiving mailbox separately before campaigns; publishing a contact address does not establish mailbox deliverability.

## Source evidence

- Historical product-source evidence inspected on **15 October 2026**: Sites version **13**, commit `6d54e07c4183a9fc6ceb1252ac5b215e27bbd127`; `public/community/index.html`, `public/community/privacy.html`, `public/community/js/membership.js`, `app/api/community-members/route.ts`. That inspection was read-only. At that time, `De-Omega-Point/L-4-A-2Market` contained an older compulsory-registration implementation. These are historical findings, not a statement of today’s app release or repository parity; current app-source work is reviewed separately.
- Existing Sites identity: `appgprj_6a6b5fb6e2c0819187c6ae3e75606052`; public URL returned by Sites on 15 October 2026: https://loyalty-for-all-community.sammielee.chatgpt.site
- Contact published on the company website: https://de-omega-point.com/ → `hello@de-omega-point.com`.
- Product logo copied unchanged from the existing app’s `public/community/assets/loyalty-4-all-logo.png`. No substitute brand mark was generated.

Current read-only evidence on **20 November 2026**: the public app at `/community/` serves the account-free shell and service worker cache marker `v84`; the extensionless `/community/privacy` and `/community/terms` return HTTP 200. The earlier registration-first candidate and its Product ID/receipt contract are historical, not today's access requirements. This correction starts from landing `main` commit `14c7f70bb2c0b16d6e0800817526e21bd98364f6` and does not modify the Sites app. Optional feedback remains a visitor-controlled email hand-off.

## Files

| Page | Purpose |
| --- | --- |
| `index.html` | Merchant product, benefits, local data, workflow, FAQ |
| `pricing.html` | Free Community Edition, local-data limits and separate optional updates; no paid offers |
| `checkout.html` | Optional feedback/support message, review and email/copy/text-file hand-off; legacy URL retained |
| `success.html` | Honest sent-mail guidance; never a receipt |
| `download.html` | Account-free entry, optional browser install guidance, paused native release status |
| `privacy.html` | Website/email/app data distinctions and legacy-prototype cleanup |
| `admin.html` | Retired prototype notice; no customer data or management actions |

## Validate

Node.js 22; no dependencies or build step:

```sh
npm run check
```

This checks local references and local-first safeguards, then runs the offline regression suite: Portal CTAs, canonical legal links, account-free copy, optional browser installation and returning-workspace backup guidance. Existing feedback validation, privacy acknowledgement, URL encoding, review/edit/clear, email status, interrupted/repeated clipboard actions, clipboard denial, blocked storage, text export, unsafe text and forged legacy access tests remain intact. Full-release byte-parity tests still simulate asset-only updates, mixed revisions, HTTP/network/body failures and deadlines. All fixtures are synthetic.

Run the separate public availability check:

```sh
node scripts/check-app.mjs
```

It performs eight anonymous GETs only: `/community/`, manifest, service worker, app module, canonical extensionless privacy and terms, CSS and official logo. It checks HTTP 200, media types and content markers, plus the existing manifest scope/start URL. Redirects fail without being followed, including same-origin redirects: canonical resources should serve directly. There are no registration API requests, POSTs, supplied cookies, auth or user records. Fixtures cover missing/gated resources, misleading HTML responses, redirects, altered manifest paths and network/body failures.

Local validation on Node.js 24.22.1: 51 tests passed; syntax and whitespace checks passed. The live GET probe passed with `NODE_USE_ENV_PROXY=1` (Node's supported environment-proxy option in this managed environment); direct networking was refused. GitHub CI uses Node.js 22. This HTTP probe does **not** prove service-worker registration/cache readiness, actual installation, offline reopening, workspace retention, browser rendering or mailbox delivery. The existing v84 offline-readiness issue is outside this landing correction; do not treat passing GET checks as resolving it.

## Publish

The existing GitHub Pages pipeline builds `main` from the repository root. `.nojekyll` keeps files unchanged. Merging a checked PR publishes the site, so retain the founder-approval gate before merging. The `Storefront checks` workflow validates changes and, on `main`, waits for and compares every public page/asset to the exact source bytes. Its cache key includes the sorted paths and hashes of the complete release, not just `index.html`. All files must match in one polling pass; stale files, HTTP failures and interrupted requests are retried. Requests (including their response bodies) have a 15-second limit capped by a shared 10-minute deadline, leaving headroom in the 12-minute workflow job. Timeout errors identify the last mismatching or unavailable files. It does not configure Pages or change a custom domain.

Expected project URL: https://de-omega-point.github.io/L4A_Landing/

If checks cannot reach it or a deployment fails, inspect the Pages build; do not treat a merge as proof of a working public site. This storefront-repository change does not itself modify the Sites app. Require matching-commit validation and the read-only public app probe before any separately approved merge. After publication, require full public-byte parity; do not run that comparison against an unpublished candidate and mistake the expected mismatch for a regression. No app cutover is part of this correction.

## Privacy and local-first boundaries

- No analytics, external SDKs, payment processors or background form requests.
- No form personal information stored in localStorage/sessionStorage or placed in this site’s URLs.
- User-triggered mailto, clipboard and file actions contain the reviewed message. Email delivery is controlled by the visitor and email providers.
- Browser form restoration may retain details. “Clear this message” resets form/review data; copies in email/clipboard/files remain the visitor’s responsibility.
- The feedback composer has no marketing opt-in or registration fields. App use and installation require no account. Receiving feedback does not automatically enrol anyone in a service.
- CSP blocks background connections, external scripts and native form submission. Without JavaScript, form fields are disabled and a direct email fallback is visible.
- Only the two old prototype keys can be explicitly deleted; no `localStorage.clear()` or app customer-record access.
- The app keeps customer records locally on the device. A local workspace ID is not a password or recovery key. Historical Product IDs do not restore records. Browser/installed windows may have separate storage; preserve the original workspace, export backups and check records before moving. No automatic backup or sync is promised.

## Gates before paid launch

1. **Founder approval:** confirm prices, currency, billing period, offer inclusions, refund/cancellation terms and tax treatment. No prices or live payment settings have been activated.
2. **Trusted backend:** create/capture orders server-side from an approved catalogue; verify PayPal status, merchant/payee, amount, currency and order identity; authenticate webhooks, handle retries idempotently, and reconcile cancellations/refunds. Store secrets in backend secret storage only.
3. **Identity and entitlements:** authenticate buyers, verify contact ownership, store entitlements durably, protect operator access and authorise every protected download server-side. A browser record or serial alone is never proof of access.
4. **Release:** publish signed/tested packages or verified store links; keep paid files private and use short-lived authorised links. An unsigned AAB build artifact is not a customer-installable APK.
5. **Validation:** sandbox purchase → entitlement → authorised download → expiry/cancellation/refund; reject forged/replayed events, mismatched amounts and unauthorised users. Obtain approval before any live payment activation.

Any future hosted feedback form would need server validation, rate limiting/abuse controls, retention/deletion handling and truthful delivery states. No such service is configured by this website. Connect an actual mailing service only after it is configured and tested.
