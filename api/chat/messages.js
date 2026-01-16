// Vercel serverless function to proxy POST requests to Railway
// This handles POST requests that Vercel rewrites might not forward correctly

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const railwayUrl = 'https://boliviablue-production.up.railway.app/api/chat/messages';
  
  console.log('[Vercel Proxy] Proxying POST to Railway:', {
    url: railwayUrl,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'cookie': req.headers.cookie ? 'present' : 'missing',
      'origin': req.headers.origin
    }
  });

  try {
    // Forward the request to Railway
    const response = await fetch(railwayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie || '',
        'Origin': req.headers.origin || '',
        'User-Agent': req.headers['user-agent'] || ''
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    console.log('[Vercel Proxy] Railway response:', {
      status: response.status,
      ok: response.ok
    });

    // Forward the response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Vercel Proxy] Error:', error);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to connect to backend server'
    });
  }
}
