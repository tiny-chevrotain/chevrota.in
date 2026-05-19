#!/bin/bash
set -e

ROLE_NAME="chevrotain-create-booking-role-o6p6ey58"
POLICY_NAME="SESEmailPermissions"
ACCOUNT_ID="216989102199"
REGION="eu-north-1"
SES_IDENTITY="olliepgannon@gmail.com"

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Effect\": \"Allow\",
      \"Action\": \"ses:SendEmail\",
      \"Resource\": \"arn:aws:ses:${REGION}:${ACCOUNT_ID}:identity/${SES_IDENTITY}\"
    }]
  }"

echo "Done. IAM policy '$POLICY_NAME' attached to role '$ROLE_NAME'."
