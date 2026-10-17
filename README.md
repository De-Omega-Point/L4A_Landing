# Loyalty-4-All merchant website

A mobile-friendly product website for **Loyalty-4-All Community Edition**, reusing the seven-page static implementation from PR #1. It explains the merchant loyalty product and makes starting with the free app the primary journey. Optional feedback and support use a visitor-controlled email hand-off after use. Online payments and paid entitlements are unavailable.

## Customer journeys

- **Start using it:** Understand the benefit → See how it works → open Community Edition directly with **Start using Loyalty4All** → set up a reward → use it with customers. Core loyalty tools need no account or registration.
- **Optional feedback/support:** After use, share what worked or ask for help → message + privacy acknowledgement → review → compose email / copy / save text → visitor sends via their email provider. Business name, preferred reply email and name are optional; the sending email address is shared by the visitor’s email service.
- **Optional updates:** Community Intelligence registration remains separate in the app’s **Insights → Join free** flow. Feedback does not register anyone or subscribe them to updates.
- **No JavaScript / no mail app:** a direct contact address is provided; copy into webmail or use the text-file fallback.
- **Old links:** `checkout.html?plan=driver` opens feedback and support without restoring checkout or signup. `success.html?order=anything` cannot confirm a payment or registration. `download.html` ignores browser order records and does not grant paid access. `admin.html` is a non-functional retirement notice, with no order table or activation controls.

A prepared email is **not a received message**. There is no automated acknowledgement, mailing-list subscription, account creation or paid access issuance. The visitor must send the email. Test the receiving mailbox separately before campaigns; publishing a contact address does not establish mailbox deliverability.

## Source evidence

- Historical product-source evidence inspected on **15 October 2026**: Sites version **13**, commit `6d54e07c4183a9fc6ceb1252ac5b215e27bbd127`; `public/community/index.html`, `public/community/privacy.html`, `public/community/js/membership.js`, `app/api/community-members/route.ts`. That inspection was read-only. At that time, `De-Omega-Point/L-4-A-2Market` contained an older compulsory-registration implementation. These are historical findings, not a statement of today’s app release or repository parity; current app-source work is reviewed separately.
- Existing Sites identity: `appgprj_6a6b5fb6e2c0819187c6ae3e75606052`; public URL returned by Sites on 15 October 2026: https://loyalty-for-all-community.sammielee.chatgpt.site
- Contact published on the company website: https://de-omega-point.com/ → `hello@de-omega-point.com`.
- Product logo copied unchanged from the existing app’s `public/community/assets/loyalty-4-all-logo.png`. No substitute brand mark was generated.

The app source inspected on 15 October used a same-origin `/api/community-members` service and explicitly rejected cross-origin submissions. No cross-origin registration for this Pages site or payment verification service was found in that inspection. This storefront change introduces neither service. This website routes optional Community Intelligence registration to the app’s existing Insights flow and uses a transparent email hand-off for optional feedback and support. It never declares backend registration or payment success.

## Files

| Page | Purpose |
| --- | --- |
| `index.html` | Merchant product, benefits, local data, workflow, FAQ |
| `pricing.html` | Free Community Edition, local-data limits and separate optional updates; no paid offers |
| `checkout.html` | Optional feedback/support message, review and email/copy/text-file hand-off; legacy URL retained |
| `success.html` | Honest sent-mail guidance; never a receipt |
| `download.html` | Existing web app, conditional install guidance, native release status |
| `privacy.html` | Website/email/app data distinctions and legacy-prototype cleanup |
| `admin.html` | Retired prototype notice; no customer data or management actions |

## Validate

Node.js 22; no dependencies or build step:

```sh
npm run check
```

