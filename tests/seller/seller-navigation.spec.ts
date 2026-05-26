import { test, expect } from "@playwright/test";
import { SELLER_STORAGE, ROUTES, TIMEOUTS } from "../fixtures/test-data";

/**
 * ====================================================================
 *  Module 5c: Seller Navigation — 5 Test Cases
 * ====================================================================
 *
 *  Black-box tests for the seller layout sidebar navigation.
 *  Pre-condition: Seller is logged in.
 */

test.describe("Seller Navigation", () => {
  test.use({ storageState: SELLER_STORAGE });

  test("SNAV-01: Sidebar navigation links hiển thị đầy đủ", async ({
    page,
  }) => {
    await page.goto(ROUTES.SELLER_DASHBOARD);
    await page.waitForLoadState("domcontentloaded");

    // Seller links from layout.tsx
    const expectedLinks = [
      { href: "/seller", label: /dashboard/i },
      { href: "/seller/products", label: /products/i },
      { href: "/seller/orders", label: /orders/i },
      { href: "/seller/refunds", label: /refunds/i },
      { href: "/seller/disputes", label: /disputes/i },
      { href: "/seller/promotions", label: /promotions/i },
    ];

    for (const { label } of expectedLinks) {
      const link = page.getByRole("link", { name: label }).first();
      await expect(link).toBeVisible();
    }
  });

  test("SNAV-02: Active link highlight đúng", async ({ page }) => {
    // Navigate to Products page
    await page.goto(ROUTES.SELLER_PRODUCTS);
    await page.waitForLoadState("domcontentloaded");

    // The "Products" link in sidebar should have active styling
    const productsLink = page
      .locator("aside")
      .getByRole("link", { name: /products/i });
    await expect(productsLink).toBeVisible();

    // Active link has bg-primary class
    await expect(productsLink).toHaveClass(/bg-primary/);

    // Dashboard link should NOT have active styling
    const dashboardLink = page
      .locator("aside")
      .getByRole("link", { name: /dashboard/i });
    await expect(dashboardLink).not.toHaveClass(/bg-primary/);
  });

  test("SNAV-03: Switch to Buyer navigation", async ({ page }) => {
    await page.goto(ROUTES.SELLER_DASHBOARD);
    await page.waitForLoadState("domcontentloaded");

    // Find "Switch to Buyer" link
    const switchLink = page.getByRole("link", { name: /switch to buyer/i });
    await expect(switchLink).toBeVisible();

    const href = await switchLink.getAttribute("href");
    expect(href).toContain("/account");

    // Click and verify navigation
    await switchLink.click();
    await page.waitForURL("**/account**", { timeout: TIMEOUTS.NAVIGATION });
    expect(page.url()).toContain("/account");
  });

  test("SNAV-04: Sign Out từ seller dashboard", async ({ page }) => {
    await page.goto(ROUTES.SELLER_DASHBOARD);
    await page.waitForLoadState("domcontentloaded");

    // Find Sign Out button
    const signOutBtn = page.getByRole("button", { name: /sign out/i });
    await expect(signOutBtn).toBeVisible();

    // Click sign out
    await signOutBtn.click();

    // Should redirect to homepage
    await page.waitForURL("/", { timeout: TIMEOUTS.NAVIGATION });
  });

  test("SNAV-05: Seller info hiển thị trong sidebar", async ({ page }) => {
    await page.goto(ROUTES.SELLER_DASHBOARD);
    await page.waitForLoadState("domcontentloaded");

    // Seller badge
    const sellerBadge = page.locator("aside").getByText("Seller");
    await expect(sellerBadge).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

    // Avatar section should be visible
    const avatarSection = page.locator("aside >> .flex.items-center.gap-3");
    await expect(avatarSection.first()).toBeVisible();

    // Personal links section
    await expect(
      page.locator("aside").getByRole("link", { name: /profile/i })
    ).toBeVisible();
    await expect(
      page.locator("aside").getByRole("link", { name: /settings/i })
    ).toBeVisible();
  });
});
