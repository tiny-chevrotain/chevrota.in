# Backend API

## Structure

```
api/
├── getAvailability/
│   ├── index.mjs
│   └── package.json
├── createBooking/
│   ├── index.mjs
│   └── package.json
├── scripts/
│   └── get-refresh-token.mjs   (one-time OAuth setup helper)
└── dev-server.mjs              (local Express server mirroring Lambda for development)
```

## Environment Variables (both functions)

| Key | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_REFRESH_TOKEN` | From get-refresh-token.mjs script |
| `CALENDAR_ID` | `olliepgannon@gmail.com` |
| `TIMMYBUBBLE_CALENDAR_ID` | `timmybubble@gmail.com` (if shared, otherwise same as CALENDAR_ID) |
| `NOTIFICATION_EMAIL` | `olliepgannon@gmail.com` |
| `SES_FROM_EMAIL` | Verified sender (e.g. `booking@chevrota.in` or `olliepgannon@gmail.com`) |
| `AWS_REGION` | `eu-north-1` (matching existing infra) |

---

## GET /api/availability

### Request
```
GET /api/availability?year=2026&month=5&durationMinutes=60
```

### Logic
1. Build Google OAuth2 client from env vars; refresh access token.
2. Query `calendarList` to get all calendars the credential can see (includes shared timmybubble calendar).
3. For each day in the requested month:
   a. Generate candidate slots: 08:00–20:00, every 30 min, trimmed so `slot + duration <= 20:00`.
   b. Fetch events from both calendar IDs that overlap each candidate slot window.
   c. Classify each event:
      - `transparency: "transparent"` (free) → ignore (slot stays available)
      - `status: "cancelled"` → ignore
      - Busy + no `location` → marks slot as `"busy"`
      - Busy + has `location` → marks slot as `"location-only"`, captures location string
   d. A slot is available if no event makes it `"busy"`.
   e. Past slots (before now) are marked `"busy"` automatically.
4. Return availability map.

### Response
```json
{
  "availability": {
    "2026-05-15": [
      { "time": "09:00", "status": "available" },
      { "time": "09:30", "status": "location-only", "location": "Manchester" },
      { "time": "10:00", "status": "busy" }
    ],
    "2026-05-16": []
  }
}
```

`[]` on a date means the day has no available slots at all.

### Error Response
```json
{ "error": "Failed to fetch availability" }
```
HTTP 500.

---

## POST /api/booking

### Request Body
```json
{
  "sessionType": "photoshoot",
  "durationMinutes": 60,
  "isStudio": false,
  "date": "2026-05-15",
  "time": "09:00",
  "contactMethod": "instagram",
  "contactValue": "@username",
  "info": "Headshots for my portfolio, outdoor, casual vibe."
}
```

### Validation
- All fields except `info` are required.
- `sessionType` ∈ `["photoshoot", "video", "both"]`
- `durationMinutes` ∈ `[30, 60, 120, 480]`
- `date` matches `YYYY-MM-DD`
- `time` matches `HH:MM`
- `contactMethod` ∈ `["phone", "email", "instagram"]`
- `contactValue` non-empty string

### Logic
1. Validate inputs; return HTTP 400 with `{ error: "..." }` on failure.
2. Compute `endTime = date + time + durationMinutes`.
3. Create Google Calendar event on `CALENDAR_ID`:
   ```
   summary:     "📸 Booking: Photoshoot (1 hour)"
   description: "Contact: @username (Instagram)\nInfo: ...\nPrice: £50\nDeliverables: 100 edited photos within 7 days"
   start:       { dateTime: "2026-05-15T09:00:00", timeZone: "Europe/London" }
   end:         { dateTime: "2026-05-15T10:00:00", timeZone: "Europe/London" }
   ```
4. Send SES email to `NOTIFICATION_EMAIL`:
   ```
   Subject: New Booking: Photoshoot — 15 May 2026, 9:00am
   Body: plain-text summary of all booking details
   ```
5. Return `{ success: true, eventId: "..." }`.

### Error Response
```json
{ "error": "Validation failed: contactValue is required" }
```
HTTP 400 for validation, HTTP 500 for calendar/email failures.

---

## Pricing Helper (shared by both functions)

```js
function getPrice(sessionType, durationMinutes, isStudio) {
  if (isStudio) return durationMinutes === 60 ? 150 : 300;
  const map = { 30: 30, 60: 50, 120: 80, 480: 150 };
  return map[durationMinutes];
}

function getDeliverables(sessionType, durationMinutes) {
  if (sessionType === 'video') return 'Video edit within 7 days or full refund';
  const photoMap = { 30: 50, 60: 100, 120: 200, 480: 'all' };
  const count = photoMap[durationMinutes];
  const photos = count === 'all' ? 'All edited photos' : `Minimum ${count} edited photos`;
  if (sessionType === 'both') return `${photos} + video edit within 7 days or full refund`;
  return `${photos} within 7 days or full refund`;
}
```

---

## Local Dev Server

`api/dev-server.mjs` — Express server on port 3001 that imports and wraps both Lambda handlers. Requires a local `.env` file with the same environment variables. Start with `node api/dev-server.mjs`.

Vite dev proxy in `vite.config.ts`:
```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:3001', changeOrigin: true }
  }
}
```
