# Courtify Vendor Panel Requirements

## 1. Purpose

This document defines the requirements for a web-based vendor panel for Courtify. The panel is intended for venue owners and operational staff to manage venues, courts, bookings, pricing, promotions, and analytics from a browser-based dashboard.

The scope below is based on the current Flutter client modules, repositories, models, and API endpoint constants in this workspace. Where the backend contract is not yet fully visible in the client code, the requirement is marked as a recommended web requirement or a backend alignment item.

## 2. Product Goals

The vendor panel should let a vendor:

- Sign up, verify OTP, log in, and access the dashboard only after approval.
- Create and manage venues.
- Create and manage courts with pricing, images, and availability.
- View and process bookings.
- Create and toggle deals/promotions.
- View analytics for bookings, revenue, and occupancy.
- Manage profile, notifications, and support content.

## 3. Target Users and Roles

### 3.1 Vendor Admin

- Full access to all venues owned by the vendor.
- Can create and edit venues and courts.
- Can manage bookings and promotions.
- Can access analytics and settings.

### 3.2 Venue Manager

- Limited to assigned venues.
- Can manage venue details, courts, bookings, and deals for assigned venues.

### 3.3 Support / Operations User

- Read-only access to analytics and operational views if enabled later.
- Optional for future releases.

## 4. Recommended Web Information Architecture

### 4.1 Primary Navigation

- Dashboard
- Venues
- Courts
- Bookings
- Deals
- Customers / Users
- Notifications
- Reports / Analytics
- Settings
- Help and Support

### 4.2 Secondary Navigation

- Profile
- Approval status
- Location settings
- Theme preferences
- Logout

## 5. Core Functional Requirements

### 5.1 Authentication and Onboarding

The web panel must support the same vendor account lifecycle already present in the client:

- Vendor signup.
- OTP verification.
- Login.
- Pending approval state.
- Approved vendor access to the dashboard.
- Persisted session restoration on refresh or re-open.

#### Required behaviors

- The system must block dashboard access until login succeeds.
- If a vendor is logged in but not approved, the UI must show an approval pending state instead of the full dashboard.
- If OTP verification fails, the UI must surface a clear validation message.
- Login should restore user and token information from storage when available.

#### Related API endpoints

- `POST /auth/vendor/signup`
- `POST /auth/vendor/verifyOtp`
- `POST /auth/login`

### 5.2 Dashboard Home

The dashboard home page must present operational and financial summary data in one view.

#### Required widgets

- Total courts.
- Total bookings.
- Total revenue.
- Occupancy rate.
- Revenue trend chart or list.
- Recent activity summary.

#### Required behaviors

- Load dashboard analytics on page load.
- Support pull-to-refresh or manual refresh on the web UI.
- Show a friendly empty state when no analytics are available.
- Show loading and error states separately.

#### Related API endpoint

- `GET /dashboard/analytics`

### 5.3 Venue Management

The venue module must support full CRUD for vendor-owned venues.

#### Functional scope

- View all owned venues.
- View venue detail.
- Create a new venue.
- Update an existing venue.
- Delete a venue.
- Upload venue imagery to object storage.
- Attach amenities, location, opening and closing hours.

#### Required venue fields

- Name.
- Description.
- Address.
- City.
- Latitude.
- Longitude.
- Amenities.
- Opening time.
- Closing time.
- Main image URL.

#### Required behaviors

- The create venue form should be multi-step on web as well, matching the current mobile flow.
- Location selection must support manual map picking or precise coordinate entry.
- City and amenities should be populated from metadata endpoints.
- The panel should prevent submission if required fields are missing.
- Image upload should happen before venue submission.

#### Related API endpoints

- `GET /court-owner/venues/my`
- `GET /court-owner/venues/my/{id}`
- `POST /court-owner/venues`
- `PATCH /court-owner/venues/my/{id}`
- `DELETE /court-owner/venues/my/{id}`
- `POST /s3/venue/upload`

### 5.4 Court Management

The court module must support court CRUD, image upload, and advanced pricing.

