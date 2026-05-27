import { test, expect, type Page } from "@playwright/test";
import { SELLER_STORAGE, TIMEOUTS } from "../fixtures/test-data";
import path from "path";

/**
 * ====================================================================
 *  Scenario 4: Xử lý Hoàn trả phía Người bán (Seller Approve / Dispute)
 * ====================================================================
 *
 *  Black-box tests for the seller managing refund requests (Approve or Dispute).
 *  Pre-condition: Seller is logged in (storage state reused).
 *  Uses page.route to mock API responses for deterministic testing.
 */

test.describe("Xử lý Hoàn trả phía Người bán (Seller Approve / Dispute)", () => {
  test.use({ storageState: SELLER_STORAGE });

  const MOCK_REFUND_REVIEWABLE = {
    id: "refund-awaiting-123",
    account_id: "buyer-id",
    order_id: "order-123",
    reason: "Damaged goods. Need immediate refund.",
    attachments: [
      {
        name: "damaged.png",
        url: "https://shopnexus.hopto.org/uploads/damaged.png",
        kind: "image",
      },
    ],
    date_created: "2026-05-26T12:00:00Z",
    status: "AwaitingSellerReview", // AwaitingSellerReview = ready for Seller's decision
    return_transport_id: 999,
    date_received_by_seller: "2026-05-26T14:00:00Z",
    review_deadline: "2026-05-29T14:00:00Z",
    seller_decision_at: null,
    return_to_buyer_transport_id: null,
    rejection_reason: null,
    refund_tx_id: null,
  };

  const MOCK_REFUND_APPROVED = {
    ...MOCK_REFUND_REVIEWABLE,
    status: "Accepted",
    seller_decision_at: "2026-05-27T08:00:00Z",
    refund_tx_id: "tx-999",
  };

  const MOCK_REFUND_DISPUTED = {
    ...MOCK_REFUND_REVIEWABLE,
    status: "Disputed",
    seller_decision_at: "2026-05-27T08:00:00Z",
  };

  // ── Helper Mocks ──────────────────────────────────────────────────

  async function mockSellerRefundList(page: Page, refunds: any[]) {
    await page.route("**/api/v1/order/seller/refund*", async (route) => {
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

  test("REF-11: Người bán phê duyệt hoàn tiền thành công (Approve)", async ({ page }) => {
    // 1. Mock list showing refund awaiting review
    await mockSellerRefundList(page, [MOCK_REFUND_REVIEWABLE]);

    // Mock Approve API
    let approveApiCalled = false;
    await page.route(`**/api/v1/order/refunds/${MOCK_REFUND_REVIEWABLE.id}/approve`, async (route) => {
      approveApiCalled = true;
      expect(route.request().method()).toBe("POST");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_REFUND_APPROVED }),
      });
    });

    // 2. Navigate to seller refunds page
    await page.goto("/seller/refunds");
    await page.waitForLoadState("domcontentloaded");

    // Action buttons should be visible
    const approveBtn = page.getByRole("button", { name: /approve refund/i });
    const disputeBtn = page.getByRole("button", { name: /dispute/i });
    await expect(approveBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await expect(disputeBtn).toBeVisible();

    // 3. Click Approve & verify success
    const responsePromise = page.waitForResponse(`**/api/v1/order/refunds/${MOCK_REFUND_REVIEWABLE.id}/approve`);
    
    // We mock the list retrieval after approve to return the Accepted state
    await mockSellerRefundList(page, [MOCK_REFUND_APPROVED]);

    await approveBtn.click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(approveApiCalled).toBe(true);

    // Toast success should appear
    await expect(page.getByText(/refund approved/i).or(page.getByText(/buyer wallet credited/i))).toBeVisible({
      timeout: TIMEOUTS.TOAST,
    });

    // The badge should update to "Refunded" and action buttons should disappear
    await expect(page.getByText("Refunded").first()).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await expect(approveBtn).toBeHidden();
    await expect(disputeBtn).toBeHidden();
  });

  test("REF-12: Người bán khiếu nại lên Admin thành công (Dispute)", async ({ page }) => {
    // 1. Mock list showing refund awaiting review
    await mockSellerRefundList(page, [MOCK_REFUND_REVIEWABLE]);

    // Mock upload file API
    await page.route("**/api/v1/common/files", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "mock-seller-evidence-id",
            url: "https://shopnexus.hopto.org/uploads/seller-evidence.png",
          },
        }),
      });
    });

    // Mock Dispute API
    let disputeApiCalled = false;
    await page.route(`**/api/v1/order/refunds/${MOCK_REFUND_REVIEWABLE.id}/dispute`, async (route) => {
      disputeApiCalled = true;
      expect(route.request().method()).toBe("POST");
      
      const body = JSON.parse(route.request().postData() || "{}");
      expect(body.reason).toBe("The item has been swapped. Received a brick instead of a phone.");
      expect(body.attachments?.[0]?.url).toBe("https://shopnexus.hopto.org/uploads/seller-evidence.png");

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_REFUND_DISPUTED }),
      });
    });

    // 2. Navigate to seller refunds page
    await page.goto("/seller/refunds");
    await page.waitForLoadState("domcontentloaded");

    // Click "Dispute" button
    const disputeBtn = page.getByRole("button", { name: /dispute/i });
    await expect(disputeBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await disputeBtn.click();

    // Dialog "Dispute Refund" should open
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /dispute refund/i })).toBeVisible();

    // 3. Fill Dispute details
    const reasonInput = dialog.locator("#dispute-reason");
    await reasonInput.fill("The item has been swapped. Received a brick instead of a phone.");

    // Upload evidence image
    const fileChooserPromise = page.waitForEvent("filechooser");
    await dialog.locator("text=Drag & drop images here").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, "../fixtures/sample-evidence.png"));

    // Wait for the upload preview to appear
    await expect(dialog.locator("img[alt='Uploaded image 1']")).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

    // Submit dispute
    const submitBtn = dialog.getByRole("button", { name: /submit dispute/i });
    await expect(submitBtn).toBeEnabled();

    // Trigger API request and wait for the response
    const responsePromise = page.waitForResponse(`**/api/v1/order/refunds/${MOCK_REFUND_REVIEWABLE.id}/dispute`);
    
    // We mock the list retrieval after dispute to return the Disputed state
    await mockSellerRefundList(page, [MOCK_REFUND_DISPUTED]);

    await submitBtn.click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(disputeApiCalled).toBe(true);

    // Toast success should appear
    await expect(page.getByText(/dispute submitted/i).or(page.getByText(/admin will review the case/i))).toBeVisible({
      timeout: TIMEOUTS.TOAST,
    });

    // Dialog should close
    await expect(dialog).toBeHidden();

    // Badge should update to "Disputed"
    await expect(page.getByText("Disputed — admin review").first()).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
  });

  test("REF-13: Kiểm tra bắt lỗi validation trong popup khiếu nại (Dispute Dialog)", async ({ page }) => {
    // 1. Mock list showing refund awaiting review
    await mockSellerRefundList(page, [MOCK_REFUND_REVIEWABLE]);

    // 2. Navigate to seller refunds page
    await page.goto("/seller/refunds");
    await page.waitForLoadState("domcontentloaded");

    // Click "Dispute" button
    const disputeBtn = page.getByRole("button", { name: /dispute/i });
    await expect(disputeBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await disputeBtn.click();

    // Dialog opens
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    const reasonInput = dialog.locator("#dispute-reason");
    const submitBtn = dialog.getByRole("button", { name: /submit dispute/i });

    // Scenario A: Both empty -> disabled
    await expect(submitBtn).toBeDisabled();

    // Scenario B: Fill reason, keep photos empty -> disabled
    await reasonInput.fill("Wrong items returned.");
    await expect(submitBtn).toBeDisabled();

    // Scenario C: Empty reason, upload photos -> disabled
    await reasonInput.fill(""); // clear reason
    
    // Mock upload file API
    await page.route("**/api/v1/common/files", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "mock-seller-evidence-id",
            url: "https://shopnexus.hopto.org/uploads/seller-evidence.png",
          },
        }),
      });
    });

    const fileChooserPromise = page.waitForEvent("filechooser");
    await dialog.locator("text=Drag & drop images here").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, "../fixtures/sample-evidence.png"));

    // Wait for the upload preview
    await expect(dialog.locator("img[alt='Uploaded image 1']")).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

    // Submit button should still be disabled since reason is empty
    await expect(submitBtn).toBeDisabled();

    // Scenario D: Fill both -> enabled
    await reasonInput.fill("Wrong items returned.");
    await expect(submitBtn).toBeEnabled();

    // Close Dialog
    await dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(dialog).toBeHidden();
  });
});
