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
 * Returns both direction and strength (0-100) indicating how impactful the article is
 * @param {string} title - Article title
 * @param {string} summary - Article summary
 * @returns {Promise<{direction: string, strength: number}>} Object with direction ("up", "down", "neutral") and strength (0-100)
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
Your task is to determine if a news article indicates the US dollar (USD) is rising, falling, or neutral against the Bolivian Boliviano (BOB), AND how strong/impactful this signal is.

Context:
- "UP" means the dollar is STRENGTHENING (getting more expensive in bolivianos, or boliviano is WEAKENING)
- "DOWN" means the dollar is WEAKENING (getting cheaper in bolivianos, or boliviano is STRENGTHENING)
- "NEUTRAL" means no clear directional signal

Strength (0-100):
- 0-30: Weak signal (minor mention, indirect impact, speculative)
- 31-60: Moderate signal (clear mention, some impact expected)
- 61-80: Strong signal (significant news, major impact expected)
- 81-100: Very strong signal (crisis, major policy change, extreme market conditions)

Consider factors like:
- Exchange rate changes (direct mentions = higher strength)
- Economic policy (major announcements = higher strength)
- Political stability (crises = higher strength)
- Central bank actions (interventions = higher strength)
- Foreign reserves (major changes = higher strength)
- Inflation (extreme inflation = higher strength)
- Market sentiment (panic/fear = higher strength)
- International relations (major events = higher strength)

Respond with ONLY a JSON object in this exact format:
{"direction": "UP" or "DOWN" or "NEUTRAL", "strength": 0-100}`;

    const userPrompt = `Analyze this Bolivian news article:

Title: ${title}

Summary: ${summary || 'No summary available'}

