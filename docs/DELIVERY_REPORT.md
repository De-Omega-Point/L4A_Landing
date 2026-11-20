# Loyalty-4-All landing copy and read-only CI correction

Updated: 20 November 2026 (UTC)
Repository: https://github.com/De-Omega-Point/L4A_Landing
Base: `14c7f70bb2c0b16d6e0800817526e21bd98364f6` (current main checked before work)
Scope: separate draft PR candidate; no merge, publication or Sites app changes

## Change

Replace the outdated required-registration journey with **Get Loyalty-4-All** → `https://de-omega-point.com/apps/` → the public Community Edition app. No account, password or payment is needed; browser installation is optional. The installation guide retains its two direct `/community/?install=1` links and returning-user `/community/` link. App legal links use canonical `/community/privacy` and `/community/terms`.

Remove registration and Product ID requirements from current instructions; label older registration references historical. Keep original browser/profile and local backup guidance, and warn that a new installation can have separate storage. Do not promise offline operation, record recovery, automatic synchronisation, paid features or a connected Portal account flow.

Replace the existing-app CI contract with eight anonymous GETs checking app HTML, manifest, service worker, module, legal notices, CSS and logo. Canonical resources must return HTTP 200 directly with expected media types/content; the manifest must retain `/community/` scope/start URL. No registration API calls, POSTs, cookie or registration persistence expectations remain. This is a public availability probe, not a browser/offline test.

## Preserved safeguards

- All seven page filenames, navigation, official logo and layout remain.
- Legacy checkout is optional feedback/support. Message and privacy acknowledgement remain required; contact details remain optional. Visitors review and send through their email service.
- Email/clipboard/text-file validation, cancellation/race handling, clear behavior, CSP, no background requests and no personal-data persistence remain unchanged.
- Legacy status cannot confirm receipt, registration, payment or access. No payment or registration functionality is added.
- Full-release public-byte comparison, revision hashing, request/body timeout and overall deadline remain unchanged. Its production comparison still runs only on main after a separately approved merge; this draft does not publish.

## Validation

- `npm run check`: 51 tests passed; seven pages and local references checked.
- JavaScript syntax and `git diff --check`: passed locally (Node.js 24.22.1).
- Live probe: passed eight anonymous GET checks using `NODE_USE_ENV_PROXY=1 node scripts/check-app.mjs`. Direct Node networking was refused by the environment; using its configured proxy succeeded without changing probe semantics.
- Live public worker still identifies cache `v84`; canonical legal routes return HTTP 200. No v86 cutover or live asset changes.
- Read-only comparison of all 14 currently published pages/assets against the untouched base commit passed (release hash `3ce8cda3660b20ce0e443ba84d6236177ce40324682013941a1165c496253daa`). The candidate itself is not published.
- Feedback and published-byte regression tests and implementation are unchanged. New fixtures reject gated/missing resources, misleading HTML, redirects, altered manifest scope/start URL and network/body failures.
- GitHub Actions results belong to the final PR commit and must be checked there; local results are not CI results.

Not verified here: actual browser/PWA install, physical devices, offline reopening, workspace retention or mailbox delivery. In particular, HTTP availability does not fix or prove resolution of the separately identified v84 offline-readiness defect. Public byte parity of this new candidate is intentionally pending publication; existing parity implementation/tests remain intact.
