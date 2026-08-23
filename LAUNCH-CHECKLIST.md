# 🚀 JM Majiwa — Launch Checklist

The code is validated by the repository CI workflow. This checklist takes you
from "repo" to "live store" in ~30 minutes, then to "real M-Pesa revenue" when
your Safaricom production credentials arrive. Account and environment
configuration still requires explicit verification.

---

## Phase 1 — Put the code on `main` (2 min)

1. Open the current production-readiness pull request on GitHub.
2. Confirm the CI quality gate passes.
3. Review the changed files and merge only after the required review.

*(Database migrations and environment configuration below still require explicit verification.)*

## Phase 2 — Database (10 min, free tier)

1. Go to [supabase.com](https://supabase.com) → **New project**.
   - Region: pick the closest to Kenya (e.g. `eu-west-1`).
   - Set a strong database password (save it).
2. Open **SQL Editor** and run these files **in order** (copy-paste each):
   1. `supabase/migrations/001_schema.sql`
   2. `supabase/migrations/002_backend_extensions.sql`
   3. `supabase/migrations/003_downloads_bucket.sql`
   4. `supabase/migrations/004_avatar_uploads.sql`
   5. `supabase/migrations/005_blog_authors.sql`
   6. `supabase/migrations/006_seed_articles.sql`
   7. `supabase/migrations/007_atomic_download_claim.sql`
   8. `supabase/seed.sql` *(demo catalog — replace later via the admin panel)*
3. Grab your keys: **Project Settings → API**
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` (secret!) → `SUPABASE_SERVICE_ROLE_KEY`
4. Storage buckets (`products`, `media`, `downloads`) were created by the
   migrations automatically. ✔

## Phase 3 — Deploy (10 min, free tier)

**Option A — Vercel dashboard (easiest):**

1. [vercel.com](https://vercel.com) → **Add New → Project** → import this repo.
2. Framework preset: **Next.js** (auto-detected).
3. Add environment variables (Settings → Environment Variables, or paste at
   import time):

```
NEXT_PUBLIC_SUPABASE_URL=<your project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_APP_URL=https://<your-vercel-app>.vercel.app
NEXT_PUBLIC_APP_NAME=JM Majiwa
NEXT_PUBLIC_APP_DESCRIPTION=Learn Faster. Create Smarter. Grow with AI.
MPESA_ENVIRONMENT=sandbox
```

> Leave `MPESA_*` and `RESEND_API_KEY` **unset** for now. Payments will show
> the "Order via WhatsApp" fallback and emails will skip gracefully.

4. Keep `ALLOW_DEMO_ADMIN=false` in Vercel.
5. **Deploy**. Wait ~2 minutes.

**Option B — Vercel CLI from your machine:**

```bash
npx vercel login
npx vercel link        # choose the repo
npx vercel env add NEXT_PUBLIC_SUPABASE_URL   # …repeat for each var
npx vercel --prod
```

## Phase 4 — Become admin & verify (5 min)

1. On your live site: **Register** with `streetpandacyber@gmail.com` and
   confirm the email (Supabase Auth).
2. In Supabase **Table Editor → profiles**, set your row:
   `is_admin = true`.
3. Open `/admin` on the live site — you should see the dashboard with data.
4. Smoke-test as a customer:
   - Browse `/marketplace`, add to cart, checkout → you'll see the
     *"M-Pesa is being activated — Order via WhatsApp"* fallback. ✔
   - The order appears in **Supabase → orders** and in `/admin/orders`. ✔
   - `/downloads/<token>` link from the order works. ✔
   - `ALLOW_DEMO_ADMIN` is not enabled in production. ✔

## Phase 5 — Email (optional at launch, 5 min)

1. [resend.com](https://resend.com) → create API key → set `RESEND_API_KEY`.
2. For branded sending (`JM Majiwa <noreply@jmmajiwa.com>`), verify your
   domain in Resend (add the DNS records it shows) and set:

```
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@jmmajiwa.com
FROM_NAME=JM Majiwa
```

> Until a domain is verified, leave `RESEND_API_KEY` unset — the store works
> fine and emails simply aren't sent.

## Phase 6 — Real M-Pesa revenue (when Safaricom approves)

1. Create an app at [developer.safaricom.co.ke](https://developer.safaricom.co.ke).
2. **Test in sandbox first** with the Lipa na M-Pesa test credentials
   (shortcode `174379`):

```
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://<your-domain>/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

3. Complete one end-to-end test payment (STK prompt → PIN → success page →
   download link → order marked `paid` in `/admin`).
4. Switch to **production** credentials + `MPESA_ENVIRONMENT=production`.
5. Confirm duplicate callbacks do not issue a second token or increment sales twice.
6. Update marketing to advertise instant M-Pesa.

## Phase 7 — Grow (anytime later)

- Custom domain: Vercel → Domains → add `jmmajiwa.com`, update
  `NEXT_PUBLIC_APP_URL`.
- Replace seed catalog with real products via **/admin/products** (upload
  files — they go to the private `downloads` bucket automatically).
- Publish articles via **/admin/blog**.
- Coupons for launch promos via **/admin/coupons** (`WELCOME20` already seeded).

---

**Support contacts baked into the site:**
📧 streetpandacyber@gmail.com · 💬 +254 745 198 099 · 📞 0745 198 099 · 👍 @JM Majiwa
