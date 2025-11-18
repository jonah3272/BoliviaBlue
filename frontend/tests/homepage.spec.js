import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Bolivia Blue/i);
  });

  test('should display rate cards', async ({ page }) => {
    await page.goto('/');
    // Wait for rate cards to load
    await page.waitForSelector('[data-testid="rate-card"], .rate-card, h2, h3', { timeout: 10000 });
    // Check if page has content related to rates
    const content = await page.textContent('body');
    expect(content).toContain('Blue');
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    // Check for navigation links
    const navLinks = page.locator('nav a, header a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Key Pages', () => {
  test('Calculator page should load', async ({ page }) => {
    await page.goto('/calculator');
    await expect(page).toHaveTitle(/Calculator|Calculadora/i);
  });

  test('News page should load', async ({ page }) => {
    await page.goto('/news');
    await expect(page).toHaveTitle(/News|Noticias/i);
  });

  test('Bancos page should load', async ({ page }) => {
    await page.goto('/bancos');
    await expect(page).toHaveTitle(/Bancos|Banks/i);
  });
});



