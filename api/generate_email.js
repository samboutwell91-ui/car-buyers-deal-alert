// api/generate_email.js (temporary debug version)
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { zip, incentives } = req.body || {};
    if (!zip || !incentives) return res.status(400).json({ error: 'zip + incentives required' });

    const prompt = `
You are an automotive deals reporter. Write an HTML email for "Car Buyers' Deal Alert" titled "Top 3 Incentives in ${zip}".
For each incentive (brand, model, type, amount, start, end, region_note) produce: <h3>{brand} {model}</h3> <p>Deal: {amount} — {type} ({start} to {end})</p> <p><em>Regional note: {region_note}</em></p> <p><strong>Insider Tip:</strong> one concise sentence.</p>
Keep total length ~180-220 words.
Incentives JSON:
${JSON.stringify(incentives, null, 2)}
    `;

    // DEBUG: log the prompt size & first 400 chars
    console.log('DEBUG_PROMPT_SNIPPET:', prompt.slice(0, 400));

    // Call OpenAI
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',          // we may change this if model errors appear
        messages: [
          { role: 'system', content: 'You are an expert newsletter writer producing concise automotive deal emails.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
      }),
    });

    const data = await resp.json();

    // DEBUG: log the full OpenAI response object (will appear in Vercel logs)
    console.log('DEBUG_OPENAI_RESPONSE_STATUS:', resp.status);
    console.log('DEBUG_OPENAI_RESPONSE:', JSON.stringify(data));

    const html = data?.choices?.[0]?.message?.content || '<p>Error generating content</p>';
    return res.status(200).json({ html });
  } catch (err) {
    console.error('generate_email error:', err);
    return res.status(500).json({ error: err.message || 'server error' });
  }
}
