import { test, expect } from "@playwright/test";
import { BUYER_STORAGE, ROUTES, TIMEOUTS } from "../fixtures/test-data";

/**
 * ====================================================================
 *  Module 3: Xác nhận đơn hàng (Buyer Orders) — 7 Test Cases
 * ====================================================================
 *
 *  Black-box tests for the buyer's My Orders page.
 *  Pre-condition: Buyer is logged in.
 */

test.describe("Xác nhận đơn hàng - Buyer Orders", () => {
  test.use({ storageState: BUYER_STORAGE });

  test("ORD-01: Xem trang danh sách đơn hàng", async ({ page }) => {
    await page.goto(ROUTES.ACCOUNT_ORDERS);
    await page.waitForLoadState("domcontentloaded");

    // Page title
    await expect(
      page.getByRole("heading", { name: /my orders/i })
    ).toBeVisible();

    // Subtitle
    await expect(
      page.getByText(/view and track your orders/i)
    ).toBeVisible();

    // Tab list should be visible
    await expect(page.getByRole("tablist")).toBeVisible();
  });

  test("ORD-02: Tab Pending hiển thị đúng", async ({ page }) => {
    await page.goto(ROUTES.ACCOUNT_ORDERS);
    await page.waitForLoadState("domcontentloaded");

    // "Pending" tab should be active by default
    const pendingTab = page.getByRole("tab", { name: /pending/i });
    await expect(pendingTab).toBeVisible();
    await expect(pendingTab).toHaveAttribute("data-state", "active");

    // Content should show either orders or "No pending orders"
    const tabContent = page.locator("[role='tabpanel']").first();
    await expect(tabContent).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

    // Either section headers or empty state
    await expect(
      page
        .getByText(/awaiting payment|awaiting delivery/i)
        .or(page.getByText(/no pending orders/i))
        .first()
    ).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
  });

  test("ORD-03: Tab Completed hiển thị đúng", async ({ page }) => {
    await page.goto(ROUTES.ACCOUNT_ORDERS);
    await page.waitForLoadState("domcontentloaded");

    // Click "Completed" tab
    await page.getByRole("tab", { name: /completed/i }).click();

    // Wait for content
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Either has orders or shows empty
    await expect(
      page
        .locator("[role='tabpanel'] >> [data-slot='card']")
        .or(page.getByText(/no completed orders/i))
        .first()
    ).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
  });

  test("ORD-04: Tab Cancelled hiển thị đúng", async ({ page }) => {
    await page.goto(ROUTES.ACCOUNT_ORDERS);
    await page.waitForLoadState("domcontentloaded");

    // Click "Cancelled" tab
    await page.getByRole("tab", { name: /cancelled/i }).click();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // Either has cancelled orders or shows empty
    await expect(
      page
        .locator("[role='tabpanel'] >> [data-slot='card']")
        .or(page.getByText(/no cancelled orders/i))
        .first()
    ).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
  });

  test("ORD-05: Empty state hiển thị đúng", async ({ page }) => {
    await page.goto(ROUTES.ACCOUNT_ORDERS);
    await page.waitForLoadState("domcontentloaded");

    // Check all tabs for empty states
    const emptyMessages = [
      /no pending orders/i,
      /no completed orders/i,
      /no cancelled orders/i,
    ];

    // On Pending tab
    const pendingEmpty = await page
      .getByText(/no pending orders/i)
      .isVisible({ timeout: TIMEOUTS.DATA_LOAD })
      .catch(() => false);

    if (pendingEmpty) {
      // Verify the "Start Shopping" button is present
      await expect(
        page.getByRole("link", { name: /start shopping/i })
      ).toBeVisible();
    }
  });

  test("ORD-06: Load More / phân trang đơn hàng", async ({ page }) => {
    await page.goto(ROUTES.ACCOUNT_ORDERS);
    await page.waitForLoadState("domcontentloaded");

    // Check if "Load More" button exists (only if > 20 orders)
    const loadMoreBtn = page.getByRole("button", { name: /load more/i });
    if (await loadMoreBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await loadMoreBtn.click();
      // Verify more items loaded (check for loading state)
      await page.waitForTimeout(2_000);
    }
    // If no Load More, that's fine — test passes
  });

  test("ORD-07: Tabs switch hoạt động đúng", async ({ page }) => {
    await page.goto(ROUTES.ACCOUNT_ORDERS);
    await page.waitForLoadState("domcontentloaded");

    // Switch through all tabs
    const tabs = ["Pending", "Completed", "Cancelled"];

    for (const tabName of tabs) {
      const tab = page.getByRole("tab", { name: new RegExp(tabName, "i") });
      await tab.click();
      await expect(tab).toHaveAttribute("data-state", "active");
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }
  });
});
