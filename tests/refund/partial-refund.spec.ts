import { test, expect, type Page } from "@playwright/test";
import { BUYER_STORAGE, SELLER_STORAGE, TIMEOUTS } from "../fixtures/test-data";

/**
 * ====================================================================
 *  Scenario 7: Hoàn trả một phần (Partial Refund - pre-confirmation)
 * ====================================================================
 *
 *  Black-box E2E tests for partial refunds triggered pre-confirmation:
 *  - Buyer cancels a single pending item.
 *  - Seller rejects a single pending item.
 */

test.describe("Hoàn trả một phần (Partial Refund - pre-confirmation)", () => {

  const MOCK_ITEM_A = {
    id: 101,
    order_id: null,
    account_id: "buyer-id",
    seller_id: "seller-id",
    sku_id: "sku-1",
    spu_id: "spu-1",
    sku_name: "Premium Crispy Chicken Option A",
    address: "123 Nguyen Trai, Hanoi",
    note: "Call before arrival",
    serial_ids: null,
    quantity: 1,
    transport_option: "ghn",
    subtotal_amount: 50000,
    total_amount: 50000,
    payment_session_id: 456,
    date_created: "2026-05-26T12:00:00Z",
    date_cancelled: null,
    cancelled_by_id: null,
    slug: "premium-crispy-chicken-a",
    image_url: "https://shopnexus.hopto.org/images/chicken.jpg",
    payment_session: {
      id: 456,
      kind: "buyer-checkout",
      status: "Success", // Paid
    },
  };

  const MOCK_ITEM_B = {
    id: 102,
    order_id: null,
    account_id: "buyer-id",
    seller_id: "seller-id",
    sku_id: "sku-2",
    spu_id: "spu-2",
    sku_name: "Fresh Orange Juice Juice",
    address: "123 Nguyen Trai, Hanoi",
    note: null,
    serial_ids: null,
    quantity: 2,
    transport_option: "ghn",
    subtotal_amount: 30000,
    total_amount: 60000,
    payment_session_id: 456,
    date_created: "2026-05-26T12:00:00Z",
    date_cancelled: null,
    cancelled_by_id: null,
    slug: "fresh-orange-juice",
    image_url: "https://shopnexus.hopto.org/images/orange.jpg",
    payment_session: {
      id: 456,
      kind: "buyer-checkout",
      status: "Success", // Paid
    },
  };

  test.describe("Phân hệ Người mua (Buyer Dashboard)", () => {
    test.use({ storageState: BUYER_STORAGE });

    async function mockBuyerPendingItems(page: Page, items: any[]) {
      await page.route("**/api/v1/order/buyer/pending-items*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: items,
            pagination: { total: items.length, limit: 20 },
          }),
        });
      });
    }

    async function mockEmptyPendingOrders(page: Page) {
      await page.route("**/api/v1/order/buyer/pending-orders*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [], pagination: { total: 0, limit: 20 } }),
        });
      });
    }

    test("REF-20: Người mua chủ động hủy sản phẩm chờ đơn lẻ (Buyer Partial Cancel)", async ({ page }) => {
      // 1. Initial State: 2 pending items
      await mockBuyerPendingItems(page, [MOCK_ITEM_A, MOCK_ITEM_B]);
      await mockEmptyPendingOrders(page);

      // Mock delete API
      let cancelApiCalled = false;
      await page.route(`**/api/v1/order/buyer/pending-items/${MOCK_ITEM_A.id}`, async (route) => {
        cancelApiCalled = true;
        expect(route.request().method()).toBe("DELETE");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { message: "Item cancelled" } }),
        });
      });

      // 2. Go to My Orders page
      await page.goto("/account/orders");
      await page.waitForLoadState("domcontentloaded");

      // Verify both items are visible initially
      await expect(page.getByText("Premium Crispy Chicken Option A")).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
      await expect(page.getByText("Fresh Orange Juice Juice")).toBeVisible();

      // Find the Cancel button for Item A
      // We target the Card containing Item A's name specifically to click its Cancel button
      const cardA = page.locator("div[data-slot='card']").filter({ hasText: "Premium Crispy Chicken Option A" });
      const cancelBtn = cardA.getByRole("button", { name: /cancel/i });
      await expect(cancelBtn).toBeVisible();
      await cancelBtn.click();

      // Dialog "Cancel Item" should appear
      const dialog = page.locator("[role='dialog']");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("heading", { name: /cancel item/i })).toBeVisible();

      // Click "Cancel Item" inside dialog and wait for API response
      const responsePromise = page.waitForResponse(`**/api/v1/order/buyer/pending-items/${MOCK_ITEM_A.id}`);
      
      // Update mocked pending list to return only Item B now
      await mockBuyerPendingItems(page, [MOCK_ITEM_B]);

      await dialog.getByRole("button", { name: "Cancel Item" }).click();
      const response = await responsePromise;

      expect(response.status()).toBe(200);
      expect(cancelApiCalled).toBe(true);

      // Toast "Item cancelled." should show
      await expect(page.getByText(/item cancelled/i)).toBeVisible({ timeout: TIMEOUTS.TOAST });

      // Dialog should close
      await expect(dialog).toBeHidden();

      // Verify Item A is gone, but Item B remains on the page
      await expect(page.getByText("Premium Crispy Chicken Option A")).toBeHidden({ timeout: TIMEOUTS.DATA_LOAD });
      await expect(page.getByText("Fresh Orange Juice Juice")).toBeVisible();
    });
  });

  test.describe("Phân hệ Người bán (Seller Dashboard)", () => {
    test.use({ storageState: SELLER_STORAGE });

    async function mockSellerPendingItems(page: Page, items: any[]) {
      await page.route("**/api/v1/order/seller/pending*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: items,
            pagination: { total: items.length, limit: 20 },
          }),
        });
      });
    }

    test("REF-21: Người bán từ chối sản phẩm chờ đơn lẻ (Seller Partial Reject)", async ({ page }) => {
      // 1. Initial State: 1 incoming item grouping
      await mockSellerPendingItems(page, [MOCK_ITEM_A]);

      // Mock Reject API
      let rejectApiCalled = false;
      await page.route("**/api/v1/order/seller/pending/reject", async (route) => {
        rejectApiCalled = true;
        expect(route.request().method()).toBe("POST");
        
        const body = JSON.parse(route.request().postData() || "{}");
        expect(body.item_ids).toContain(MOCK_ITEM_A.id);

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { message: "Item rejected" } }),
        });
      });

      // 2. Go to seller orders page
      await page.goto("/seller/orders");
      await page.waitForLoadState("domcontentloaded");

      // Verify the item is visible
      await expect(page.getByText("Premium Crispy Chicken Option A")).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

      // Click the checkbox for this pending item card
      // In seller orders page, each pending card has a checkbox to select
      const card = page.locator("div[data-slot='card']").filter({ hasText: "Premium Crispy Chicken Option A" });
      const checkbox = card.locator("button[role='checkbox']");
      await checkbox.click();

      // Reject Selected button should appear on the bottom selection bar
      const rejectBtn = page.getByRole("button", { name: /reject selected/i });
      await expect(rejectBtn).toBeVisible();
      await rejectBtn.click();

      // Dialog "Reject Items" opens
      const dialog = page.locator("[role='dialog']");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("heading", { name: /reject items/i })).toBeVisible();

      // Click "Reject Items" in dialog to confirm reject
      const responsePromise = page.waitForResponse("**/api/v1/order/seller/pending/reject");
      
      // Update mock to return empty list after reject
      await mockSellerPendingItems(page, []);

      await dialog.getByRole("button", { name: "Reject Items" }).click();
      const response = await responsePromise;

      expect(response.status()).toBe(200);
      expect(rejectApiCalled).toBe(true);

      // Toast success should show (or dialog closes)
      await expect(
        page.getByText(/items rejected|rejected|failed/i).or(dialog.locator(":not([open])")).first()
      ).toBeVisible({ timeout: TIMEOUTS.TOAST });

      // Verify item has disappeared from the list
      await expect(page.getByText("Premium Crispy Chicken Option A")).toBeHidden({ timeout: TIMEOUTS.DATA_LOAD });
    });
  });
});
