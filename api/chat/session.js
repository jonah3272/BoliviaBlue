// Vercel serverless function to proxy session requests to Railway

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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const railwayUrl = 'https://boliviablue-production.up.railway.app/api/chat/session';
  
  try {
    const response = await fetch(railwayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie || '',
        'Origin': req.headers.origin || ''
      },
      body: JSON.stringify(req.body || {})
    });

    const data = await response.json();
    
    // Forward cookies from Railway response
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Vercel Proxy] Session error:', error);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to connect to backend server'
    });
  }
}
