// api/fetch_incentives.js
// MVP: returns placeholder incentives. Replace with brand-specific scrapers/APIs over time.
export default async function handler(req, res) {
  try {
    const zip = req.query.zip;
    if (!zip) return res.status(400).json({ error: 'zip required' });

    // Placeholder results — swap this for per-OEM scraping or API calls later
    const results = [
      { brand: 'Ford', model: 'F-150', type: 'cash', amount: '$2,500', start: '2025-07-01', end: '2025-07-31', region_note: 'Strong in TX/OK' },
      { brand: 'Chevrolet', model: 'Silverado 1500', type: '0% APR', amount: '0% for 60 months', start: '2025-06-15', end: '2025-08-15', region_note: 'Good in IL/IN' },
      { brand: 'Toyota', model: 'RAV4', type: 'loyalty', amount: '$1,250', start: '2025-07-01', end: '2025-07-31', region_note: 'MI/OH' }
    ];

    return res.status(200).json({ zip, incentives: results });
  } catch (err) {
    console.error('fetch_incentives err', err);
    return res.status(500).json({ error: err.message });
  }
}
