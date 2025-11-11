# 🤖 AI Sentiment Analysis & News Enhancement Setup

## ✨ New Features

1. **Real AI-Powered Sentiment Analysis** - Uses OpenAI GPT-4o-mini to accurately determine if news indicates the dollar is rising or falling
2. **Twitter/X Integration** - Pulls real-time tweets about Bolivia economy and Rodrigo Paz
3. **10+ Bolivian News Sources** - Expanded RSS feeds for comprehensive coverage
4. **5-Minute News Refresh** - News updates every 5 minutes (rates every 15 minutes)
5. **Proper Category Tagging** - All news articles are automatically categorized

---

## 🔧 Setup Instructions

### 1. OpenAI API Key (for Sentiment Analysis)

**Why:** Provides accurate, nuanced sentiment analysis instead of simple keyword matching.

**How to get:**
1. Visit https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy your key (starts with `sk-...`)

**Add to Railway:**
```
OPENAI_API_KEY=sk-your-actual-key-here
```

**Cost:** ~$0.0002 per article (very cheap with gpt-4o-mini)

---

### 2. Twitter/X API Bearer Token (for Real-Time News)

**Why:** Get breaking news and real-time reactions from Bolivian journalists, economists, and government officials.

**How to get:**
1. Visit https://developer.twitter.com/en/portal/dashboard
2. Sign up for a Twitter Developer Account (free)
3. Create a new project and app
4. Go to your app's "Keys and tokens" section
5. Generate a "Bearer Token"
6. Copy your token

**Add to Railway:**
```
TWITTER_BEARER_TOKEN=your-bearer-token-here
```

**Free Tier Limits:**
- 500,000 tweets/month
- Our app uses ~500 tweets/day = 15,000/month
- Well within free limits!

---

### 3. Update Backend .env File

Add these lines to `backend/.env`:

```bash
# OpenAI API Key for real AI-powered sentiment analysis
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Twitter/X API Bearer Token for real-time news
TWITTER_BEARER_TOKEN=your-actual-twitter-bearer-token-here

# Expanded News Sources (already configured)
NEWS_SOURCES=https://eldeber.com.bo/rss,https://www.paginasiete.bo/rss,https://www.la-razon.com/rss,https://www.lostiempos.com/rss,https://www.opinion.com.bo/rss,https://eju.tv/feed/,https://www.boliviaentusmanos.com/rss,https://www.erbol.com.bo/rss,https://www.correodelsur.com/rss,https://www.eldiario.net/rss,https://www.cambio.bo/rss
```

---

### 4. Add Environment Variables to Railway

1. Go to your Railway project
2. Click on your backend service
3. Go to "Variables" tab
4. Add these new variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `TWITTER_BEARER_TOKEN`: Your Twitter bearer token
   - `NEWS_SOURCES`: (copy the full list from above)

5. Redeploy your backend

---

## 🎯 How Sentiment Analysis Works

### Old Method (Keyword-Based):
```
Article: "El dólar sube debido a la escasez"
Sentiment: UP (because keyword "sube" found)
```
❌ **Problem:** Can miss context, sarcasm, or complex economic analysis

### New Method (AI-Powered):
```
Article: "El dólar sube debido a la escasez de divisas en el mercado paralelo"
AI Analysis: 
- Understands "sube" means rising
- Recognizes "escasez de divisas" indicates shortage
- Knows "mercado paralelo" is informal market
- Considers economic context
Sentiment: UP ✅
```

```
Article: "Banco Mundial asegura que está con Bolivia; cooperará al Gobierno"
AI Analysis:
- Recognizes positive international support
- Understands World Bank cooperation
- May indicate future stability
Sentiment: NEUTRAL (no direct currency impact)✅
```

---

## 📊 New News Sources

We've added 5 more reputable Bolivian news sources:

1. **Bolivia en tus manos** - General news
2. **ERBOL** - Radio network, quick updates
3. **Correo del Sur** - Southern Bolivia perspective
4. **El Diario** - One of Bolivia's oldest newspapers
5. **Cambio** - Government news agency

Total: **11 RSS feeds** + **Twitter** = Fresh, comprehensive coverage

---

## 🔄 Refresh Intervals

- **Rates:** Every 15 minutes (Binance P2P + Official Rate)
- **News:** Every 5 minutes (RSS + Twitter)
- **Result:** Always fresh, always accurate!

---

## 🧪 Testing Without API Keys

If you don't add the API keys:
- **No OpenAI key?** Falls back to keyword-based sentiment (less accurate but functional)
- **No Twitter key?** Just uses RSS feeds (still gets news, but no Twitter)

The system is designed to work with or without these enhancements, but they significantly improve accuracy and freshness!

---

## 💰 Estimated Monthly Costs

- **OpenAI GPT-4o-mini:** 
  - ~100 articles/day × 30 days = 3,000 articles/month
  - Cost: ~$0.60/month
  
- **Twitter API:**
  - Free tier (500K tweets/month)
  - Our usage: ~15K tweets/month
  - Cost: $0/month

**Total: Less than $1/month for enterprise-grade sentiment analysis!** 🎉

---

## 🚀 Deployment Checklist

- [ ] Add `OPENAI_API_KEY` to Railway
- [ ] Add `TWITTER_BEARER_TOKEN` to Railway
- [ ] Update `NEWS_SOURCES` in Railway (if not already done)
- [ ] Redeploy backend
- [ ] Check Railway logs for successful news fetch
- [ ] Verify sentiment labels in frontend (UP/DOWN arrows)
- [ ] Verify Twitter articles appear (look for twitter.com source)

---

## 📝 Support

If you run into issues:
1. Check Railway logs for error messages
2. Verify API keys are correctly formatted
3. Ensure billing is enabled on OpenAI (they give $5 free credit)
4. Confirm Twitter app has "Read" permissions

Your articles should now have accurate, AI-powered sentiment analysis! 🎯

