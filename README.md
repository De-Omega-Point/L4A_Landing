# Loyalty-4-All merchant website

A mobile-friendly product website for **Loyalty-4-All Community Edition**, reusing the seven-page static implementation from PR #1. It explains the merchant loyalty product and offers an optional email-based pilot request. Online payments and paid entitlements are unavailable.

## Customer journeys

- **Explore:** Product → Community & pilot → Get the app → existing Community Edition (no compulsory account). Optional Community Intelligence registration is available inside the app’s **Insights → Join free** flow.
- **Optional pilot:** Register interest → valid details + privacy acknowledgement → review → compose email / copy / save text → visitor sends via their email provider.
- **No JavaScript / no mail app:** a direct contact address is provided; copy into webmail or use the text-file fallback.
- **Old links:** `checkout.html?plan=driver` opens the pilot form. `success.html?order=anything` cannot confirm a payment or registration. `download.html` ignores browser order records and does not grant paid access. `admin.html` is a non-functional retirement notice, with no order table or activation controls.

A prepared email is **not a received lead**. There is no automated acknowledgement, mailing-list subscription, account creation or paid access issuance. The visitor must send the email. Test the receiving mailbox separately before campaigns; publishing a contact address does not establish mailbox deliverability.

## Source evidence

- Current published product source: Sites version **13**, commit `6d54e07c4183a9fc6ceb1252ac5b215e27bbd127`; `public/community/index.html`, `public/community/privacy.html`, `public/community/js/membership.js`, `app/api/community-members/route.ts`. Inspected read-only; no app changes were made. The native repository `De-Omega-Point/L-4-A-2Market` contains an older compulsory-registration implementation and is not the current web app’s authority.
- Existing Sites identity: `appgprj_6a6b5fb6e2c0819187c6ae3e75606052`; public URL returned by Sites on 15 October 2026: https://loyalty-for-all-community.sammielee.chatgpt.site
- Contact published on the company website: https://de-omega-point.com/ → `hello@de-omega-point.com`.
- Product logo copied unchanged from the existing app’s `public/community/assets/loyalty-4-all-logo.png`. No substitute brand mark was generated.

The live app uses a same-origin `/api/community-members` service and explicitly rejects cross-origin submissions. It does not provide cross-origin registration for this Pages site, and no payment verification service was found in the inspected repositories. This website routes optional Community Intelligence registration to the app’s existing Insights flow and uses a transparent email hand-off for separate pilot conversations. It never declares backend registration or payment success.

## Files

| Page | Purpose |
| --- | --- |
| `index.html` | Merchant product, benefits, local data, workflow, FAQ |
| `pricing.html` | Existing free Community Edition and optional pilot; no paid offers |
| `checkout.html` | Optional pilot request, review and email/copy/text-file hand-off |
| `success.html` | Honest sent-mail guidance; never a receipt |
| `download.html` | Existing web app, conditional install guidance, native release status |
| `privacy.html` | Website/email/app data distinctions and legacy-prototype cleanup |
| `admin.html` | Retired prototype notice; no customer data or management actions |

## Validate

Node.js 22; no dependencies or build step:

```sh
npm run check
```

This checks local references and pilot safeguards, then runs nine tests covering validation, consent, URL encoding, review/edit/clear, email status, clipboard denial, text export, unsafe text and forged legacy access. Test data are synthetic. `scripts/check-app.mjs` checks the public app with GET requests and an invalid membership POST and a forbidden cross-origin POST; it creates no registration. It does not prove successful database insertion, email delivery or native installation.

No browser automation or visual mobile QA was available in the implementation environment. Semantic HTML, labels, IDs, responsive CSS and code-level interactions were checked; actual device/browser rendering remains an acceptance check.

## Publish

The existing GitHub Pages pipeline builds `main` from the repository root. `.nojekyll` keeps files unchanged. Merge the checked PR to publish. The `Storefront checks` workflow validates changes and, on `main`, waits for and compares every public page/asset to the exact source bytes. It does not configure Pages or change a custom domain.

Expected project URL: https://de-omega-point.github.io/L4A_Landing/

If checks cannot reach it or a deployment fails, inspect the Pages build; do not treat a merge as proof of a working public site. No Sites project or existing app was modified by this change.

## Privacy and local-first boundaries

- No analytics, external SDKs, payment processors or background form requests.
- No form personal information stored in localStorage/sessionStorage or placed in this site’s URLs.
- User-triggered mailto, clipboard and file actions contain the reviewed request. Email delivery is controlled by the visitor and email providers.
- Browser form restoration may retain details. “Clear this request” resets form/review data; copies in email/clipboard/files remain the visitor’s responsibility.
- Optional updates are unchecked and independent of requesting the pilot. Receiving a request does not automatically enrol it in a service.
- CSP blocks background connections, external scripts and native form submission. Without JavaScript, form fields are disabled and a direct email fallback is visible.
- Only the two old prototype keys can be explicitly deleted; no `localStorage.clear()` or app customer-record access.
- The app has optional Community Intelligence registration and local customer storage; core loyalty use needs no account. Its on-device Product IDs are not proof of identity or paid entitlements. Backups remain essential.

## Gates before paid launch

1. **Founder approval:** confirm prices, currency, billing period, offer inclusions, refund/cancellation terms and tax treatment. No prices or live payment settings have been activated.
2. **Trusted backend:** create/capture orders server-side from an approved catalogue; verify PayPal status, merchant/payee, amount, currency and order identity; authenticate webhooks, handle retries idempotently, and reconcile cancellations/refunds. Store secrets in backend secret storage only.
3. **Identity and entitlements:** authenticate buyers, verify contact ownership, store entitlements durably, protect operator access and authorise every protected download server-side. A browser record or serial alone is never proof of access.
4. **Release:** publish signed/tested packages or verified store links; keep paid files private and use short-lived authorised links. An unsigned AAB build artifact is not a customer-installable APK.
5. **Validation:** sandbox purchase → entitlement → authorised download → expiry/cancellation/refund; reject forged/replayed events, mismatched amounts and unauthorised users. Obtain approval before any live payment activation.

A future hosted pilot form should add a narrowly scoped registration API with server validation, rate limiting/abuse controls, explicit consent records, retention/deletion handling and truthful delivery states. Connect an actual mailing service only after it is configured and tested.
