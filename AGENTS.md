
# Courtify Vendor Panel

Court-owner dashboard. Feature priorities trace to
`docs/Courtify_Court_Owner_Dashboard_Competitive_Analysis.pdf` — it defines Tier 1
(table stakes), Tier 2 (differentiators) and Tier 3 (post-PMF). Read it before
arguing about what to build next.

## Backend

Separate Spring Boot repo at `../Courtify-Backend` (Postgres on Supabase, Redis
for caching). This repo is frontend only.

`src/lib/api-client.ts` resolves its base URL from `siteConfig.apiBaseUrl`
(`src/config/site.ts`): `NEXT_PUBLIC_API_BASE_URL` when set, else
`http://localhost:4000/api`. Endpoints live under `/api`.

- Use `||` not `??` for that fallback — the env var is often set to an empty
  string when a tunnel is down, and `??` would let `""` win.
- `NEXT_PUBLIC_*` is inlined at build time. Changing any `.env` file requires a
  dev server restart, not just a page reload.
- `.env.local` overrides `.env`. Check both before concluding a value isn't applied.

## Known backend behaviours that affect this code

- **Auth failures return `403`, not `401`.** `api-client.ts` only clears the
  session on `401`, so an invalid token leaves the user stuck on a broken page
  with no redirect to login. Unresolved — decide whether the frontend handles
  `403` or the backend starts returning `401`.
- `/common/sport-types` returns **500 when Redis is down**. Sport chips in
  `CourtForm` go empty. Cities and amenities are unaffected.
- Error responses often have an **empty body**, so `data?.message` is undefined.
  `describeHttpError()` in `api-client.ts` supplies a status-aware fallback —
  keep it in sync if new status codes start appearing.
- Vendor signup sets neither `is_verified` nor `is_approved`; both gate login.
  OTP rows land in the `otps` table in plain text before the email send is
  attempted, so they exist even when SMTP is unconfigured.

## Endpoints the UI calls that DO NOT EXIST yet

These are wired for real so failures surface honestly rather than faking success.
Do not stub them out with mock data.

| Endpoint | Feature |
| --- | --- |
| `POST /vendor-booking` | Manual/walk-in booking entry |
| `PATCH /court-owner/profile` | Settings → business profile |
| `POST /auth/change-password` | Settings → password |
| `PUT /court-owner/notification-preferences` | Settings → notifications |

## Derived data

The backend exposes only `/dashboard/analytics` (headline totals + revenue
series). These modules derive the rest client-side and should move server-side
when endpoints exist — their return shapes already match `@/types/models`:

- `src/lib/analytics-derive.ts` — booking breakdown, court utilization
  (minutes sold ÷ minutes open), revenue by venue, period/trend maths
- `src/lib/customers.ts` — there is **no customer entity**; customers are
  reconstructed from bookings, grouped by contact → email → id
- `src/lib/pricing.ts` — resolves a court's rate from its own pricing config
  (all three models plus the peak window, which may wrap midnight)

## Conventions

- **Never display fabricated data.** Placeholder trends, invented counts and
  dummy bank accounts have all been removed from this codebase; don't reintroduce
  them. If a value can't be computed honestly, omit it or show an empty state.
- Prefer omitting a row over guessing. Court utilization skips courts whose venue
  hours can't be parsed rather than assuming a capacity.
- Pages are client components (`'use client'`) that fetch through `src/lib/api/*`.
- Routing is gated twice: `src/proxy.ts` (cookie presence, Next 16 renamed
  `middleware` → `proxy`) and `src/components/auth/AuthGuard.tsx` (auth status).

## Layout trap

A flex-column child with `overflow-x-auto` gets an automatic minimum size of 0
and will collapse to ~1px. Any horizontally scrolling tab strip inside a
`flex flex-col h-full` card needs `shrink-0`. This silently hid the status tabs
on `/bookings` and `/customers`.

## Loose ends

- Empty-form validation on the manual booking form is unverified — the footer
  submit button sits outside the `<form>`, so it may receive a click rather than
  a submit event.
- `src/components/layouts/Sidebar.tsx` is an orphaned duplicate; the app uses
  `src/components/layout/`.
- `src/app/(dashboard)/courts/page.tsx` imports `SPORT_TYPE_OPTIONS` from
  `@/lib/mock/data/metadata` while everything else uses `MetadataContext`.
- `AuthContext.checkApprovalStatus` fakes approval with `Math.random()`.
- Not built, all backend-blocked: in-app payments, instant payout, WhatsApp/SMS
  reminders, staff sub-accounts, memberships, kiosk mode, waivers, white-label.
