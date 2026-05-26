import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for ShopNexus Black-Box Tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: [["html", { open: "never" }], ["list"]],

  /* Shared settings for all the projects below */
  use: {
    baseURL: process.env.BASE_URL || "https://shopnexus.hopto.org/",
    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    /* Video on first retry */
    video: "on-first-retry",
    /* Default timeout for actions */
    actionTimeout: 15_000,
    /* Default navigation timeout */
    navigationTimeout: 30_000,

    headless: false,
  },

  /* Global timeout per test */
  timeout: 60_000,

  projects: [
    /* ---- Auth setup (runs once, saves storage state) ---- */
    {
      name: "buyer-setup",
      testMatch: /auth\.setup\.ts/,
    },

    /* ---- Main test suite (Chromium) ---- */
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      dependencies: ["buyer-setup"],
    },
  ],
});
