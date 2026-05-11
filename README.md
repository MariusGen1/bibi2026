# Bibi

Item-level customer feedback for small restaurants, with an AI weekly summary for owners.

- Customers scan a **QR on their receipt** → tap what they ordered → rate each dish → leave a phone for a one-time discount code.
- Owners open a **dashboard** that surfaces per-item analytics and a **weekly summary written by Claude** that calls out the three things to fix this week, the two things working, and the one trend nobody noticed.

Demo restaurant is **Luigi's Trattoria**, seeded with ~120 realistic submissions over 60 days with planted signal (a carbonara that's gotten salty, fries coming out cold on weekends, a tiramisu that's a hidden gem, etc.) so the AI summary has something real to chew on.

## Stack

- Next.js 16 (App Router) on Vercel
- Tailwind v4
- Supabase (Postgres) for storage
- Twilio for SMS (optional — falls back to on-screen preview)
- Anthropic Claude (Opus 4.7) for the weekly summary

## Quick start

```bash
# 1. Install
npm install

# 2. Create a Supabase project at https://supabase.com
#    Open SQL editor → paste db/schema.sql → run.

# 3. Copy .env.example to .env.local and fill in:
cp .env.example .env.local
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
#    - ANTHROPIC_API_KEY
#    - (optional) TWILIO_ACCOUNT_SID / AUTH_TOKEN / FROM_NUMBER

# 4. Seed Luigi's Trattoria with menu + ~120 realistic submissions
npm run seed

# 5. Run dev
npm run dev
```

Open <http://localhost:3000>.

- **/** — landing
- **/r/luigis** — customer feedback flow (try it on your phone)
- **/owner** — owner login (passcode: `luigi`, configurable via `OWNER_DEMO_PASSWORD`)
- **/owner/dashboard** — AI summary + item-level analytics + recent feedback

## Twilio (real SMS)

Optional. Without `TWILIO_*` env vars, Bibi logs the message to the server console and shows it on-screen as a "Demo · simulated SMS" preview. Useful for local dev.

When you turn Twilio on:

1. Buy a number in your Twilio console.
2. **Trial accounts can only text verified numbers** — go to *Phone Numbers → Manage → Verified Caller IDs* and add the phone you'll demo with.
3. Paste `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` (in E.164 format, e.g. `+18885551212`) into your env.

## Deploy to Vercel

```bash
vercel
```

Add the same env vars in the Vercel project settings. `npm run build` already passes; deploys should be one-shot.

## Demo script (90 seconds)

1. **Open `/`** — set the pitch. "Yelp tells you your stars. Bibi tells you what to do about them."
2. **Open `/r/luigis` on a phone** (or QR-code-from-screen). Walk through: pick three dishes → rate them → overall → phone. Hit submit. SMS lands on demo phone (or shows the simulated preview).
3. **Switch to `/owner/dashboard`** (laptop). Hit **Write this week's summary**. Wait ~5 seconds.
4. Read the summary aloud. Pause on the most specific bullet ("carbonara has dropped to ★3.0 in the last 14 days, mentioned salty 6 times"). That's the whole pitch in one sentence.
5. Scroll past the item table and recent feedback. Note the per-item trend column — that's the data nobody else collects.

## Layout

```
app/
  page.tsx                 marketing landing
  r/[slug]/                customer feedback flow (mobile-first)
    page.tsx
    flow.tsx               multi-step UX
    actions.ts             submitFeedback server action
  owner/
    page.tsx               passcode login
    actions.ts             login / logout
    dashboard/
      page.tsx             SSR dashboard
      summary-card.tsx     AI summary (client; calls /api/summary)
      items-table.tsx
      recent-feed.tsx
  api/summary/route.ts     Claude call for weekly summary

lib/
  supabase.ts              admin + public clients
  queries.ts               typed reads + analytics rollups
  claude.ts                Anthropic SDK + summary prompt
  sms.ts                   Twilio + mock fallback
  owner-auth.ts            cookie-based demo session
  types.ts
  utils.ts                 cn, formatPhone, generateDiscountCode

components/
  icons.tsx                custom SVG icons (not Lucide)
  stars.tsx                StarRow + StaticStars

db/schema.sql              run in Supabase SQL editor
scripts/seed.ts            populates Luigi's with realistic feedback
```

## What was intentionally cut

This is a hackathon build. Things we deliberately did **not** ship:

- **No multi-tenant signup.** One seeded restaurant, hardcoded passcode. Add real auth before a second customer.
- **No public review feed.** Reviews are private intelligence for the owner — Bibi is not trying to be Yelp. That's the wedge.
- **No POS / online-order integration.** A printed QR on the receipt is enough. POS integration is a multi-month sales cycle, not a weekend build.
- **No RLS.** All DB access goes through the service-role key from server-side code. Add row-level security before exposing to real users.

## License

Built for a hackathon. Do whatever.
