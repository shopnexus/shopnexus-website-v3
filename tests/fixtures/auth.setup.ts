import { test as setup, expect } from "@playwright/test";
import { BUYER, SELLER, BUYER_STORAGE, SELLER_STORAGE } from "./test-data";

/**
 * Auth setup — runs once before the main test suite.
 * Saves browser storage state (cookies + localStorage) so that each
 * spec file can start already-authenticated.
 */

setup("authenticate as buyer", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });

  // Wait for the login form to be fully interactive
  const emailInput = page.locator("#id");
  await emailInput.waitFor({ state: "visible", timeout: 10_000 });

  // Fill login form — click first to ensure focus, then fill
  await emailInput.click();
  await emailInput.fill(BUYER.id);

  const passwordInput = page.locator("#password");
  await passwordInput.click();
  await passwordInput.fill(BUYER.password);

  await page.getByRole("button", { name: "Sign In" }).click();

  // Wait for redirect to homepage (successful login)
  await page.waitForURL("/", { timeout: 15_000 });

  // Save storage state
  await page.context().storageState({ path: BUYER_STORAGE });
});

setup("authenticate as seller", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });

  // Wait for the login form to be fully interactive
  const emailInput = page.locator("#id");
  await emailInput.waitFor({ state: "visible", timeout: 10_000 });

  // Fill login form — click first to ensure focus, then fill
  await emailInput.click();
  await emailInput.fill(SELLER.id);

  const passwordInput = page.locator("#password");
  await passwordInput.click();
  await passwordInput.fill(SELLER.password);

  await page.getByRole("button", { name: "Sign In" }).click();

  // Seller lands on "/" after login (same as buyer, unless admin)
  await page.waitForURL("/", { timeout: 15_000, waitUntil: "domcontentloaded" });

  // Save storage state
  await page.context().storageState({ path: SELLER_STORAGE });
});
