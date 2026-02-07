# AI Provider Comparison: OpenAI vs Kimi (Moonshot)

## Your current use: sentiment analysis

The app uses an LLM only for **article sentiment** (direction + strength). Each call is small: ~300–600 input tokens, ~20–50 output tokens (short JSON).

---

## Cost comparison (per 1M tokens)

| Provider | Model | Input | Output |
|----------|--------|--------|--------|
| **OpenAI** | gpt-4o-mini | $0.15 | **$0.60** |
| **Moonshot** | kimi-k2.5 | $0.60 ($0.10 cache hit) | $3.00 |
| **Moonshot** | kimi-k2-0905-preview | $0.60 ($0.15 cache) | $2.50 |
| **Moonshot** | moonshot-v1-8k | $0.20 | $2.00 |

For **many small requests** (lots of output tokens per article), cost is dominated by **output**.  
**gpt-4o-mini is cheaper** than all listed Kimi/Moonshot options for this workload.

Rough example for 1,000 articles/month (~500 input + 40 output tokens each):

- **OpenAI gpt-4o-mini:** ~\$0.08 input + ~\$0.02 output ≈ **\$0.10**
- **Kimi K2.5:** ~\$0.05 input + ~\$0.12 output ≈ **\$0.17**
- **moonshot-v1-8k:** ~\$0.10 input + ~\$0.08 output ≈ **\$0.18**

So **swapping to Kimi 2.5 would not be cheaper** for this use case; it would likely cost more.

---

## When Kimi might still make sense

- You want to **try Kimi for quality** (e.g. Spanish/BOB context).
- You already have **Moonshot credits** or prefer that vendor.
- You use **long context / caching** and care more about input cost (Kimi cache hit $0.10/1M vs OpenAI $0.15/1M); even then, output cost keeps gpt-4o-mini ahead for many short answers.

---

## How to use Kimi anyway (optional)

The backend can be configured to use **Moonshot’s OpenAI-compatible API** so you can switch with env vars and no code change to your app logic.

1. Get an API key: [Moonshot Open Platform](https://platform.moonshot.ai/).
2. Set in `.env`:
   - `MOONSHOT_API_KEY=your-moonshot-key`
   - `SENTIMENT_AI_PROVIDER=moonshot`
   - `SENTIMENT_AI_MODEL=kimi-k2-0905-preview` (or `kimi-k2.5`, etc.)
3. Leave `OPENAI_API_KEY` unset (or set it as fallback if you want).

If `SENTIMENT_AI_PROVIDER` is not set, the app keeps using OpenAI and `OPENAI_API_KEY` as it does today.

---

## Cost-saving with ChatGPT (same quality)

The sentiment analyzer is tuned to reduce cost while keeping the same output quality:

1. **Prompt caching**  
   The system prompt is static and long enough (≥1024 tokens) so OpenAI caches it. After the first request, cached input tokens are ~50% cheaper. Variable data (price context, accuracy context, article title/summary) is sent only in the user message. Optional `prompt_cache_retention: "24h"` keeps the cache for 24 hours.

2. **Structured output**  
   For `gpt-4o-mini`, the API uses `response_format` with a JSON schema (`direction`: UP/DOWN/NEUTRAL, `strength`: 0–100). This avoids parse failures and retries and keeps output tokens minimal.

3. **Batch API (optional)**  
   If you can accept delayed sentiment (e.g. process articles in batches every few hours), you can submit jobs to the [OpenAI Batch API](https://platform.openai.com/docs/guides/batch). Batch pricing is ~50% off. You would collect new articles, send a batch request, then write results back to the DB when the batch completes (webhook or polling). Not implemented in-app; consider it if volume grows.

---

## Summary

- **Cheaper for your current sentiment workload:** **OpenAI gpt-4o-mini** (stay as-is).
- **You can still swap to Kimi 2.5** for quality or preference; it just won’t be cheaper for this pattern.
- Optional **Moonshot/Kimi support** can be added via env so you can switch without changing code.
- **In-app savings:** static system prompt (caching) + structured JSON output; optional future use of Batch API for ~50% off if batching is acceptable.
