import fetch from 'node-fetch';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SENTIMENT_TIMEOUT = 10000; // 10 seconds

// Log environment variable status on module load
if (OPENAI_API_KEY) {
  console.log(`✅ OPENAI_API_KEY is set (length: ${OPENAI_API_KEY.length} chars, starts with: ${OPENAI_API_KEY.substring(0, 7)}...)`);
} else {
  console.warn('⚠️ OPENAI_API_KEY is NOT set in environment variables');
  console.warn('⚠️ Available env vars:', Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('API')));
}

/**
 * Analyze article sentiment using OpenAI GPT-4
 * Determines if the article indicates the USD is rising or falling against the Boliviano
 * @param {string} title - Article title
 * @param {string} summary - Article summary
 * @returns {Promise<string>} "up", "down", or "neutral"
 */
export async function analyzeSentimentAI(title, summary) {
  // Re-check API key at runtime (in case env vars changed)
  const apiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
  
  // If no API key, fall back to keyword analysis
  if (!apiKey || apiKey.trim() === '') {
    console.warn('⚠️ No OPENAI_API_KEY found at runtime, using keyword-based sentiment fallback');
    return analyzeSentimentKeywords(title, summary);
  }
  
  console.log('✅ Using OpenAI GPT-4o-mini for sentiment analysis');

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

    // Model selection: gpt-4o-mini is optimal for sentiment analysis
    // Alternatives:
    // - 'gpt-4o': More accurate but ~10x more expensive ($2.50 vs $0.15 per 1M input tokens)
    // - 'gpt-3.5-turbo': Cheaper but less accurate for nuanced financial sentiment
    // - 'o1-mini': Better reasoning but slower and more expensive
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
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
 * Fallback keyword-based sentiment classifier (MORE AGGRESSIVE - LESS NEUTRAL)
 * @param {string} title - Article title  
 * @param {string} summary - Article summary
 * @returns {string} "up", "down", or "neutral"
 */
function analyzeSentimentKeywords(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  // Keywords that suggest dollar strengthening (boliviano weakening) - EXPANDED
  const upKeywords = [
    // Direct price movement
    'sube', 'subió', 'incremento', 'incrementó', 'aumenta', 'aumentó',
    'alza', 'dispara', 'disparó', 'trepa', 'trepó', 'escala', 'escaló',
    
    // Currency weakness
    'deprecia', 'depreció', 'devalua', 'devaluó', 'devaluacion', 'devaluación',
    'debil', 'débil', 'debilita', 'debilitó', 'cae boliviano', 'pierde valor',
    
    // Economic issues
    'escasez', 'crisis', 'inflacion', 'inflación', 'deficit', 'déficit',
    'falta de dolares', 'falta de dólares', 'sin dolares', 'sin dólares',
    'paralelo', 'blue', 'mercado negro', 'tipo de cambio sube',
    'dólar caro', 'cotización alta', 'demanda de dólares', 'falta de divisas',
    
    // Reserve problems
    'caen reservas', 'bajan reservas', 'reservas bajas', 'sin reservas',
    'perdida de reservas', 'pérdida de reservas',
    
    // Market behavior
    'buscan dolares', 'buscan dólares', 'compran dolares', 'compran dólares',
    'presion cambiaria', 'presión cambiaria', 'nerviosismo', 'incertidumbre'
  ];

  // Keywords that suggest dollar weakening (boliviano strengthening) - EXPANDED
  const downKeywords = [
    // Direct price movement
    'baja', 'bajó', 'disminuye', 'disminuyó', 'cae', 'cayó', 'cae dolar', 'cae dólar',
    'desciende', 'descendió', 'retrocede', 'retrocedió', 'blue baja', 'tipo de cambio baja',
    'dólar barato',
    
    // Currency strength
    'fortalece', 'fortaleció', 'recupera', 'recuperó', 'sube boliviano',
    'boliviano fuerte', 'gana valor',
    
    // Economic stability
    'estabiliza', 'estabilizó', 'controla', 'controló', 'normaliza', 'normalizó',
    'tranquilidad', 'calma cambiaria',
    
    // Reserve improvements
    'suben reservas', 'reservas suben', 'aumentan reservas', 'crecen reservas',
    'inyecta dolares', 'inyecta dólares', 'oferta de dólares',
    
    // Central bank actions
    'bcb inyecta', 'banco central interviene', 'intervencion', 'intervención',
    'vende dolares', 'vende dólares', 'provisión de divisas'
  ];

  let upScore = 0;
  let downScore = 0;

  // Count keyword matches with weighted scoring
  for (const keyword of upKeywords) {
    if (text.includes(keyword)) {
      upScore++;
      // Weight critical keywords more heavily
      if (['crisis', 'escasez', 'devaluacion', 'devaluación', 'paralelo', 'blue'].some(k => keyword.includes(k))) {
        upScore += 0.5;
      }
    }
  }

  for (const keyword of downKeywords) {
    if (text.includes(keyword)) {
      downScore++;
      // Weight central bank actions more heavily
      if (['bcb', 'banco central', 'inyecta', 'intervencion', 'intervención'].some(k => keyword.includes(k))) {
        downScore += 0.5;
      }
    }
  }

  // Be more aggressive - if we have ANY signal, use it (less neutral)
  if (upScore > 0 && downScore === 0) return 'up';
  if (downScore > 0 && upScore === 0) return 'down';
  if (upScore > downScore) return 'up';
  if (downScore > upScore) return 'down';
  
  // Only return neutral if there's truly no economic signal
  return 'neutral';
}

export default analyzeSentimentAI;

