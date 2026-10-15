import { test, expect } from '@playwright/test';
import { articlesEs, articlesEn } from '../src/data/blogArticles.js';
import { BLOG_TRANSLATIONS, blogLocalePaths } from '../src/utils/blogLocale.js';

// Run against the local app only, with VITE_SUPABASE_URL=https://example.supabase.co
// and VITE_SUPABASE_ANON_KEY=public-test-placeholder. All external requests are mocked.
test.beforeEach(async ({ page, baseURL }) => {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === new URL(baseURL).origin) return route.continue();
    if (url.hostname === 'example.supabase.co' && url.pathname === '/rest/v1/blog_articles') {
      const language = url.searchParams.get('language')?.replace(/^eq\./, '') || 'es';
      const all = (language === 'en' ? articlesEn : articlesEs).map(article => ({ ...article, language }));
      const slug = url.searchParams.get('slug')?.replace(/^eq\./, '');
      const article = all.find(item => item.slug === slug);
      return route.fulfill({ status: slug && !article ? 406 : 200, contentType: 'application/json', body: JSON.stringify(slug ? article || { code: 'PGRST116', message: 'No row found' } : all) });
    }
    return route.abort();
  });
});

async function checkArticle(page, pair, language) {
  const article = (language === 'en' ? articlesEn : articlesEs).find(item => item.slug === pair[language]);
  await expect(page.getByRole('heading', { level: 1, name: article.title })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', language);
  const paths = blogLocalePaths(pair[language]);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.boliviablue.com' + paths[language]);
  for (const [locale, path] of Object.entries({ ...paths, 'x-default': paths.es })) {
    await expect(page.locator(`link[hreflang="${locale}"]`)).toHaveAttribute('href', 'https://www.boliviablue.com' + path);
  }
}

for (const language of ['es', 'en']) for (const pair of BLOG_TRANSLATIONS) {
  test(`${language}: direct ${pair[language]}, repeated toggles and Back/Forward`, async ({ page }) => {
    await page.addInitScript(language => localStorage.setItem('language', language === 'en' ? 'es' : 'en'), language);
    await page.goto(`/blog/${pair[language]}?utm_source=qa#sources`);
    await checkArticle(page, pair, language);
    for (const target of [language === 'en' ? 'es' : 'en', language]) {
      await page.getByRole('button', { name: 'Toggle language' }).click();
      await checkArticle(page, pair, target);
      const url = new URL(page.url());
      expect(url.pathname).toBe(`/blog/${pair[target]}`);
      expect(url.searchParams.get('utm_source')).toBe('qa');
      expect(url.hash).toBe('#sources');
      expect(url.searchParams.get('lang')).toBe(target === 'en' ? 'en' : null);
    }
    await page.goBack(); await checkArticle(page, pair, language === 'en' ? 'es' : 'en');
    await page.goForward(); await checkArticle(page, pair, language);
  });
}

const luminance = color => {
  const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};
const contrast = (first, second) => (Math.max(luminance(first), luminance(second)) + 0.05) / (Math.min(luminance(first), luminance(second)) + 0.05);

for (const language of ['es', 'en']) for (const theme of ['light', 'dark']) {
  test(`${language}/${theme}: USDT next-step contrast at desktop and narrow widths`, async ({ page }, testInfo) => {
    await page.addInitScript(theme => localStorage.setItem('theme', theme), theme);
    await page.goto(`/blog/${BLOG_TRANSLATIONS[1][language]}`);
    await checkArticle(page, BLOG_TRANSLATIONS[1], language);
    const callout = page.locator('.blog-content div[style*="background: #ECFDF5"]');
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await callout.scrollIntoViewIfNeeded();
      const styles = await callout.evaluate(node => ({ background: getComputedStyle(node).backgroundColor, colors: ['p', 'strong', 'a'].map(selector => getComputedStyle(node.querySelector(selector)).color) }));
      for (const color of styles.colors) expect(contrast(styles.background, color)).toBeGreaterThanOrEqual(4.5);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await testInfo.attach(`${language}-${theme}-${width}`, { body: await callout.screenshot(), contentType: 'image/png' });
    }
  });
}

test('unknown guide stays missing and noindexed', async ({ page }) => {
  await page.goto('/blog/not-a-published-guide?lang=en');
  await expect(page.getByRole('heading', { name: 'Article not found' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
});
