import { defineConfig } from '@playwright/test';

// Tests route only already-built local files: no server or production API is used.
export default defineConfig({
  testDir: './tests',
  testMatch: 'payment-cost-embed.pw.js',
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {},
  },
});
