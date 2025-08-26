# Car Buyers' Deal Alert (MVP)

This repo contains a Vercel serverless MVP to collect `email + zip`, fetch incentives (placeholder), generate email via OpenAI, and send via SendGrid.

## Quick start
1. Create Airtable base/table `Subscribers` with fields: Email (single line), Zip (single line), OptIn (checkbox).
2. Add required env vars in Vercel.
3. Deploy to Vercel and set your domain.
4. Add GitHub Actions secret `CRON_SECRET` and update workflow with your deployed domain.

ENV VARS:
- AIRTABLE_BASE_ID
- AIRTABLE_API_KEY
- SENDGRID_API_KEY
- OPENAI_API_KEY
- CRON_SECRET
- FROM_EMAIL
- FROM_NAME
- VERCEL_URL (optional)