#### Functional scope

- List courts across the vendor account.
- List courts per venue.
- Create a court under a venue.
- Edit court details.
- Delete a court.
- Upload one or more court images.
- Configure weekday and time-based pricing.
- Configure half-hour slot availability.
- Mark a court disabled or active if the backend supports it.

#### Required court fields

- Court name.
- Venue ID.
- Supported sport types.
- Open weekdays.
- Half-hour slot flag.
- Pricing type.
- Images.
- Lat / lng if used by backend.
- Disabled flag if used by backend.

#### Pricing model requirements

The current code supports three pricing models:

1. CONSTANT
2. WEEKDAY_WEEKEND
3. PER_DAY

Each model can optionally support peak and off-peak pricing windows.

#### Pricing rules

- The system must support off-peak pricing as the baseline.
- Peak pricing is optional and depends on the selected pricing model.
- Peak start and end times are optional but must be paired if provided.
- The UI must show only the pricing inputs relevant to the selected pricing type.
- The web form must preserve backward compatibility with legacy pricing keys when editing older courts.

#### Pricing payload requirements

##### CONSTANT

Required:

- `constantPriceOffPeak`

Optional:

- `constantPricePeak`
- `peakStartTime`
- `peakEndTime`

##### WEEKDAY_WEEKEND

Required:

- `weekdayPriceOffPeak`
- `weekendPriceOffPeak`

Optional:

- `weekdayPricePeak`
- `weekendPricePeak`
- `peakStartTime`
- `peakEndTime`

##### PER_DAY

Required:

- `pricePerDayOffPeak` map

Optional:

- `pricePerDayPeak` map
- `peakStartTime`
- `peakEndTime`

#### Court creation and editing behaviors

- The court form must allow selecting one or more sport types from metadata.
- The form must allow selecting open weekdays.
- Image uploads should support multiple files.
- The UI should validate price fields by type before submit.
- Peak and off-peak inputs should be grouped clearly in the interface.
- The API contract should accept both current and legacy pricing keys when reading older records.

#### Related API endpoints

- `GET /court-owner/courts/all`
- `GET /court-owner/courts/venues/{venueId}`
- `POST /court-owner/courts/venues/{venueId}/court`
- `PUT /courts/court-owner/venues/{venueId}/courts/{courtId}`
- `DELETE /court-owner/courts/venues/{venueId}/court/{courtId}`
- `POST /s3/court/upload`

### 5.5 Booking Management

The booking module must support operational review and status changes.

#### Functional scope

- View bookings by venue.
- View completed bookings by venue.
- View vendor booking queues by status.
- Update booking status.
- Verify QR code / QR token at entry.
- Optionally create bookings for testing or admin use if enabled.

#### Booking statuses

- Pending.
- Confirmed.
- Rejected.
- Completed.
- Cancelled.

#### Required behaviors

- Status tabs must be filterable in the UI.
- Changing a booking status must refresh the affected lists.
- The booking card should show customer name, contact, court, date, time, payment status, and amount.
- QR verification should be available on a dedicated scanner page or modal.

#### Related API endpoints

- `GET /bookings/venue/{venueId}`
- `GET /bookings/venue/{venueId}/completed`
- `GET /vendor-booking/pending`
- `GET /vendor-booking/confirmed`
- `GET /vendor-booking/rejected`
- `GET /vendor-booking/completed`
- `PUT /vendor-booking/{bookingId}/status`
- `POST /vendor-booking/verify-qr`
- `POST /bookings`

### 5.6 Deals and Promotions

The deals module must allow vendors to create, update, delete, and toggle promotional offers.

#### Functional scope

- View all deals.
- View only active deals.
- Create a deal.
- Edit a deal.
- Delete a deal.
- Toggle active / inactive status.
- Filter deals by venue and court.

#### Required deal fields

- Name.
- Deal type.
- Deal value.
- Applicable days.
- Valid from date.
- Valid to date.
- Maximum uses.
- Promo code.
- Priority.
- Is stackable flag.
- Active flag.
- Optional court ID.
- Optional venue ID.
- Optional buy and get quantities for buy-x-get-y offers.
- Optional time window.

