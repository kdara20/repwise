# Repwise — Implementation Plan

Curated marketplace for Canadian personal trainers (CAD only, English only). Clients discover trainers, subscribe monthly per trainer, watch program lessons, chat with trainers, and book paid 1:1 video sessions. Trainers get a studio dashboard for clients, programs, and earnings. Platform takes a % fee.

**Approach: build in thin phases. Phase 1 is deliberately small — it only proves auth, roles, and trainer discovery. No payments, video, or chat until later phases.**

## Stack

| Concern | Choice | Phase |
|---|---|---|
| Framework | Next.js 16.4 App Router, React 19.3, TypeScript (`cacheComponents` + `partialPrefetching` on) | 1 |
| UI | Tailwind v4 + shadcn/ui, light/dark (`next-themes`), mobile-first | 1 |
| Database | Neon Postgres (serverless driver), Drizzle ORM + drizzle-kit migrations *(ASSUMPTION: ORM choice)* | 1 |
| Auth | Neon Auth (`@neon/auth` 0.8.x, managed Better Auth — currently beta; pin the version) — email/password + Google | 1 |
| Errors/monitoring | Sentry free Developer plan (`@sentry/nextjs`). Seer AI debugging enabled later on a paid plan | 1 |
| Hosting | Vercel Hobby during development → Pro when Stripe goes live. Vercel Analytics for page views + Web Vitals | 1 |
| Payments | Stripe Connect Express (CAD): trainer subscriptions + per-session payments, platform fee (placeholder 15%, one config value) | 2 |
| Background jobs | Inngest: webhook processing/retries, reminders, slot-hold expiry, deletion cleanup | 2 |
| Lesson video hosting | Mux (direct uploads, signed playback) | 3 |
| File storage | Vercel Blob (avatars, covers, PDF attachments) | 3 |
| Chat | Stream Chat (getstream.io): 1:1, reactions, replies, threads | 4 |
| 1:1 calls | Stream Video, in-app | 5 |
| Email | Resend + React Email (confirmations, reminders, receipts) | 5 |
| Real-time | Provided by Stream (chat, presence, calls). Neon is not a real-time service. | 4–5 |

