<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Bibi — agent notes

Stack: Next.js 16 (App Router, Turbopack) · Tailwind v4 · Supabase · Twilio · Anthropic SDK.

## Conventions

- **Server-only writes.** All Supabase writes go through `supabaseAdmin()` from server actions or route handlers. The anon client exists but is unused in this build.
- **No RLS.** Intentionally off; do not add it without rethinking auth.
- **Hardcoded owner.** Single demo restaurant (`slug = 'luigis'`), single passcode session cookie. Don't bolt on user/multi-tenant logic without changing the scope.
- **Mock SMS by default.** `lib/sms.ts` falls back to logging + on-screen preview if Twilio env vars are missing. Keep that fallback working so dev never blocks.
- **AI summary is on-demand, not cached.** The dashboard fetches a fresh one when the user clicks "Write this week's summary". Cheap enough for a hackathon; cache in a table before scaling.

## Design system

- Palette and type are defined in `app/globals.css` via `@theme inline`. Custom colors: `paper`, `paper-deep`, `mist`, `ink`, `stone`, `stone-soft`, `tomato`, `tomato-deep`, `olive`, `olive-soft`, `saffron`.
- Fonts (loaded via `next/font` in `app/layout.tsx`): **Fraunces** (variable serif, `.display` / `.display-italic`) + **Instrument Sans** (body) + **JetBrains Mono** (rarely used).
- Editorial primitives: `.eyebrow` (mini-caps section label), `.rule` (1px hairline), `.numeral` (italic numerals in tomato), `.tnum` (tabular numerals), `.rise` (staggered fade-up on mount), `.pop` (star fill bounce).
- Use hairline rules (`<div className="rule" />`) instead of card shadows. Reserve `bg-tomato` for filled stars, the primary CTA, and the AI summary's "Fix" header.

## Don't

- Don't replace the custom SVG icons in `components/icons.tsx` with Lucide. The hand-tuned strokes are part of the aesthetic.
- Don't add gradients, glassmorphism, or rounded-2xl card shadows. The whole product reads as "printed trattoria menu."
- Don't introduce a public review feed or social/marketplace features. The product is intentionally private intelligence for the owner.