#### Supported deal types

- Percentage off.
- Flat off.
- Fixed price.
- Buy X get Y.

#### Required behaviors

- The form should adapt based on deal type.
- Start and end dates are required for valid promotions.
- Optional time windows should only be shown when needed.
- Deal toggling should update the status immediately in the list.

#### Related API endpoints

- `GET /court-owner/deals`
- `GET /court-owner/deals/active`
- `GET /court-owner/deals/{id}`
- `POST /court-owner/deals`
- `PUT /court-owner/deals/{id}`
- `DELETE /court-owner/deals/{id}`
- `PUT /court-owner/deals/{id}/toggle`

### 5.7 Metadata and Lookup Data

The web panel must consume shared metadata for dynamic dropdowns and validation.

#### Data sources

- Sport types.
- Cities.
- Amenities.

#### Required behaviors

- Metadata should be cached while the session is active.
- Dropdowns for venue and court forms should be populated from the API rather than hard-coded.
- The UI should handle empty metadata gracefully.

#### Related API endpoints

- `GET /common/sport-types`
- `GET /common/cities`
- `GET /common/amenities`

### 5.8 Notifications and Device Tokens

The panel should support notification permissions and token registration for future push use cases.

#### Required behaviors

- Request notification permission in a browser-safe way.
- Store and refresh device token information when login occurs.
- Support local notification display for foreground events where applicable.
- Keep notification logic decoupled from dashboard rendering.

#### Related API endpoint

- `POST /notifications/token`

### 5.9 Location Support

The panel should help vendors manage venue coordinates and browser geolocation where permitted.

#### Required behaviors

- Allow manual coordinate entry.
- Support current-location lookup when browser permissions allow it.
- Persist the selected location in local preferences for reuse.
- Handle denied and denied-forever permission states with clear UI.

### 5.10 Profile and Account Settings

The panel should allow account management and session control.

#### Required behaviors

- View profile information.
- Edit account details if backend support exists.
- Sign out.
- Persist session state securely.
- Show approval, verification, and completion state clearly.

#### Related API endpoints

- `PATCH /users/updateProfile/{id}`

### 5.11 Help, Policies, and Static Pages

The panel should include support and policy pages.

#### Pages

- Help and support.
- About Courtify.
- Privacy policy.
- Location update guidance.
- Notifications guidance.

## 6. API Reference

This section summarizes the current API contract as inferred from the client code.

### 6.1 Authentication APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/vendor/signup` | Start vendor registration |
| POST | `/auth/vendor/verifyOtp` | Verify vendor OTP |
| POST | `/auth/login` | Vendor login |
| GET or POST | `/auth/verify` | Firebase token verification, if enabled by backend |

#### Vendor signup request example

```json
{
  "name": "Alpha Sports Club",
  "email": "owner@example.com",
  "contact": "+919999999999",
  "password": "secret",
  "coordinates": {
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

#### OTP verification request example

```json
{
  "email": "owner@example.com",
  "code": "123456"
}
```

#### Login request example

```json
{
  "email": "owner@example.com",
  "password": "secret"
}
```

### 6.2 Venue APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/court-owner/venues/my` | List vendor venues |
| GET | `/court-owner/venues/my/{id}` | Venue details |
| POST | `/court-owner/venues` | Create venue |
| PATCH | `/court-owner/venues/my/{id}` | Update venue |
| DELETE | `/court-owner/venues/my/{id}` | Delete venue |
| POST | `/s3/venue/upload` | Upload venue image |

#### Create venue request example

```json
{
  "name": "Alpha Sports Club",
  "description": "Premium outdoor and indoor courts",
  "address": "MG Road",
  "city": "Bengaluru",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "amenities": ["Parking", "Washroom", "Drinking Water"],
  "openingTime": "09:00 AM",
  "closingTime": "11:00 PM",
  "image": "https://cdn.example.com/venue.jpg"
}
```