What is the sentiment regarding the US dollar value against the Boliviano? Provide direction and strength (0-100).`;

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
        max_tokens: 50 // Need more tokens for JSON response
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content?.trim();
    
    // Try to parse JSON response
    try {
      // Extract JSON from response (might have markdown code blocks)
      let jsonText = responseText;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const parsed = JSON.parse(jsonText);
      const direction = parsed.direction?.toLowerCase() || 'neutral';
      let strength = parseInt(parsed.strength) || 50;
      
      // Validate and clamp strength
      strength = Math.max(0, Math.min(100, strength));
      
      // If neutral, strength should be 0
      if (direction === 'neutral') {
        strength = 0;
      }
      
      return {
        direction: direction === 'up' ? 'up' : (direction === 'down' ? 'down' : 'neutral'),
        strength: strength
      };
    } catch (parseError) {
      // Fallback: try to extract direction from text
      const lowerText = responseText.toLowerCase();
      let direction = 'neutral';
      let strength = 50; // Default moderate strength
      
      if (lowerText.includes('up')) {
        direction = 'up';
        // Try to extract strength from text if mentioned
        const strengthMatch = responseText.match(/strength[:\s]*(\d+)/i) || responseText.match(/(\d+)/);
        if (strengthMatch) {
          strength = Math.max(0, Math.min(100, parseInt(strengthMatch[1])));
        }
      } else if (lowerText.includes('down')) {
        direction = 'down';
        const strengthMatch = responseText.match(/strength[:\s]*(\d+)/i) || responseText.match(/(\d+)/);
        if (strengthMatch) {
          strength = Math.max(0, Math.min(100, parseInt(strengthMatch[1])));
        }
      }
      
      return { direction, strength };
    }

  } catch (error) {
    console.warn('AI sentiment analysis failed, using keyword fallback:', error.message);
    return analyzeSentimentKeywords(title, summary);
  }
}

/**
 * Fallback keyword-based sentiment classifier (MORE AGGRESSIVE - LESS NEUTRAL)
 * Returns both direction and strength based on keyword intensity
 * @param {string} title - Article title  
 * @param {string} summary - Article summary
 * @returns {{direction: string, strength: number}} Object with direction ("up", "down", "neutral") and strength (0-100)
 */
export function analyzeSentimentKeywords(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  // Keywords that suggest dollar strengthening (boliviano weakening) - EXPANDED
  // Format: [keyword, baseStrength, isCritical]
  const upKeywords = [
    // Direct price movement (moderate strength)
    ['sube', 40, false], ['subió', 40, false], ['incremento', 35, false], ['incrementó', 35, false],
    ['aumenta', 40, false], ['aumentó', 40, false], ['alza', 45, false], ['dispara', 60, true],
    ['disparó', 60, true], ['trepa', 50, false], ['trepó', 50, false], ['escala', 45, false], ['escaló', 45, false],
    
    // Currency weakness (strong signal)
    ['deprecia', 55, false], ['depreció', 55, false], ['devalua', 70, true], ['devaluó', 70, true],
    ['devaluacion', 70, true], ['devaluación', 70, true], ['debil', 40, false], ['débil', 40, false],
    ['debilita', 45, false], ['debilitó', 45, false], ['cae boliviano', 50, false], ['pierde valor', 45, false],
    
    // Economic issues (very strong signal)
    ['escasez', 65, true], ['crisis', 80, true], ['inflacion', 60, true], ['inflación', 60, true],
    ['deficit', 55, false], ['déficit', 55, false], ['falta de dolares', 70, true], ['falta de dólares', 70, true],
    ['sin dolares', 65, true], ['sin dólares', 65, true], ['paralelo', 50, true], ['blue', 50, true],
    ['mercado negro', 55, false], ['tipo de cambio sube', 45, false], ['dólar caro', 40, false],
    ['cotización alta', 40, false], ['demanda de dólares', 50, false], ['falta de divisas', 65, true],
    
    // Reserve problems (strong signal)
    ['caen reservas', 70, true], ['bajan reservas', 70, true], ['reservas bajas', 60, false],
    ['sin reservas', 75, true], ['perdida de reservas', 70, true], ['pérdida de reservas', 70, true],
    
    // Market behavior (moderate signal)
    ['buscan dolares', 45, false], ['buscan dólares', 45, false], ['compran dolares', 40, false],
    ['compran dólares', 40, false], ['presion cambiaria', 55, false], ['presión cambiaria', 55, false],
    ['nerviosismo', 50, false], ['incertidumbre', 45, false]
  ];

  // Keywords that suggest dollar weakening (boliviano strengthening) - EXPANDED
  const downKeywords = [
    // Direct price movement (moderate strength)
    ['baja', 40, false], ['bajó', 40, false], ['disminuye', 35, false], ['disminuyó', 35, false],
    ['cae', 40, false], ['cayó', 40, false], ['cae dolar', 45, false], ['cae dólar', 45, false],
    ['desciende', 40, false], ['descendió', 40, false], ['retrocede', 40, false], ['retrocedió', 40, false],
    ['blue baja', 50, true], ['tipo de cambio baja', 45, false], ['dólar barato', 35, false],
    
    // Currency strength (moderate-strong signal)
    ['fortalece', 50, false], ['fortaleció', 50, false], ['recupera', 45, false], ['recuperó', 45, false],
    ['sube boliviano', 50, false], ['boliviano fuerte', 45, false], ['gana valor', 40, false],
    
    // Economic stability (moderate signal)
    ['estabiliza', 40, false], ['estabilizó', 40, false], ['controla', 45, false], ['controló', 45, false],
    ['normaliza', 40, false], ['normalizó', 40, false], ['tranquilidad', 30, false], ['calma cambiaria', 35, false],
    
    // Reserve improvements (strong signal)
    ['suben reservas', 60, false], ['reservas suben', 60, false], ['aumentan reservas', 60, false],
    ['crecen reservas', 60, false], ['inyecta dolares', 65, true], ['inyecta dólares', 65, true],
    ['oferta de dólares', 50, false],
    
    // Central bank actions (very strong signal)
    ['bcb inyecta', 75, true], ['banco central interviene', 80, true], ['intervencion', 70, true],
    ['intervención', 70, true], ['vende dolares', 65, true], ['vende dólares', 65, true],
    ['provisión de divisas', 60, false]
  ];

  let upMaxStrength = 0;
  let downMaxStrength = 0;
  let upKeywordCount = 0;
  let downKeywordCount = 0;

  // Find maximum strength and count matches
  for (const [keyword, baseStrength, isCritical] of upKeywords) {
    if (text.includes(keyword)) {
      upKeywordCount++;
      // Critical keywords get +20 bonus, otherwise use base strength
      const strength = isCritical ? Math.min(100, baseStrength + 20) : baseStrength;
      upMaxStrength = Math.max(upMaxStrength, strength);
    }
  }

  for (const [keyword, baseStrength, isCritical] of downKeywords) {
    if (text.includes(keyword)) {
      downKeywordCount++;
      const strength = isCritical ? Math.min(100, baseStrength + 20) : baseStrength;
      downMaxStrength = Math.max(downMaxStrength, strength);
    }
  }

  // Calculate final strength: base on max keyword strength, boosted by multiple matches
  // Multiple keywords indicate stronger signal
  const upFinalStrength = upMaxStrength > 0 
    ? Math.min(100, upMaxStrength + (upKeywordCount - 1) * 5)
    : 0;
  const downFinalStrength = downMaxStrength > 0
    ? Math.min(100, downMaxStrength + (downKeywordCount - 1) * 5)
    : 0;

  // Determine direction and strength
  if (upFinalStrength > 0 && downFinalStrength === 0) {
    return { direction: 'up', strength: upFinalStrength };
  }
  if (downFinalStrength > 0 && upFinalStrength === 0) {
    return { direction: 'down', strength: downFinalStrength };
  }
  if (upFinalStrength > downFinalStrength) {
    // If both present, use the stronger one but reduce strength slightly
    return { direction: 'up', strength: Math.max(30, upFinalStrength - 10) };
  }
  if (downFinalStrength > upFinalStrength) {
    return { direction: 'down', strength: Math.max(30, downFinalStrength - 10) };
  }
  
  // Only return neutral if there's truly no economic signal
  return { direction: 'neutral', strength: 0 };
}

export default analyzeSentimentAI;

