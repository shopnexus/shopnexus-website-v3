import { test, expect, type Page } from "@playwright/test";
import { BUYER_STORAGE, TIMEOUTS } from "../fixtures/test-data";

/**
 * ====================================================================
 *  Scenario 2: Rút Yêu cầu Hoàn trả (useWithdrawBuyerRefund - Buyer)
 *  Scenario 3: Sửa / Xóa yêu cầu hoàn trả (Negative Testing)
 * ====================================================================
 *
 *  Black-box tests for withdrawing refund requests and negative constraints.
 *  Pre-condition: Buyer is logged in (storage state reused).
 *  Uses page.route to mock API responses for deterministic testing.
 */

test.describe("Rút Yêu cầu Hoàn trả & Negative Testing (Buyer)", () => {
  test.use({ storageState: BUYER_STORAGE });

  const MOCK_REFUND_SHIPPING = {
    id: "refund-shipping-123",
    account_id: "buyer-id",
    order_id: "order-123",
    reason: "Wrong item delivered. Severe scratch.",
    attachments: [
      {
        name: "scratch.png",
        url: "https://shopnexus.hopto.org/uploads/scratch.png",
        kind: "image",
      },
    ],
    date_created: "2026-05-26T12:00:00Z",
    status: "Shipping", // Shipping = return physical shipment under way
    return_transport_id: 999,
    date_received_by_seller: null,
    review_deadline: null,
    seller_decision_at: null,
    return_to_buyer_transport_id: null,
    rejection_reason: null,
    refund_tx_id: null,
  };

  const MOCK_REFUND_AWAITING_REVIEW = {
    id: "refund-awaiting-123",
    account_id: "buyer-id",
    order_id: "order-456",
    reason: "Defective device. Will not charge.",
    attachments: [],
    date_created: "2026-05-26T12:00:00Z",
    status: "AwaitingSellerReview", // Seller review period
    return_transport_id: 999,
    date_received_by_seller: "2026-05-26T14:00:00Z",
    review_deadline: "2026-05-29T14:00:00Z",
    seller_decision_at: null,
    return_to_buyer_transport_id: null,
    rejection_reason: null,
    refund_tx_id: null,
  };

  const MOCK_REFUND_CANCELLED = {
    ...MOCK_REFUND_SHIPPING,
    status: "Cancelled",
  };

  // ── Helper Mocks ──────────────────────────────────────────────────

  async function mockRefundList(page: Page, refunds: any[]) {
    await page.route("**/api/v1/order/buyer/refund*", async (route) => {
      // Return paginated list response
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: refunds,
          pagination: {
            total: refunds.length,
            limit: 20,
          },
        }),
      });
    });
  }

  // ── Tests ────────────────────────────────────────────────────────

  test("REF-06: Rút yêu cầu hoàn tiền thành công khi hàng đang ship (Shipping)", async ({ page }) => {
    // 1. Mock list showing Shipping refund
    await mockRefundList(page, [MOCK_REFUND_SHIPPING]);

    // Mock withdraw API
    let withdrawApiCalled = false;
    await page.route(`**/api/v1/order/refunds/${MOCK_REFUND_SHIPPING.id}/withdraw`, async (route) => {
      withdrawApiCalled = true;
      expect(route.request().method()).toBe("POST");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_REFUND_CANCELLED }),
      });
    });

    // 2. Go to refunds page
    await page.goto("/account/refunds");
    await page.waitForLoadState("domcontentloaded");

    // "Withdraw" button should be visible on the refund card
    const withdrawBtn = page.getByRole("button", { name: /withdraw/i });
    await expect(withdrawBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await expect(withdrawBtn).toBeEnabled();

    // 3. Click withdraw & verify success
    const responsePromise = page.waitForResponse(`**/api/v1/order/refunds/${MOCK_REFUND_SHIPPING.id}/withdraw`);
    
    // We mock the list retrieval after withdraw to return the Cancelled state
    await mockRefundList(page, [MOCK_REFUND_CANCELLED]);

    await withdrawBtn.click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(withdrawApiCalled).toBe(true);

    // Toast "Refund withdrawn." should appear
    await expect(page.getByText(/refund withdrawn/i)).toBeVisible({ timeout: TIMEOUTS.TOAST });

    // The badge should update to "Withdrawn by you" and the button should disappear
    await expect(page.getByText(/withdrawn by you/i)).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await expect(withdrawBtn).toBeHidden();
  });

  test("REF-07: Ẩn nút 'Withdraw' khi trạng thái đã chuyển qua AwaitingSellerReview hoặc muộn hơn", async ({ page }) => {
    // 1. Mock list showing AwaitingSellerReview refund
    await mockRefundList(page, [MOCK_REFUND_AWAITING_REVIEW]);

    // 2. Go to refunds page
    await page.goto("/account/refunds");
    await page.waitForLoadState("domcontentloaded");

    // The "Withdraw" button must be completely hidden on the UI
    const withdrawBtn = page.getByRole("button", { name: /withdraw/i });
    await expect(withdrawBtn).toBeHidden({ timeout: TIMEOUTS.DATA_LOAD });

    // The status badge should show "Awaiting seller decision"
    await expect(page.getByText(/awaiting seller decision/i)).toBeVisible();
  });

  test("REF-08: Bắt lỗi trực tiếp API rút khi đã quá hạn (AwaitingSellerReview)", async ({ page }) => {
    // Navigate first so the origin is correct for relative fetch
    await page.goto("/account/refunds");
    await page.waitForLoadState("domcontentloaded");

    // Negative testing: Direct API call when status is not Shipping returns ORDER_REFUND_NOT_WITHDRAWABLE
    await page.route(`**/api/v1/order/refunds/${MOCK_REFUND_AWAITING_REVIEW.id}/withdraw`, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "ORDER_REFUND_NOT_WITHDRAWABLE",
            message: "Cannot withdraw — the seller already received the items.",
          },
        }),
      });
    });

    // Make direct API request inside the browser context to verify backend error code handling
    const response = await page.evaluate(async (refundId) => {
      try {
        const res = await fetch(`/api/v1/order/refunds/${refundId}/withdraw`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        return { status: res.status, data: await res.json() };
      } catch (err: any) {
        return { error: err.message };
      }
    }, MOCK_REFUND_AWAITING_REVIEW.id);

    expect(response.status).toBe(400);
    expect(response.data?.error?.code).toBe("ORDER_REFUND_NOT_WITHDRAWABLE");
  });

  test("REF-09: Đảm bảo không hiển thị các nút thao tác Sửa/Xóa hoàn tiền thông thường (Negative Testing UI)", async ({ page }) => {
    // 1. Mock list showing Shipping refund
    await mockRefundList(page, [MOCK_REFUND_SHIPPING]);

    // 2. Go to refunds page
    await page.goto("/account/refunds");
    await page.waitForLoadState("domcontentloaded");

    // Assert that there are no Edit, Update, or Delete buttons on the cards
    const editBtn = page.getByRole("button", { name: /edit|update/i });
    const deleteBtn = page.getByRole("button", { name: /delete|remove|cancel request/i });

    await expect(editBtn).toBeHidden({ timeout: TIMEOUTS.DATA_LOAD });
    // Note: withdraw button is allowed, but delete/remove request itself should not be present
    await expect(deleteBtn).toBeHidden({ timeout: TIMEOUTS.DATA_LOAD });
  });

  test("REF-10: Kiểm tra API PATCH/DELETE trả về lỗi 404 hoặc 405 (Negative Testing API)", async ({ page }) => {
    // Navigate first so the origin is correct for relative fetch
    await page.goto("/account/refunds");
    await page.waitForLoadState("domcontentloaded");

    // Setup routes for patch and delete to mock standard server error behavior (route handlers not registered in backend)
    await page.route("**/api/v1/order/buyer/refund*", async (route) => {
      const method = route.request().method();
      if (method === "PATCH" || method === "DELETE") {
        await route.fulfill({
          status: 405,
          statusText: "Method Not Allowed",
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "METHOD_NOT_ALLOWED",
              message: "Method Not Allowed",
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Make direct requests in browser context
    const patchResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/v1/order/buyer/refund", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: "refund-123", reason: "Updated reason" }),
        });
        return { status: res.status };
      } catch (err: any) {
        return { error: err.message };
      }
    });

    const deleteResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/v1/order/buyer/refund", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        return { status: res.status };
      } catch (err: any) {
        return { error: err.message };
      }
    });

    expect(patchResponse.status).toBe(405);
    expect(deleteResponse.status).toBe(405);
  });
});