### 6.3 Court APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/court-owner/courts/all` | List all courts for the vendor context |
| GET | `/court-owner/courts/venues/{venueId}` | List courts for one venue |
| POST | `/court-owner/courts/venues/{venueId}/court` | Create court |
| PUT | `/courts/court-owner/venues/{venueId}/courts/{courtId}` | Update court |
| DELETE | `/court-owner/courts/venues/{venueId}/court/{courtId}` | Delete court |
| POST | `/s3/court/upload` | Upload court images |

#### Court create request example

```json
{
  "name": "Court A",
  "sportType": ["TENNIS", "PADEL"],
  "openWeekdays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  "isHalfHourSlot": false,
  "pricingType": "CONSTANT",
  "images": [
    "https://cdn.example.com/court-a.jpg"
  ],
  "constantPriceOffPeak": 1200,
  "constantPricePeak": 1500,
  "peakStartTime": "06:00 PM",
  "peakEndTime": "11:00 PM"
}
```

### 6.4 Booking APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/bookings/venue/{venueId}` | List bookings for a venue |
| GET | `/bookings/venue/{venueId}/completed` | Completed bookings for a venue |
| GET | `/vendor-booking/pending` | Pending bookings |
| GET | `/vendor-booking/confirmed` | Confirmed bookings |
| GET | `/vendor-booking/rejected` | Rejected bookings |
| GET | `/vendor-booking/completed` | Completed bookings |
| PUT | `/vendor-booking/{bookingId}/status` | Update booking status |
| POST | `/vendor-booking/verify-qr` | Verify QR token |
| POST | `/bookings` | Create booking |

#### Update booking status request example

```json
{
  "status": "CONFIRMED"
}
```

#### QR verification request example

```json
{
  "qrToken": "sample-qr-token"
}
```

### 6.5 Deal APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/court-owner/deals` | List all vendor deals |
| GET | `/court-owner/deals/active` | List active deals |
| GET | `/court-owner/deals/{id}` | Deal details |
| POST | `/court-owner/deals` | Create deal |
| PUT | `/court-owner/deals/{id}` | Update deal |
| DELETE | `/court-owner/deals/{id}` | Delete deal |
| PUT | `/court-owner/deals/{id}/toggle` | Toggle active status |

#### Deal create request example

```json
{
  "name": "Weekend Saver",
  "dealType": "PERCENTAGE_OFF",
  "dealValue": 20,
  "applicableDays": ["SATURDAY", "SUNDAY"],
  "validFrom": "2026-08-01",
  "validTo": "2026-08-31",
  "maxUses": 100,
  "promoCode": "WEEKEND20",
  "priority": 1,
  "isStackable": false,
  "isActive": true
}
```

### 6.6 Metadata APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/common/sport-types` | Sport type list |
| GET | `/common/cities` | City list |
| GET | `/common/amenities` | Amenity list |

### 6.7 Analytics and Notification APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/dashboard/analytics` | Dashboard summary |
| POST | `/notifications/token` | Register device token |

### 6.8 Profile API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| PATCH | `/users/updateProfile/{id}` | Update user profile |

### 6.9 Missing APIs (To Be Implemented)

