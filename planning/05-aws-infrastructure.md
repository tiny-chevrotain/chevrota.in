# AWS Infrastructure

## Overview

Two new components added to the existing AWS setup:
1. **Two Lambda functions** — `getAvailability` and `createBooking`
2. **API Gateway (HTTP API)** — routes `/api/availability` and `/api/booking` to the respective functions

The existing S3 bucket and CloudFront distribution also need one change: custom error pages for SPA routing.

---

## CloudFront — SPA Routing Fix

Without this, visiting `chevrota.in/reserve_slot/` directly returns a 403 (S3 serves a 403 for missing keys).

1. AWS Console → **CloudFront** → select the `chevrota.in` distribution
2. Go to **Error pages** tab
3. Add two custom error responses:
   - HTTP error code: **403** → Response page path: `/index.html` → HTTP response code: **200**
   - HTTP error code: **404** → Response page path: `/index.html` → HTTP response code: **200**
4. Save changes (distribution will take ~5 min to deploy)

---

## Lambda Functions

### Create the Functions

For each function (`getAvailability`, `createBooking`):

1. AWS Console → **Lambda** → **Create function**
2. Author from scratch:
   - Name: `chevrota-get-availability` / `chevrota-create-booking`
   - Runtime: **Node.js 20.x**
   - Architecture: x86_64
3. Upload the zip (see **Deployment** section below)
4. Set environment variables (see `04-google-calendar-setup.md` Step 7)
5. Timeout: 15 seconds (calendar API can be slow)
6. Memory: 256 MB

### IAM Permissions

The Lambda execution role needs SES send permission. Add this inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
```

---

## API Gateway (HTTP API)

1. AWS Console → **API Gateway** → **Create API** → **HTTP API**
2. Name: `chevrota-booking-api`
3. Add integrations:
   - `GET /api/availability` → Lambda `chevrota-get-availability`
   - `POST /api/booking` → Lambda `chevrota-create-booking`
4. **CORS configuration**:
   - Allow origins: `https://chevrota.in`, `http://localhost:5173`
   - Allow methods: `GET, POST, OPTIONS`
   - Allow headers: `Content-Type`
5. Deploy to a stage named `prod`
6. Note the invoke URL (e.g. `https://xyz.execute-api.eu-north-1.amazonaws.com`)

### CloudFront API Routing (optional but cleaner)

To avoid CORS entirely and serve the API from the same domain:

1. In CloudFront, add a second **Origin** pointing to the API Gateway invoke URL (HTTPS, no path)
2. Add a **Cache Behavior**:
   - Path pattern: `/api/*`
   - Origin: the API Gateway origin
   - Allowed HTTP methods: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
   - Cache policy: `CachingDisabled`
   - Origin request policy: `AllViewer` (forwards all headers/query strings)
3. With this setup, `https://chevrota.in/api/availability` routes to API Gateway — no CORS config needed

If you skip this, set `VITE_API_BASE_URL=https://xyz.execute-api.eu-north-1.amazonaws.com` as a build-time env var and configure CORS on API Gateway.

---

## Deployment Pipeline

### Building and Deploying Lambda Zips

Add to the CI/CD pipeline (or do manually for first deploy):

```bash
# Build getAvailability
cd api/getAvailability
npm install --production
zip -r ../dist/get-availability.zip .

# Build createBooking
cd ../createBooking
npm install --production
zip -r ../dist/create-booking.zip .

# Deploy
aws lambda update-function-code \
  --function-name chevrota-get-availability \
  --zip-file fileb://api/dist/get-availability.zip \
  --region eu-north-1

aws lambda update-function-code \
  --function-name chevrota-create-booking \
  --zip-file fileb://api/dist/create-booking.zip \
  --region eu-north-1
```

The existing GitHub Actions / CI pipeline that deploys to S3 can be extended with these steps. Lambda deploys are near-instant (no CloudFront invalidation needed for API changes).

---

## Local Development

Start the dev API server before running Vite:

```bash
# Terminal 1
node api/dev-server.mjs

# Terminal 2
npm run dev
```

`vite.config.ts` proxies `/api/*` to `http://localhost:3001` so the frontend calls work identically in dev and production.

The dev server uses real Google Calendar credentials from `api/.env` — it makes live API calls. For pure offline dev, mock responses can be hardcoded in `api/dev-server.mjs`.

---

## Cost Estimate

At low volume (< 1000 bookings/month):
- Lambda: Free tier covers 1M requests/month — effectively **£0**
- API Gateway HTTP API: $1 per million requests — effectively **£0**
- SES: $0.10 per 1000 emails — effectively **£0**
- Google Calendar API: Free (generous quota)

Total: **negligible**.
