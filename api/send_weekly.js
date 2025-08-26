// api/send_weekly.js
import fetch from 'node-fetch';

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY;
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const FROM_EMAIL = process.env.FROM_EMAIL || 'deals@yourdomain.com';
const FROM_NAME = process.env.FROM_NAME || "Car Buyers' Deal Alert";

async function airtableList() {
  const resp = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/Subscribers?view=Grid%20view`, {
    headers: { Authorization: `Bearer ${AIRTABLE_KEY}` },
  });
  return resp.json();
}

export default async function handler(req, res) {
  try {
    if (req.headers['x-cron-secret'] !== CRON_SECRET) return res.status(403).json({ error: 'forbidden' });

    const listData = await airtableList();
    const records = listData.records || [];
    let sent = 0;

    for (const r of records) {
      const email = r.fields.Email;
      const zip = r.fields.Zip;
      if (!email || !zip) continue;

      try {
        // 1) fetch incentives (call local function)
        const incResp = await fetch(`${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL}/api/fetch_incentives?zip=${zip}`);
        const incJson = await incResp.json();

        // 2) generate email
        const genResp = await fetch(`${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL}/api/generate_email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zip, incentives: incJson.incentives }),
        });
        const genJson = await genResp.json();
        const html = genJson.html || '<p>No content</p>';

        // 3) send via SendGrid
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SENDGRID_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }], subject: `Deal Alert: Top Incentives in ${zip}` }],
            from: { email: FROM_EMAIL, name: FROM_NAME },
            content: [{ type: 'text/html', value: html }],
          }),
        });

        sent++;
      } catch (err) {
        console.error('failed for', email, err);
      }
    }

    return res.status(200).json({ ok: true, total: records.length, sent });
  } catch (err) {
    console.error('send_weekly err', err);
    return res.status(500).json({ error: err.message });
  }
}
