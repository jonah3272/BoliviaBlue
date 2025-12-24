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
 * @param {Object} priceData - Optional price change data from last 6 hours
 * @returns {Promise<{direction: string, strength: number}>} Object with direction ("up", "down", "neutral") and strength (0-100)
 */
export async function analyzeSentimentAI(title, summary, priceData = null) {
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

    // Build price context string if price data is available
    let priceContext = '';
    if (priceData) {
      const { priceChange6h, priceChange24h, trend6h, trend24h, volatility, currentPrice, price6hAgo, price24hAgo } = priceData;
      const changeDirection6h = priceChange6h > 0 ? 'increased' : priceChange6h < 0 ? 'decreased' : 'remained stable';
      const changeDirection24h = priceChange24h !== null 
        ? (priceChange24h > 0 ? 'increased' : priceChange24h < 0 ? 'decreased' : 'remained stable')
        : 'unknown';
      const volatilityLevel = volatility > 0.5 ? 'high volatility' : volatility > 0.2 ? 'moderate volatility' : 'low volatility';
      
      // Determine if there's a significant price movement that should influence sentiment
      const significant6hMove = Math.abs(priceChange6h) > 0.5; // >0.5% in 6h is significant
      const significant24hMove = priceChange24h !== null && Math.abs(priceChange24h) > 1.0; // >1% in 24h is significant
      
      priceContext = `

MARKET CONTEXT - USE FOR PREDICTIVE ANALYSIS (NOT REACTIVE VALIDATION):
Recent Price Movements:
- Last 6 Hours: ${priceChange6h > 0 ? '+' : ''}${priceChange6h}% (${changeDirection6h}, ${trend6h} trend)
${priceChange24h !== null ? `- Last 24 Hours: ${priceChange24h > 0 ? '+' : ''}${priceChange24h}% (${changeDirection24h}, ${trend24h} trend)` : ''}
- Volatility: ${volatilityLevel} (${volatility}%)
- Current price: ${currentPrice} BOB/USD

PREDICTIVE ANALYSIS GUIDELINES:
Your goal is to PREDICT FUTURE price movements based on the news, not validate against current prices.

1. NEW INFORMATION vs ALREADY REFLECTED:
   - If the news is NEW (just announced, breaking news, future events), it can predict FUTURE price movements even if it contradicts current trends
   - If the news is OLD (already known, historical data), it may already be reflected in current prices - reduce strength accordingly
   - Strong NEW news can predict REVERSALS or ACCELERATIONS of current trends

2. PREDICTIVE SIGNALS:
   - Policy announcements → Predict future impact (often 1-7 days ahead)
   - Crisis/breaking news → Predict immediate future impact (hours to days)
   - Economic data releases → Predict market reaction (often immediate to 1-2 days)
   - Central bank actions → Predict medium-term impact (days to weeks)

3. TREND CONTINUATION vs REVERSAL:
   - If news STRENGTHENS an existing trend → May predict ACCELERATION (increase strength)
   - If news CONTRADICTS an existing trend → May predict REVERSAL (assess if news is strong enough)
   - Very strong news (>70 strength) can predict reversals even during significant price movements

4. TIME HORIZON:
   - Focus on what the news will cause in the NEXT 1-7 DAYS, not what it already caused
   - Current prices may not yet reflect the full impact of recent news
   - News can predict price movements that haven't happened yet

${significant24hMove ? `Note: There's been a ${priceChange24h > 0 ? 'significant rise' : 'significant drop'} (${priceChange24h > 0 ? '+' : ''}${priceChange24h}%) recently. Consider: Is this news NEW information that could change the trend, or is it already reflected? If it's new and strong, it can still predict future movements.` : ''}`;
    }

    const systemPrompt = `You are a PREDICTIVE financial sentiment analyzer specializing in currency exchange rates for Bolivia. 
Your task is to PREDICT if a news article indicates the US dollar (USD) will RISE or FALL in the FUTURE (next 1-7 days) against the Bolivian Boliviano (BOB), AND how strong/impactful this predictive signal is.

IMPORTANT: You are predicting FUTURE price movements, not describing current prices. Focus on what the news WILL cause, not what it already caused.

Context:
- "UP" means the dollar will STRENGTHEN in the future (will get more expensive in bolivianos, or boliviano will WEAKEN)
- "DOWN" means the dollar will WEAKEN in the future (will get cheaper in bolivianos, or boliviano will STRENGTHEN)
- "NEUTRAL" means no clear predictive signal for future movement

Strength (0-100) - Based on PREDICTIVE IMPACT:
- 0-30: Weak predictive signal (minor mention, indirect future impact, speculative)
- 31-60: Moderate predictive signal (clear mention, some future impact expected in 1-3 days)
- 61-80: Strong predictive signal (significant news, major future impact expected in hours to days)
- 81-100: Very strong predictive signal (crisis, major policy change, extreme conditions - predicts immediate to near-term impact)

Consider PREDICTIVE factors:
- NEW policy announcements → Predict future market reaction (higher strength for new info)
- Breaking news/crises → Predict immediate future impact (hours to days)
- Economic data releases → Predict market reaction (often immediate)
- Central bank actions → Predict medium-term impact (days to weeks)
- Political events → Predict market sentiment changes
- Foreign reserves changes → Predict future market pressure
- Inflation news → Predict future currency pressure
- International relations → Predict future economic impact
${priceContext ? '- Use recent price movements to understand context, but focus on predicting FUTURE movements based on news' : ''}

PREDICTIVE THINKING:
- Ask: "What will this news cause in the NEXT 1-7 DAYS?"
- Strong new news can predict REVERSALS even if current trend is opposite
- News that confirms a trend may predict ACCELERATION
- Historical/old news may already be reflected - reduce strength

Respond with ONLY a JSON object in this exact format:
{"direction": "UP" or "DOWN" or "NEUTRAL", "strength": 0-100}`;

    const userPrompt = `Analyze this Bolivian news article and PREDICT its impact on FUTURE dollar prices:

Title: ${title}

Summary: ${summary || 'No summary available'}${priceContext}

Based on this news, what will happen to the US dollar value against the Boliviano in the NEXT 1-7 DAYS? 
- Is this NEW information that will affect future prices?
- Will this cause the dollar to RISE (UP) or FALL (DOWN) in the future?
- How strong is this predictive signal (0-100)?

Focus on PREDICTING future movements, not describing current prices.`;

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
      let direction = parsed.direction?.toLowerCase() || 'neutral';
      let strength = parseInt(parsed.strength) || 50;
      
      // Validate and clamp strength
      strength = Math.max(0, Math.min(100, strength));
      
      // If neutral, strength should be 0
      if (direction === 'neutral') {
        strength = 0;
      }
      
      // POST-PROCESSING: Light validation for extreme contradictions only
      // Since we're now focusing on PREDICTIVE analysis, we only adjust for extreme cases
      // Strong news can predict reversals, so we're much less restrictive
      if (priceData && direction !== 'neutral' && strength > 0) {
        const { priceChange24h, priceChange6h } = priceData;
        
        // Only apply corrections for EXTREME contradictions (>5% moves) AND weak sentiment
        // Strong sentiment (>70) can predict reversals, so we allow it
        if (priceChange24h !== null && Math.abs(priceChange24h) > 5.0) {
          const isPriceDown = priceChange24h < -5.0;
          const isPriceUp = priceChange24h > 5.0;
          const sentimentUp = direction === 'up';
          const sentimentDown = direction === 'down';
          
          // Only adjust if sentiment is WEAK (<50) - strong sentiment can predict reversals
          if (strength < 50) {
            // Extreme move (>5%) with weak sentiment - likely already reflected
            if ((isPriceDown && sentimentUp) || (isPriceUp && sentimentDown)) {
              // Reduce strength by 30-40% for weak contradictory signals
              strength = Math.max(5, Math.floor(strength * 0.65));
              console.log(`ℹ️ Predictive adjustment: Extreme price move (${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%) with weak sentiment (${parsed.strength}). Reduced to ${strength} to account for potential market reflection.`);
            }
          } else {
            // Strong sentiment (>50) - allow it to predict reversals even during extreme moves
            console.log(`✅ Allowing strong predictive signal (strength ${strength}) despite extreme price move (${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%) - news may predict reversal.`);
          }
        }
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

