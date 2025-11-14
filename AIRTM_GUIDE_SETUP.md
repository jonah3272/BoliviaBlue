# 📝 Airtm Guide Article - Setup Instructions

## ✅ **Article Created**

A comprehensive guide for foreigners (gringos) on how to send money to Bolivia using Airtm has been created.

## 📋 **What's Included**

### Article Content
- **Spanish Version**: `guia-airtm-enviar-dinero-bolivia-extranjeros`
- **English Version**: `airtm-guide-send-money-bolivia-foreigners`

### Topics Covered
1. Why use Airtm (advantages over Western Union, MoneyGram, etc.)
2. Requirements before starting
3. Step-by-step account creation (with referral link)
4. Identity verification (KYC)
5. Depositing money from bank/card/PayPal
6. Trading with Bolivians (finding exchangers, evaluating offers)
7. Safety tips
8. Comparison table (Airtm vs competitors)
9. Practical example ($500 USD transfer)
10. FAQ section
11. Next steps and resources

## 🔗 **Referral Link**

The article uses your Airtm referral link: `https://app.airtm.io/ivt/dasyl1sfs6fzr`

This has been added to `frontend/src/config/referrals.js` as `AIRTM_REFERRAL_LINK`.

## 📊 **Article Details**

- **Category**: Guide
- **Featured**: Yes
- **Read Time**: 12 minutes
- **Format**: HTML
- **Language**: Both Spanish and English

## 🚀 **How to Add to Supabase**

### Option 1: SQL Editor (Recommended)
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `backend/supabase-airtm-guide-article.sql`
4. Run the SQL script
5. Verify the articles appear in your `blog_articles` table

### Option 2: Supabase Dashboard
1. Go to Table Editor → `blog_articles`
2. Click "Insert row"
3. Fill in the fields manually using the SQL as reference

## ✅ **Social Sharing**

Social sharing is **already implemented** on all blog articles! The `SocialShare` component appears at the top of each article with:
- Twitter
- Facebook
- WhatsApp
- LinkedIn

No additional work needed for social sharing.

## 🔍 **Verification**

After adding to Supabase, verify:
1. Article appears in blog list at `/blog`
2. Article is accessible at `/blog/guia-airtm-enviar-dinero-bolivia-extranjeros` (Spanish)
3. Article is accessible at `/blog/airtm-guide-send-money-bolivia-foreigners` (English)
4. Social share buttons appear on the article page
5. Referral links work correctly

## 📝 **Next Steps**

1. Run the SQL script in Supabase
2. Test the article pages
3. Verify referral links work
4. Share the article to drive traffic!

---

**Note**: The article includes internal links to:
- `/bolivia-blue-rate-hoy` (check current rate)
- `/bolivia-blue-rate` (learn more)
- `/calculator` (calculate conversions)
- `/buy-dollars` (buy dollars guide)
- `/blog` (more articles)

All links are contextual and help with SEO internal linking! 🚀

