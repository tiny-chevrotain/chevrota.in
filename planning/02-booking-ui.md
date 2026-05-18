# Booking UI

## Route

`/reserve_slot/` — no `<Nav />`, completely isolated from the rest of the site.

## Component Tree

```
BookingPage
├── BookingContext (React context — shared booking state)
└── Multi-step form (step 1–5 + success screen)
    ├── StepSessionType    (step 1)
    ├── StepDuration       (step 2)
    ├── StepCalendar       (step 3)
    ├── StepContact        (step 4)
    └── StepConfirmation   (step 5 — summary + submit button)
```

## Files

```
src/components/pages/BookingPage/
├── BookingPage.tsx
├── BookingPage.module.css
├── BookingContext.tsx
└── steps/
    ├── StepSessionType.tsx
    ├── StepDuration.tsx
    ├── StepCalendar.tsx
    ├── StepContact.tsx
    └── StepConfirmation.tsx
```

## Booking State Shape (BookingContext)

```ts
interface BookingState {
  sessionType: 'photoshoot' | 'video' | 'both' | null;
  durationMinutes: number | null;
  isStudio: boolean;
  date: string | null;         // "YYYY-MM-DD"
  time: string | null;         // "HH:MM" (24hr)
  slotIsLocationOnly: boolean;
  locationName: string | null; // from calendar event
  contactMethod: 'phone' | 'email' | 'instagram' | null;
  contactValue: string;
  info: string;
}
```

## Step 1 — Session Type

Three selectable cards:
- **Photoshoot** — edited photos delivered within 7 days
- **Video** — portrait or landscape; showcase, music video, cinematic edit; within 7 days
- **Photoshoot + Video** — minimum 1 hour (30 min each); full edit within 7 days

## Step 2 — Duration & Pricing

Render only options valid for the chosen session type.

| Label | Price | Duration | Photoshoot | Video | Both | Deliverables |
|---|---|---|---|---|---|---|
| 30 min | £30 | 30 | ✓ | ✗ | ✗ | 50 edited photos |
| 1 hour | £50 | 60 | ✓ | ✓ | ✓ | 100 edited photos / video edit |
| 2 hours | £80 | 120 | ✓ | ✓ | ✓ | 200 edited photos / video edit |
| Full day | £150 | 480 | ✓ | ✓ | ✓ | All photos / video edit |
| Studio — 1 hr | £150 | 60 | ✓ | ✗ | ✗ | 100 edited photos |
| Studio — 2 hr | £300 | 120 | ✓ | ✗ | ✗ | 200 edited photos |

All options: "Delivered within 7 days or full refund."

## Step 3 — Calendar + Time Slot

### Calendar Month View
- Simple CSS grid (Mon–Sun headers, 6-row max)
- Fetch availability from API when month changes or duration changes
- Day colours:
  - White/available — at least one slot exists
  - Light grey — no slots (all busy or past)
  - Today highlighted with a dot

### Time Slot List (shown below calendar on day click)
- 30-min increments from 08:00 to 20:00 (filtered to fit duration before end)
- Slot badge colours:
  - Green — fully available (studio shoots OK)
  - Amber — location-only (studio unavailable, outdoor fine); show tooltip with location
  - Grey/strikethrough — busy

### Studio Logic
When an amber (location-only) slot is selected:
- Disable studio duration options in step 2 (or show note inline in step 3)
- Show info banner: "Studio shoots are not available for this slot — Ollie will be at [location]. Outdoor/location shoots are still available."

## Step 4 — Contact & Info

```
Contact method: [ Phone ▾ ]   [ _________ ]  (required)
                  Email
                  Instagram

Additional info: [ textarea, optional ]
"Tell me what you're after — location, vibe, anything useful."
```

Validation: contact method + value both required. Value validated loosely (non-empty string).

## Step 5 — Confirmation

Show summary:
- Session type + duration
- Date + time
- Price
- Deliverables + turnaround
- Contact info

Primary CTA: **Book this slot** → `POST /api/booking`

States:
- Loading spinner while API call is in flight
- Success screen: "You're booked! Ollie will be in touch." + summary
- Error: "Something went wrong. Please try again." + retry button

## Navigation

- Back/forward buttons between steps
- Step indicator (e.g. "Step 2 of 5") shown at top
- No step is skippable; each validates before advancing
