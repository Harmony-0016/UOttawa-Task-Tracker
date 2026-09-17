export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body || {};
    
    if (data.feedUrl && typeof data.feedUrl === 'string' && data.feedUrl.startsWith('http')) {
      try {
        const feedRes = await fetch(data.feedUrl, {
          headers: {
             'User-Agent': 'uOttawa-Desktop-TaskSync/1.0',
          },
        });
        if (feedRes.ok) {
          const text = await feedRes.text();
          return res.status(200).json({
            success: true,
            rawIcs: text,
            source: 'brightspace_calendar_feed',
          });
        }
      } catch (feedErr) {
        console.warn('Direct feed fetch failed', feedErr);
      }
    }
    
    return res.status(200).json({
      success: true,
      source: 'uottawa_brightspace_portal',
      portalEndpoint: 'https://uottawa.brightspace.com/d2l/api/lp/1.43',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Exploration failed',
    });
  }
}
