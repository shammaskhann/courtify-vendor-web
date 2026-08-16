This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Vendor App Implementation Checklist

Below is the implementation status of the Vendor Web Panel modules. This can be used to track what functionalities are completed and what still needs to be built.

### 1. Authentication Module
- [x] Login (`POST /auth/login`) with persistent session hydration
- [x] Signup (`POST /auth/vendor/signup`) pushing to OTP
- [x] OTP Verification (`POST /auth/vendor/verifyOtp`)
- [x] Role-based routing (Admin vs. Vendor vs. Pending)
- [x] Change Password UI/UX (`POST /auth/change-password` integration)
- [x] Proper backend approval workflow mapping (currently mocked or missing automated flows)

### 2. Venues Module
- [x] Fetch Venues (`GET /api/court-owner/venues`)
- [x] Fetch Venue by ID and display images
- [x] Venue creation and modification logic
- [ ] Venue Deletion (Cascading checks for active bookings/courts needed)
- [ ] Business Profile Settings (`PATCH /court-owner/profile`)

### 3. Courts Module
- [x] Court creation, fetching, and updating
- [x] Complex Pricing Logic (Nullifying orphaned fields on type switch)
- [x] Dynamic Base Price calculation for Widgets
- [x] Disable Court validation (Handling existing booked slots when disabled)
- [x] Visual calendar heatmap on court details page

### 4. Deals (Promotions) Module
- [x] Fetching active/all deals
- [x] Create Deal (`POST`)
- [x] Update Deal (`PUT`)
- [x] Delete Deal (`DELETE`) with modal handling
- [x] Toggle Deal Status (`PUT .../toggle`)
- [x] Backend Promo Code validation (forcing uppercase alphanumeric and length)
- [ ] Expose `isStackable` option in the UI (currently hardcoded)

### 5. Booking Module
- [x] Fetching Bookings with status filters
- [x] Accepting/Rejecting Bookings
- [x] Checking QR codes for walk-ins
- [x] Walk-in Manual Booking (`POST /vendor-booking`) full backend support
- [x] Manual booking form validation (Submit button sits outside form context)
- [ ] Ensure UTC transmission strictly for all timezone-dependent slots

### 6. Chat Module
- [x] Inbox UI and Sidebar integration
- [x] STOMP WebSocket integration (`ws://`)
- [x] Thread initiation and history fetching
- [ ] Read Receipts / Seen Status
- [ ] Pagination / infinite scrolling for long threads
- [ ] File/Image uploads in chat

### 7. Dashboard & Analytics
- [x] Headline totals and revenue series charts
- [ ] Migrate client-side derivation of Customer analytics to backend endpoints
- [ ] Migrate client-side derivation of Court Utilization to backend endpoints
- [ ] Integration of blocked modules (In-app payments, payouts, staff accounts, SMS reminders)