The following endpoints are required by the web panel UI but are not currently documented or implemented:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/court-owner/courts/venues/{venueId}/court/{courtId}` | Get a single court's details |
| GET | `/vendor-booking/all` | Fetch all bookings for a vendor (with pagination/filters), not just per-venue |
| GET | `/vendor-booking/counts` | Fetch summary counts of bookings by status (pending, confirmed, etc.) |
| GET | `/notifications` | Fetch user's notification feed |
| PUT | `/notifications/{id}/read` | Mark single notification as read |
| PUT | `/notifications/read-all` | Mark all notifications as read |
| GET | `/notifications/unread-count` | Get count of unread notifications |
| PUT | `/users/updatePassword` | Change user password securely |

## 7. Data Models and Validation Rules

### 7.1 Vendor Auth Model

Required fields expected by the current client:

- Id.
- Name.
- Email.
- Contact.
- Auth type.
- Role.
- Venue IDs.
- Approval flag.
- Verification flag.
- Profile completion flag.
- Step count.

### 7.2 Venue Validation

- Name is required.
- Description is required.
- Address is required.
- City is required.
- Latitude and longitude are required.
- At least one amenity is required.
- Opening and closing times are required unless backend allows 24-hour venues.

### 7.3 Court Validation

- Court name is required.
- Sport types are required.
- Open weekdays are required.
- Pricing type is required.
- A valid off-peak price is required for the selected pricing model.
- Peak time inputs must be paired when provided.
- Price maps must contain valid numeric values for each day selected.

### 7.4 Booking Validation

- A booking status update must use one of the supported status values.
- QR verification must reject empty tokens.

### 7.5 Deal Validation

- Name is required.
- Deal type is required.
- Deal value is required and must be numeric.
- Valid from and valid to are required.
- Applicable days must not be empty for day-based deals.

## 8. Web UX Requirements

### 8.1 Responsive Layout

- The panel must work on desktop, tablet, and smaller browser widths.
- Navigation should collapse to a sidebar drawer or compact nav on smaller screens.
- Tables should convert to card layouts or horizontal scroll on narrow widths.

### 8.2 Loading and Error States

- Every API-driven screen must have loading, empty, and error states.
- Error messages should be specific enough for recovery.
- Retry actions should be available where network failure is common.

### 8.3 File Upload UX

- Show upload progress for venue and court images.
- Allow image removal before submit.
- Support preview of selected images.

### 8.4 Form UX

- Use multi-step forms where current mobile flows are multi-step.
- Persist partially completed forms when possible.
- Use field-level validation and summary validation on submit.

### 8.5 Accessibility

- Keyboard navigation must work across all major forms and menus.
- Inputs must have labels and error descriptions.
- Contrast should remain readable in both light and dark themes.

## 9. Recommended Backend Alignments

The current client exposes some backend expectations that should be confirmed before the web build starts:

- Exact request and response payloads for authentication.
- Whether `updateUser` is supported for vendor profile editing in the same way as mobile.
- Whether `deviceToken` is fully enabled for web push notifications.
- Whether `createBooking` is meant for vendor admin use or only customer-side use.
- Whether court disable / enable exists as an API action.
- Whether staff roles and permissions are supported now or should be planned for a later release.

## 10. Suggested Delivery Phases

### Phase 1

- Authentication and approval flow.
- Dashboard analytics.
- Venue management.
- Court management.

### Phase 2

- Booking management.
- QR verification.
- Deals and promotions.
- Metadata-driven forms.

### Phase 3

- Notifications center.
- Profile settings.
- Audit logs.
- Staff roles and permissions.
- Reports export.

## 11. Acceptance Criteria

The web vendor panel is considered ready when:

- A vendor can sign up, verify, log in, and reach the dashboard.
- A vendor can create, update, and delete venues.
- A vendor can create, update, and delete courts using all pricing modes.
- A vendor can view and process bookings by status.
- A vendor can verify booking QR tokens.
- A vendor can create, edit, delete, and toggle deals.
- Dashboard analytics render correctly.
- Form dropdowns are populated from metadata APIs.
- Loading, empty, and error states are implemented consistently.
- The UI works cleanly in a browser at desktop and tablet widths.

## 12. Notes for Implementation Team

- Reuse the current API endpoint structure as the source of truth unless backend changes are agreed first.
- Keep the pricing model logic in a shared form schema so mobile and web stay consistent.
- Treat the current mobile payload compatibility rules as mandatory for web editing too.
- Prefer a modular feature structure so each dashboard area can evolve independently.

## 13. Related Design Docs

- [WEB_VENDOR_PANEL_THEME_GUIDE.md](WEB_VENDOR_PANEL_THEME_GUIDE.md) for layout, typography, spacing, and component rules.
- [WEB_VENDOR_PANEL_COLOR_SCHEME.md](WEB_VENDOR_PANEL_COLOR_SCHEME.md) for the exact color palette, semantic mapping, and UI usage rules.