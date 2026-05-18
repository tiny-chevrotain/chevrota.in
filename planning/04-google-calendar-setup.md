# Google Calendar Setup (One-Time)

This guide must be completed by Ollie before the booking API can go live.
Estimated time: ~20 minutes.

---

## Step 1 — Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Name it `chevrota-booking` → Create
4. Make sure the new project is selected in the top dropdown

---

## Step 2 — Enable Google Calendar API

1. In the Cloud Console, go to **APIs & Services → Library**
2. Search for **Google Calendar API**
3. Click **Enable**

---

## Step 3 — Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - User type: **External**
   - App name: `chevrota-booking`
   - Support email: `olliepgannon@gmail.com`
   - Add scope: `https://www.googleapis.com/auth/calendar`
   - Add test user: `olliepgannon@gmail.com`
   - Save & continue through the remaining screens
4. Back at Create OAuth client ID:
   - Application type: **Desktop app**
   - Name: `chevrota-booking-desktop`
   - Create
5. Download the JSON file — it contains `client_id` and `client_secret`

---

## Step 4 — Get a Refresh Token

1. Clone the repo locally if you haven't already
2. Create `api/.env` with:
   ```
   GOOGLE_CLIENT_ID=<from downloaded JSON>
   GOOGLE_CLIENT_SECRET=<from downloaded JSON>
   ```
3. Run:
   ```bash
   node api/scripts/get-refresh-token.mjs
   ```
4. A browser window opens — sign in as **olliepgannon@gmail.com** and grant access
5. The terminal prints a refresh token — copy it and add to `api/.env`:
   ```
   GOOGLE_REFRESH_TOKEN=<the token>
   ```

> Keep `api/.env` secret. It is in `.gitignore`.

---

## Step 5 — Share timmybubble Calendar

This allows the booking API to check both calendars using only one credential set.

1. Open Google Calendar as `timmybubble@gmail.com`
2. On the left sidebar, hover over **timmybubble@gmail.com** calendar → click the three dots → **Settings and sharing**
3. Under **Share with specific people**, add `olliepgannon@gmail.com` with **See all event details** permission
4. Save

Verify: Log in as `olliepgannon@gmail.com` in Google Calendar — you should see `timmybubble@gmail.com` calendar listed under **Other people's calendars**.

---

## Step 6 — Verify SES Sender Email

1. Go to AWS Console → **Amazon SES** → **Verified identities**
2. Select your region (`eu-north-1`)
3. Click **Create identity → Email address**
4. Enter `olliepgannon@gmail.com` (or a domain email like `booking@chevrota.in`)
5. Check the inbox for the verification email and click the link

If using a domain email (`booking@chevrota.in`), you can verify the whole domain instead (requires adding DNS records to Route 53 or wherever the domain is managed).

---

## Step 7 — Store Credentials in Lambda

For each Lambda function (`getAvailability` and `createBooking`):

1. AWS Console → **Lambda** → select the function
2. Go to **Configuration → Environment variables**
3. Add:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `CALENDAR_ID` = `olliepgannon@gmail.com`
   - `TIMMYBUBBLE_CALENDAR_ID` = `timmybubble@gmail.com`
   - `NOTIFICATION_EMAIL` = `olliepgannon@gmail.com`
   - `SES_FROM_EMAIL` = the email you verified in Step 6

> For production, consider moving secrets to **AWS Secrets Manager** and fetching them at runtime rather than storing as plain env vars.