## Architecture rules (all phases)
- **Server-first.** Server Components fetch; mutations are Server Actions validated with Zod and return `{ ok, error, fieldErrors }` for `useActionState`.
- **Authorization lives in a server-only Data Access Layer** (`lib/dal/*`, `import 'server-only'`): `getSession()`, `requireUser()`, `requireTrainer()`, `requireAdmin()`, memoized with React `cache()`. Every action and data read goes through it.
- **`proxy.ts`** (Next 16's renamed middleware) only does optimistic redirects for signed-out users on `/dashboard`, `/studio`, `/admin`. Never the only check (per Next docs).
- **Caching:** public directory/profile reads use `'use cache'` + `cacheLife` + `cacheTag('trainer:<id>')`; profile edits call `revalidateTag`. Session-dependent UI is rendered inside `<Suspense>`.
- **Secrets** validated at boot in `lib/env.ts`; only `NEXT_PUBLIC_*` values reach the browser.
- **Environments via Neon branches** (declared in `neon.ts`): `production` = default branch, `dev` = long-lived local development branch (no TTL), other new branches (previews/features) expire after 7 days. Each branch has its own Postgres and its own Neon Auth instance. All on the free tier.
- **Migration workflow:** `.env.local` must point at `dev` (`neon checkout dev`). Change `lib/db/schema.ts` → `npm run db:generate` → `npm run db:migrate` (runs on dev) → test → commit the SQL. Production is migrated only on purpose with `ALLOW_PRODUCTION_MIGRATION=1`; `drizzle.config.ts` refuses otherwise.

---

## Phase 1 — Auth, roles, trainer profiles, discovery

### Goal
A visitor can browse approved trainers. A user can sign up, apply to become a trainer, get approved by an admin, edit their public trainer profile, and appear in the directory.

### In scope
1. **Foundation**
   - Commit the habit-tracker removal; rebrand `app/layout.tsx` metadata to Repwise.
   - Install shadcn/ui, theme provider + toggle, responsive app shell (header nav, mobile menu, footer).
   - `lib/env.ts`, Drizzle + Neon client (`lib/db/`), first migration.
   - Sentry (`instrumentation.ts`, client config, global error boundary). Source maps uploaded on Vercel builds.
   - GitHub Actions: lint, typecheck, unit tests.
2. **Auth (Neon Auth)**
   - Sign up, sign in, sign out, email verification, password reset, Google OAuth.
   - `/api/auth/[...path]` handler as required by the Neon Auth SDK; session read in the DAL.
   - On first sign-in, create a `profiles` row (display name, timezone from browser).
3. **Roles**
   - Everyone is a client by default.
   - Trainer = has a `trainers` row with `status = 'approved'`.
   - Admin = `profiles.is_admin` set manually in the database.
4. **Become a trainer**
   - `/apply`: headline, bio, specialties, certifications → `trainer_applications` (one pending per user).
   - `/admin/applications`: list pending, approve or reject (with reason). Approve creates the `trainers` row with a generated unique slug.
   - Applicant sees status on `/dashboard`.
5. **Trainer profile editor** — `/studio/profile`
   - Display name, slug, headline, bio, specialties (fixed list), years of experience, location (city/province), "accepting clients" toggle, publish/unpublish.
   - Avatar: Google profile image if present, otherwise initials. *(No file uploads in Phase 1 — Neon has no file storage; a storage provider is chosen in a later phase.)*
6. **Discovery (public, SEO)**
   - `/trainers`: search (name/headline/bio via Postgres full-text) + specialty and province filters, held in URL `searchParams`; paginated; empty state.
   - `/trainers/[slug]`: public profile. Subscribe/Book/Message buttons shown as "Coming soon" placeholders.
   - `generateMetadata` + Open Graph per profile, `sitemap.ts`, `robots.ts`; `noindex` on `/dashboard`, `/studio`, `/admin`.
7. **Basic pages**: home (hero + featured trainers + CTA), `/dashboard` (client home: "Find a trainer", application status), `not-found`, `error`, loading skeletons.

### Explicitly out of Phase 1
Stripe, subscriptions, programs/lessons, video hosting, file uploads, Stream chat/video, booking, earnings, emails beyond auth emails, background jobs.

### Phase 1 data model (Drizzle)
| Table | Columns |
|---|---|
| `profiles` | `user_id` PK (Neon Auth user id), `display_name`, `image_url`, `timezone` (default `America/Toronto`), `is_admin` bool default false, `created_at`, `deleted_at` |
| `trainer_applications` | `id`, `user_id` FK, `headline`, `bio`, `specialties text[]`, `certifications`, `status` enum(pending, approved, rejected), `rejection_reason`, `reviewed_by`, `reviewed_at`, `created_at`. Partial unique index: one `pending` per user |
| `trainers` | `id`, `user_id` unique FK, `slug` unique, `display_name`, `headline`, `bio`, `specialties text[]`, `years_experience`, `city`, `province`, `accepting_clients` bool, `status` enum(approved, deactivated), `published` bool, `search` tsvector (generated, GIN index), `created_at`, `updated_at` |

Validation: slug `^[a-z0-9-]{3,40}$` and not reserved; bio ≤ 2,000 chars; 1–5 specialties from a fixed list; province from the 13 Canadian codes.

### Routes added in Phase 1
`/`, `/auth/[path]` (sign-in, sign-up, forgot-password, … via Better Auth UI), `/settings/[path]`, `/trainers`, `/trainers/[slug]`, `/dashboard`, `/apply`, `/studio/profile`, `/admin/applications`, `/api/auth/[...path]`, `sitemap.xml`, `robots.txt`.

### Testing
- **Unit (Vitest):** Zod schemas, slug generation/uniqueness, directory search-param parsing.
- **E2E (Playwright, `e2e/`):** sign up → apply (validation keeps input) → non-admin sees "Access denied" → admin approves → new trainer hidden → trainer edits and publishes → searchable with correct metadata → specialty filter → unpublish hides it; signed-out redirects; unknown slug is not-found + `noindex`. Role guards (`requireTrainer`/`requireAdmin`) are covered here rather than with mocked unit tests.
- **Running E2E:** local only, against the `dev` branch (refuses `production`): `npm run build && npm run test:e2e`. Teardown deletes every `e2e+…@example.com` user (needs the `neon` CLI logged in). Not in CI yet: it needs a Neon Auth instance per run.
- **Status codes:** `forbidden()`/`notFound()` inside `<Suspense>` stream under a 200 (Partial Prerendering); Next adds `noindex`. Listed trainer pages are prerendered via `generateStaticParams`.

### Making an admin
Sign up, open `/dashboard` once (creates the profile), then on the target branch:
`update profiles set is_admin = true where user_id = '<neon auth user id>';`

### Done when
- [x] Deployed to a Vercel preview (shares the `dev` Neon branch; per-preview branches need the Neon ↔ Vercel integration).
- [ ] All E2E flows pass in CI — they pass locally (17/17); CI runs lint, typecheck, unit tests, migrations, and build against a Postgres service.
- [x] A thrown test error shows up in Sentry with a readable stack trace.
- [x] Directory and profile pages work on mobile and in both themes, and return correct metadata.

### You need to set up (I can't create accounts)
- Neon project with Neon Auth enabled; Google OAuth client ID/secret.
- Sentry project (free Developer plan).
- Vercel project linked to the GitHub repo, with the Neon integration.

---

## Later phases (outline — detailed when we reach them)

**Phase 2 — Stripe Connect + trainer subscriptions.** Trainer Express onboarding (CA, CAD), monthly price, Checkout with destination charges + platform fee %, webhooks (verified, logged, idempotent), access until period end on cancel, 7-day grace on failed payment, Customer Portal, `/studio/clients` subscriber list. Introduces Inngest; webhook route verifies the signature, records the event in `stripe_events`, and hands processing to an Inngest function.

**Phase 3 — Programs + video lessons.** Program → module → lesson builder, free previews, lesson progress, subscriber-only playback. Mux direct uploads + signed playback tokens issued server-side only to active subscribers (or anyone for free-preview lessons). Vercel Blob for avatars, program covers, and PDF attachments.

**Phase 4 — Stream Chat.** Server-side Stream user upsert + token endpoint; 1:1 channel per trainer–subscriber pair; reactions, replies, threads; write access only while subscribed (channel permissions updated from Stripe webhooks); unread badges.

**Phase 5 — Booking + Stream Video calls.** Weekly availability + blocked dates, timezone/DST-safe slot generation, subscriber-only paid booking with slot holds and a DB exclusion constraint against double booking, 24h cancellation/refund rule, a Stream Video call created per booking and joinable only by the two participants near the session time, confirmation and reminder emails via Resend, scheduled with Inngest. Per-trainer session length and price; 15-minute slot hold during checkout; trainer cancellation always refunds in full.

**Phase 6 — Earnings dashboard.** Gross/fee/net, MRR, payouts link to Stripe Express dashboard.

**Phase 7 — Hardening + launch.** Account deletion (soft delete, keep financial records), legal pages + 18+ + fitness disclaimer, security review, full E2E, Vercel Pro, Stripe live mode, Sentry paid plan + Seer.

## Open risks
- Neon Auth SDK is beta — pin versions, keep auth calls behind `lib/auth/` so it can be swapped for self-hosted Better Auth if needed.
- Stream free-tier limits (Build/Maker plan) — confirm current MAU/video limits and Maker eligibility before Phase 4.
- Vercel Blob URLs are public — paid PDFs are protected only by unguessable URLs shown to subscribers. Move to Cloudflare R2 signed URLs if leakage matters.
- Mux cost scales with minutes watched; no budget ceiling set yet.
- GST/HST registration past the $30k threshold; Quebec French-language requirements; fitness-advice liability (disclaimer + terms).
- Overall scope remains large; each later phase is independently shippable.
