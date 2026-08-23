# Production readiness checklist

This checklist separates code validation from account and environment configuration. Complete it before accepting real M-Pesa payments or publishing customer-facing download links.

## GitHub and release controls

- [ ] `main` has branch protection or a ruleset requiring pull-request review and the CI quality check.
- [ ] The CI workflow passes on the release commit.
- [ ] The release branch contains no `.env` files, private keys, unreviewed binaries, or untrusted archives.
- [ ] The deployment commit, Vercel deployment, and release tag refer to the same source revision.

## Supabase

- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` point to the production project.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is configured only as a server-side Vercel environment variable and is not exposed to client code.
- [ ] Migrations `001` through `007` have been applied in order.
- [ ] The `products` and `downloads` storage buckets are private and contain the intended files.
- [ ] Row-level security policies are enabled and tested for profiles, orders, order items, downloads, reviews, wishlist, and newsletter subscribers.
- [ ] The initial admin account is promoted through the database and the email address is verified.

## Payments

- [ ] M-Pesa credentials are configured in the intended Vercel environment.
- [ ] `MPESA_CALLBACK_URL` is an HTTPS URL for `/api/mpesa/callback` and is reachable by Safaricom.
- [ ] Sandbox mode has completed one full STK Push -> callback -> paid order -> download flow.
- [ ] A duplicate callback test confirms that the order is not double-counted and that only one download token is issued.
- [ ] Production credentials are added only after sandbox verification.
- [ ] Payment amount is always derived from the server catalog, not from client-supplied prices.

## Downloads and operations

- [ ] Download links expire as intended and enforce the maximum download count.
- [ ] Concurrent download requests cannot exceed the configured limit.
- [ ] A missing file fails safely without disclosing storage internals.
- [ ] Download logs are retained and accessible only to admins.
- [ ] Application-level error monitoring is configured because short-lived platform logs are not a substitute for incident history.

## Vercel

- [ ] Vercel Authentication remains enabled for deployment and preview URLs.
- [ ] Production custom-domain visibility is intentional.
- [ ] Trusted IPs are considered only if a supported plan and a real VPN or proxy-only access requirement exist.
- [ ] Any automation calling protected deployments uses a narrowly scoped Trusted Source or an explicitly managed bypass secret.

## Smoke test

Run the following after each payment, auth, or download change:

1. Browse the public homepage and marketplace.
2. Register or sign in as a customer.
3. Create an order and verify the server-calculated total.
4. Complete a sandbox M-Pesa payment.
5. Confirm the callback marks the order paid exactly once.
6. Open the download link, verify the signed URL, and exhaust the download limit.
7. Sign in as an admin and verify that customer and order data are visible only in the admin area.
8. Verify that unauthenticated users cannot access dashboard or admin pages and APIs.
