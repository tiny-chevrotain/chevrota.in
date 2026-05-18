#!/bin/bash
set -e

CID=$(grep ^GOOGLE_CLIENT_ID "$(dirname "$0")/../.env" | cut -d= -f2-)
CSEC=$(grep ^GOOGLE_CLIENT_SECRET "$(dirname "$0")/../.env" | cut -d= -f2-)
CREF=$(grep ^GOOGLE_REFRESH_TOKEN "$(dirname "$0")/../.env" | cut -d= -f2-)

VARS="Variables={GOOGLE_CLIENT_ID=$CID,GOOGLE_CLIENT_SECRET=$CSEC,GOOGLE_REFRESH_TOKEN=$CREF,CALENDAR_ID=olliepgannon@gmail.com,TIMMYBUBBLE_CALENDAR_ID=timmybubble@gmail.com,NOTIFICATION_EMAIL=olliepgannon@gmail.com,SES_FROM_EMAIL=olliepgannon@gmail.com}"

aws lambda update-function-configuration --function-name chevrotain-get-availability --region eu-north-1 --environment "$VARS"
aws lambda update-function-configuration --function-name chevrotain-create-booking --region eu-north-1 --environment "$VARS"

echo "Done."