This checks local references and local-first safeguards, then runs the offline regression suite covering adoption CTAs/navigation, optional contact details, feedback validation, privacy acknowledgement, URL encoding, review/edit/clear, email status, interrupted/repeated clipboard actions, clipboard denial, blocked storage, text export, unsafe text and forged legacy access. Release-check tests simulate asset-only updates, mixed revisions, HTTP/network/body failures, delayed requests and deadline expiry without contacting the public site. Test data are synthetic. `scripts/check-app.mjs` checks the public app with GET requests and an invalid membership POST and a forbidden cross-origin POST; it creates no registration. It does not prove successful database insertion, email delivery or native installation.

Interactive browser and visual mobile QA remain unverified. The 17 October 2026 local attempt could not launch installed Chromium because the execution environment blocked its process/socket setup. Semantic HTML, labels, IDs, responsive CSS and code-level interactions were checked; actual device/browser rendering remains an acceptance check. The local release-hardening checks ran on Node.js 24.19.0; GitHub CI remains the Node.js 22 verification gate.

## Publish

The existing GitHub Pages pipeline builds `main` from the repository root. `.nojekyll` keeps files unchanged. Merging a checked PR publishes the site, so retain the founder-approval gate before merging. The `Storefront checks` workflow validates changes and, on `main`, waits for and compares every public page/asset to the exact source bytes. Its cache key includes the sorted paths and hashes of the complete release, not just `index.html`. All files must match in one polling pass; stale files, HTTP failures and interrupted requests are retried. Requests (including their response bodies) have a 15-second limit capped by a shared 10-minute deadline, leaving headroom in the 12-minute workflow job. Timeout errors identify the last mismatching or unavailable files. It does not configure Pages or change a custom domain.

Expected project URL: https://de-omega-point.github.io/L4A_Landing/

If checks cannot reach it or a deployment fails, inspect the Pages build; do not treat a merge as proof of a working public site. This storefront-repository change does not modify a Sites project or the existing app; separately reviewed app-source work is outside this report.

## Privacy and local-first boundaries

- No analytics, external SDKs, payment processors or background form requests.
- No form personal information stored in localStorage/sessionStorage or placed in this site’s URLs.
- User-triggered mailto, clipboard and file actions contain the reviewed message. Email delivery is controlled by the visitor and email providers.
- Browser form restoration may retain details. “Clear this message” resets form/review data; copies in email/clipboard/files remain the visitor’s responsibility.
- The feedback composer has no marketing opt-in or registration fields. Community Intelligence updates are a separate, optional app flow. Receiving feedback does not automatically enrol anyone in a service.
- CSP blocks background connections, external scripts and native form submission. Without JavaScript, form fields are disabled and a direct email fallback is visible.
- Only the two old prototype keys can be explicitly deleted; no `localStorage.clear()` or app customer-record access.
- The app has optional Community Intelligence registration and local customer storage; core loyalty use needs no account. Its on-device Product IDs are not proof of identity or paid entitlements. Backups remain essential.

## Gates before paid launch

1. **Founder approval:** confirm prices, currency, billing period, offer inclusions, refund/cancellation terms and tax treatment. No prices or live payment settings have been activated.
2. **Trusted backend:** create/capture orders server-side from an approved catalogue; verify PayPal status, merchant/payee, amount, currency and order identity; authenticate webhooks, handle retries idempotently, and reconcile cancellations/refunds. Store secrets in backend secret storage only.
3. **Identity and entitlements:** authenticate buyers, verify contact ownership, store entitlements durably, protect operator access and authorise every protected download server-side. A browser record or serial alone is never proof of access.
4. **Release:** publish signed/tested packages or verified store links; keep paid files private and use short-lived authorised links. An unsigned AAB build artifact is not a customer-installable APK.
5. **Validation:** sandbox purchase → entitlement → authorised download → expiry/cancellation/refund; reject forged/replayed events, mismatched amounts and unauthorised users. Obtain approval before any live payment activation.

Any future hosted feedback form would need server validation, rate limiting/abuse controls, retention/deletion handling and truthful delivery states. No such service is configured by this website. Connect an actual mailing service only after it is configured and tested.
