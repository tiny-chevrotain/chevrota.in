# Architecture Overview

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite (existing SPA) |
| Hosting | AWS S3 + CloudFront (existing CI/CD on `main` push) |
| Booking API | AWS Lambda (Node.js 20.x) + API Gateway |
| Calendar | Google Calendar API v3 (OAuth2, single credential set) |
| Email | AWS SES |

## High-Level Diagram

```
Browser
  │
  ├── chevrota.in/             → S3/CloudFront → index.html → React App (tabs)
  │
  └── chevrota.in/reserve_slot/ → S3/CloudFront → index.html → BookingPage (isolated)
           │
           ├── GET /api/availability  → API Gateway → Lambda (getAvailability)
           │                                               │
           │                                         Google Calendar API
           │                                    (olliepgannon@gmail.com +
           │                                     timmybubble@gmail.com shared)
           │
           └── POST /api/booking      → API Gateway → Lambda (createBooking)
                                                           │
                                                     Google Calendar API (write event)
                                                           │
                                                       AWS SES (email to Ollie)
```

## Key Decisions

**No router library**: Path detection via `window.location.pathname` in `App.tsx`. Simple, zero dependencies.

**Single Google OAuth credential**: `timmybubble@gmail.com` calendar is shared (view-only) with `olliepgannon@gmail.com`. One refresh token covers both calendars.

**Studio availability logic**: A calendar event with a `location` field and `status: "busy"` means Ollie is at a specific location — studio shoots unavailable, outdoor/location shoots are fine.

**No payment**: Booking is a reservation only. Price is shown for transparency; payment arranged offline.

**CloudFront SPA routing**: Custom error pages (403/404 → `/index.html` with HTTP 200) allow direct URL access to `/reserve_slot/`.
