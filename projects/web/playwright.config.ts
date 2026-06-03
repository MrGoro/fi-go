import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// slowMo delays every action — great for reviewable videos, but it also stretches
// the wall-clock time a test needs, so the per-test timeout has to grow with it.
const SLOW_MO = process.env.PW_SLOWMO ? Number(process.env.PW_SLOWMO) : 0;

// Run with `npm run e2e` from the repo root, which boots the Firebase emulators
// around this Playwright run (`firebase emulators:exec ...`).
export default defineConfig({
  testDir: './e2e',
  // Base 30s, plus generous per-action headroom whenever slowMo is active.
  timeout: 30_000 + SLOW_MO * 60,
  expect: { timeout: 10_000 + SLOW_MO * 2 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    // The app registers a PWA service worker in dev; block it so it can't cache
    // stale responses across tests.
    serviceWorkers: 'block',
    // Set PW_VIDEO=1 to capture a video of every run (handy for reviewing the
    // flow); otherwise videos/traces are only kept when a test fails.
    video: process.env.PW_VIDEO ? 'on' : 'retain-on-failure',
    trace: process.env.PW_VIDEO ? 'on' : 'on-first-retry',
    screenshot: 'only-on-failure',
    // PW_SLOWMO=500 slows every action by 500ms — useful for reviewable videos
    // or with --headed to watch the flow unfold in real time.
    launchOptions: {
      slowMo: SLOW_MO,
    },
  },
  // Two viewports so a single run validates (and, with PW_VIDEO, films) both the
  // desktop and the mobile layout. Both are Chromium-based — no extra browser
  // download needed in CI.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: `npm run dev -- --mode e2e --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
