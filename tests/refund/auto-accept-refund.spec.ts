import { test, expect, type Page } from "@playwright/test";
import { BUYER_STORAGE, SELLER_STORAGE, TIMEOUTS } from "../fixtures/test-data";

/**
 * ====================================================================
 *  Scenario 6: Kiểm thử luồng tự động (Timeout / Auto-Accept)
 * ====================================================================
 *
 *  Black-box tests for the simulated Auto-Accept E2E flow.
 *  Checks that the UI correctly updates and shows "Refunded" (Accepted)
 *  state after the seller review deadline passes.
 */

test.describe("Kiểm thử luồng tự động (Timeout / Auto-Accept)", () => {

  const MOCK_REFUND_AWAITING = {
    id: "refund-timeout-123",
    account_id: "buyer-id",
    order_id: "order-123",
    reason: "Damaged item. Swapped box.",
    attachments: [],
    date_created: "2026-05-24T12:00:00Z",
    status: "AwaitingSellerReview",
    return_transport_id: 999,
    date_received_by_seller: "2026-05-24T14:00:00Z",
    review_deadline: "2026-05-27T14:00:00Z", // 3 days review window
    seller_decision_at: null,
    return_to_buyer_transport_id: null,
    rejection_reason: null,
    refund_tx_id: null,
  };

  const MOCK_REFUND_ACCEPTED = {
    ...MOCK_REFUND_AWAITING,
    status: "Accepted",
    seller_decision_at: "2026-05-27T14:00:00Z", // Auto-approved
    refund_tx_id: "tx-auto-123",
  };

  test.describe("Phân hệ Người mua (Buyer Dashboard)", () => {
    test.use({ storageState: BUYER_STORAGE });

    async function mockBuyerRefundList(page: Page, refunds: any[]) {
      await page.route("**/api/v1/order/buyer/refund*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: refunds,
            pagination: { total: refunds.length, limit: 20 },
          }),
        });
      });
    }

    test("REF-18: Xác nhận đơn hoàn tiền của Buyer tự động chuyển sang Accepted (Refunded) sau khi quá hạn", async ({ page }) => {
      // 1. Initial State: Awaiting seller review
      await mockBuyerRefundList(page, [MOCK_REFUND_AWAITING]);

      await page.goto("/account/refunds");
      await page.waitForLoadState("domcontentloaded");

      // Verify the initial status on the UI
      await expect(page.getByText("Awaiting seller decision").first()).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

      // 2. Simulated Timeout State: Backend marks it as Accepted (Auto-Accept)
      await mockBuyerRefundList(page, [MOCK_REFUND_ACCEPTED]);

      // Reload the page to simulate query refresh / polling
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // Verify status badge has updated to "Refunded"
      await expect(page.getByText("Refunded").first()).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
      await expect(page.getByText("Awaiting seller decision")).toBeHidden();
    });
  });

  test.describe("Phân hệ Người bán (Seller Dashboard)", () => {
    test.use({ storageState: SELLER_STORAGE });

    async function mockSellerRefundList(page: Page, refunds: any[]) {
      await page.route("**/api/v1/order/seller/refund*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: refunds,
            pagination: { total: refunds.length, limit: 20 },
          }),
        });
      });
    }

    test("REF-19: Xác nhận đơn hoàn tiền phía Seller tự động chuyển sang Accepted (Refunded) sau khi quá hạn", async ({ page }) => {
      // 1. Initial State: Awaiting seller review
      await mockSellerRefundList(page, [MOCK_REFUND_AWAITING]);

      await page.goto("/seller/refunds");
      await page.waitForLoadState("domcontentloaded");

      // Verify initial UI elements
      await expect(page.getByText("Awaiting your review").first()).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
      const approveBtn = page.getByRole("button", { name: /approve refund/i });
      const disputeBtn = page.getByRole("button", { name: /dispute/i });
      await expect(approveBtn).toBeVisible();
      await expect(disputeBtn).toBeVisible();

      // 2. Simulated Timeout State: Backend auto-accepts
      await mockSellerRefundList(page, [MOCK_REFUND_ACCEPTED]);

      // Reload to simulate data refetch
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // Verify the row updates to "Refunded" state
      await expect(page.getByText("Refunded").first()).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
      
      // Approve and Dispute buttons must be hidden now
      await expect(approveBtn).toBeHidden();
      await expect(disputeBtn).toBeHidden();
    });
  });
});
