import { defineConfig, devices } from '@playwright/test';

// Run after npm run build: npx playwright test --config=playwright.home-startup.config.js
export default defineConfig({
  testDir: './tests',
  testMatch: 'home-startup.spec.js',
  workers: 1,
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4173', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run preview -- --port 4173', url: 'http://localhost:4173', reuseExistingServer: true },
});
