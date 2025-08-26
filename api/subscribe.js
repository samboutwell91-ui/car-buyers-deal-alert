// api/subscribe.js
import fetch from 'node-fetch';

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY;
const TABLE = 'Subscribers';

// simple validation
function validZip(z) { return /^\d{5}$/.test(z); }
function validEmail(e) { return /\S+@\S+\.\S+/.test(e); }

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { email, zip } = req.body || {};
    if (!email || !zip) return res.status(400).json({ error: 'email and zip required' });
    if (!validEmail(email)) return res.status(400).json({ error: 'invalid email' });
    if (!validZip(zip)) return res.status(400).json({ error: 'invalid zip' });

    // create record in Airtable
    const resp = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: { Email: email, Zip: zip, OptIn: true } }),
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: data });
    return res.status(200).json({ ok: true, record: data });
  } catch (err) {
    console.error('subscribe err', err);
    return res.status(500).json({ error: err.message });
  }
}
