// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Boondock Edge – Playwright E2E Test Configuration
 *
 * React dev server runs on  http://localhost:3000
 * Flask backend runs on      http://localhost:5000
 *
 * Run all tests:          npm run test:e2e
 * Run with UI explorer:   npm run test:e2e:ui
 * Run headed (visible):   npm run test:e2e:headed
 * Show last HTML report:  npx playwright show-report
 */

module.exports = defineConfig({
  // All E2E tests live here
  testDir: './e2e',

  // Stop after first failure in CI; run all locally
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Rich HTML report saved to playwright-report/
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    // Your React dev server
    baseURL: 'http://localhost:3000',

    // Record traces on first retry – open with: npx playwright show-trace trace.zip
    trace: 'on-first-retry',

    // Auto-screenshot on test failure
    screenshot: 'only-on-failure',

    // Record video on first retry
    video: 'on-first-retry',

    // How long to wait for each action (click, fill, etc.)
    actionTimeout: 10_000,

    // How long to wait for navigations
    navigationTimeout: 15_000,
  },

  projects: [
    // Primary: Chrome (headless by default)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Optional: uncomment to add Firefox / Safari / mobile
    // { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',   use: { ...devices['Desktop Safari']  } },
    // { name: 'mobile',   use: { ...devices['Pixel 5']         } },
  ],

  // Automatically start the React dev server before tests (if not already running)
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,   // reuse running dev server; set false to always restart
    timeout: 120_000,
  },
});
