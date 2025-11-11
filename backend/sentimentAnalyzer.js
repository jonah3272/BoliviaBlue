import fetch from 'node-fetch';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SENTIMENT_TIMEOUT = 10000; // 10 seconds

/**
 * Analyze article sentiment using OpenAI GPT-4
 * Determines if the article indicates the USD is rising or falling against the Boliviano
 * @param {string} title - Article title
 * @param {string} summary - Article summary
 * @returns {Promise<string>} "up", "down", or "neutral"
 */
export async function analyzeSentimentAI(title, summary) {
  // If no API key, fall back to keyword analysis
  if (!OPENAI_API_KEY) {
    console.warn('No OPENAI_API_KEY found, using keyword-based sentiment');
    return analyzeSentimentKeywords(title, summary);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SENTIMENT_TIMEOUT);

    const systemPrompt = `You are a financial sentiment analyzer specializing in currency exchange rates for Bolivia. 
Your task is to determine if a news article indicates the US dollar (USD) is rising, falling, or neutral against the Bolivian Boliviano (BOB).

Context:
- "UP" means the dollar is STRENGTHENING (getting more expensive in bolivianos, or boliviano is WEAKENING)
- "DOWN" means the dollar is WEAKENING (getting cheaper in bolivianos, or boliviano is STRENGTHENING)
- "NEUTRAL" means no clear directional signal

Consider factors like:
- Exchange rate changes
- Economic policy
- Political stability
- Central bank actions
- Foreign reserves
- Inflation
- Market sentiment
- International relations

Respond with ONLY one word: UP, DOWN, or NEUTRAL`;

    const userPrompt = `Analyze this Bolivian news article:

Title: ${title}

Summary: ${summary || 'No summary available'}

What is the sentiment regarding the US dollar value against the Boliviano?`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast and cheap model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 10 // We only need one word
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const sentimentText = data.choices[0]?.message?.content?.trim().toLowerCase();

    // Map OpenAI response to our format
    if (sentimentText.includes('up')) {
      return 'up';
    } else if (sentimentText.includes('down')) {
      return 'down';
    } else {
      return 'neutral';
    }

  } catch (error) {
    console.warn('AI sentiment analysis failed, using keyword fallback:', error.message);
    return analyzeSentimentKeywords(title, summary);
  }
}

/**
 * Fallback keyword-based sentiment classifier
 * @param {string} title - Article title  
 * @param {string} summary - Article summary
 * @returns {string} "up", "down", or "neutral"
 */
function analyzeSentimentKeywords(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  // Keywords that suggest dollar strengthening (boliviano weakening)
  const upKeywords = [
    'sube', 'subió', 'incremento', 'aumenta', 'aumentó', 'alza', 'dispara', 
    'disparó', 'escasez', 'deprecia', 'depreció', 'devalua', 'devaluó', 
    'devaluación', 'crisis', 'inflacion', 'inflación', 'mercado paralelo',
    'dolar blue', 'blue sube', 'tipo de cambio sube', 'cotización alta',
    'dólar caro', 'demanda de dólares', 'falta de divisas'
  ];

  // Keywords that suggest dollar weakening (boliviano strengthening)
  const downKeywords = [
    'baja', 'bajó', 'disminuye', 'disminuyó', 'cae', 'cayó', 'desciende', 
    'descendió', 'estabiliza', 'estabilizó', 'controla', 'controló',
    'normaliza', 'normalizó', 'reservas suben', 'fortalece', 'fortaleció', 
    'recupera', 'recuperó', 'blue baja', 'tipo de cambio baja',
    'dólar barato', 'oferta de dólares'
  ];

  let upScore = 0;
  let downScore = 0;

  // Count keyword matches
  for (const keyword of upKeywords) {
    if (text.includes(keyword)) upScore++;
  }

  for (const keyword of downKeywords) {
    if (text.includes(keyword)) downScore++;
  }

  // Determine sentiment based on scores
  if (upScore > downScore) return 'up';
  if (downScore > upScore) return 'down';
  return 'neutral';
}

export default analyzeSentimentAI;

