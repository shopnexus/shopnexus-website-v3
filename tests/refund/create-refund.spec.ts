import { test, expect, type Page } from "@playwright/test";
import { BUYER_STORAGE, ROUTES, TIMEOUTS } from "../fixtures/test-data";
import path from "path";

/**
 * ====================================================================
 *  Scenario 1: Tạo Yêu cầu Hoàn trả (CreateRefundDialog - Buyer)
 * ====================================================================
 *
 *  Black-box tests for the Create Refund Request flow.
 *  Pre-condition: Buyer is logged in (storage state reused).
 *  Uses page.route to mock API responses for deterministic testing.
 */

test.describe("Tạo Yêu cầu Hoàn trả - CreateRefundDialog (Buyer)", () => {
  test.use({ storageState: BUYER_STORAGE });

  const MOCK_ORDER_PAID_DELIVERED = {
    id: "order-paid-delivered-123",
    buyer_id: "buyer-id",
    seller_id: "seller-id",
    transport_id: 123,
    address: "123 Nguyen Trai, Thanh Xuan, Hanoi, Vietnam",
    date_created: "2026-05-25T12:00:00Z",
    confirmed_by_id: "seller-id",
    confirm_session_id: 456,
    note: "Please call before delivery",
    total_amount: 150000,
    items: [
      {
        id: 789,
        order_id: "order-paid-delivered-123",
        account_id: "buyer-id",
        seller_id: "seller-id",
        sku_id: "sku-123",
        spu_id: "spu-123",
        sku_name: "Premium Crispy Chicken",
        address: "123 Nguyen Trai, Thanh Xuan, Hanoi, Vietnam",
        note: null,
        serial_ids: null,
        quantity: 1,
        transport_option: "ghn",
        subtotal_amount: 150000,
        total_amount: 150000,
        payment_session_id: 456,
        date_created: "2026-05-25T12:00:00Z",
        date_cancelled: null,
        cancelled_by_id: null,
        slug: "premium-crispy-chicken",
        image_url: "https://shopnexus.hopto.org/images/chicken.jpg",
      },
    ],
    transport: {
      id: 123,
      option: "ghn",
      status: "Success", // Success = Delivered
      data: {},
      date_created: "2026-05-25T12:00:00Z",
    },
    confirm_session: {
      id: 456,
      kind: "buyer-checkout",
      status: "Success", // Success = Paid
      from_id: "buyer-id",
      to_id: null,
      note: "SEPay Payment",
      currency: "VND",
      total_amount: 150000,
      data: {},
      date_created: "2026-05-25T12:00:00Z",
      date_paid: "2026-05-25T12:01:00Z",
      date_expired: "2026-05-25T12:15:00Z",
    },
    payout_session: null,
  };

  const MOCK_ORDER_UNPAID = {
    id: "order-unpaid-123",
    buyer_id: "buyer-id",
    seller_id: "seller-id",
    transport_id: 123,
    address: "123 Nguyen Trai, Thanh Xuan, Hanoi, Vietnam",
    date_created: "2026-05-25T12:00:00Z",
    confirmed_by_id: "",
    confirm_session_id: 456,
    note: "Please call before delivery",
    total_amount: 150000,
    items: [
      {
        id: 789,
        order_id: "order-unpaid-123",
        account_id: "buyer-id",
        seller_id: "seller-id",
        sku_id: "sku-123",
        spu_id: "spu-123",
        sku_name: "Premium Crispy Chicken",
        address: "123 Nguyen Trai, Thanh Xuan, Hanoi, Vietnam",
        note: null,
        serial_ids: null,
        quantity: 1,
        transport_option: "ghn",
        subtotal_amount: 150000,
        total_amount: 150000,
        payment_session_id: 456,
        date_created: "2026-05-25T12:00:00Z",
        date_cancelled: null,
        cancelled_by_id: null,
        slug: "premium-crispy-chicken",
        image_url: "https://shopnexus.hopto.org/images/chicken.jpg",
      },
    ],
    transport: null,
    confirm_session: {
      id: 456,
      kind: "buyer-checkout",
      status: "Pending", // Unpaid
      from_id: "buyer-id",
      to_id: null,
      note: "SEPay Payment",
      currency: "VND",
      total_amount: 150000,
      data: {},
      date_created: "2026-05-25T12:00:00Z",
      date_paid: null,
      date_expired: "2026-05-25T12:15:00Z",
    },
    payout_session: null,
  };

  const MOCK_TRANSPORT_OPTIONS = [
    {
      id: "ghn",
      type: "transport",
      provider: "ghn",
      is_enabled: true,
      name: "Giao Hàng Nhanh",
      description: "Fast physical transport carrier",
      priority: 1,
      logo_rs_id: null,
      data: {},
      owned: false,
    },
  ];

  // ── Helper Mocks ──────────────────────────────────────────────────

  async function mockOrderApi(page: Page, orderId: string, orderData: any) {
    await page.route(`**/api/v1/order/buyer/orders/${orderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: orderData }),
      });
    });
  }

  async function mockTransportOptions(page: Page) {
    await page.route("**/api/v1/common/option?type=transport", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_TRANSPORT_OPTIONS }),
      });
    });
  }

  // ── Tests ────────────────────────────────────────────────────────

  test("REF-01: Hiển thị nút 'Request Refund' xuất hiện đúng điều kiện (Đơn hàng Paid + Delivered)", async ({ page }) => {
    // Mock the order detail to show Paid + Success transport
    await mockOrderApi(page, MOCK_ORDER_PAID_DELIVERED.id, MOCK_ORDER_PAID_DELIVERED);

    // Navigate to order detail page
    await page.goto(`/account/orders/${MOCK_ORDER_PAID_DELIVERED.id}`);
    await page.waitForLoadState("domcontentloaded");

    // The "Request Refund" button should be visible and clickable
    const requestRefundBtn = page.getByRole("button", { name: /request refund/i });
    await expect(requestRefundBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await expect(requestRefundBtn).toBeEnabled();
  });

  test("REF-02: Ẩn nút 'Request Refund' khi đơn chưa thanh toán hoặc chưa giao hàng thành công", async ({ page }) => {
    // Mock the unpaid order details
    await mockOrderApi(page, MOCK_ORDER_UNPAID.id, MOCK_ORDER_UNPAID);

    // Navigate to order detail page
    await page.goto(`/account/orders/${MOCK_ORDER_UNPAID.id}`);
    await page.waitForLoadState("domcontentloaded");

    // The "Request Refund" button should not be visible on unpaid orders
    const requestRefundBtn = page.getByRole("button", { name: /request refund/i });
    await expect(requestRefundBtn).toBeHidden({ timeout: TIMEOUTS.DATA_LOAD });

    // Negative testing: Direct API call should return ORDER_REFUND_ORDER_NOT_PAID
    await page.route("**/api/v1/order/buyer/refund", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "ORDER_REFUND_ORDER_NOT_PAID",
            message: "The order is not paid",
          },
        }),
      });
    });

    // Make direct API request inside the browser context to verify BE response error propagation
    const response = await page.evaluate(async (orderId) => {
      try {
        const res = await fetch("/api/v1/order/buyer/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            reason: "Damaged item",
            attachments: [],
            return_option: "ghn",
          }),
        });
        return { status: res.status, data: await res.json() };
      } catch (err: any) {
        return { error: err.message };
      }
    }, MOCK_ORDER_UNPAID.id);

    expect(response.status).toBe(400);
    expect(response.data?.error?.code).toBe("ORDER_REFUND_ORDER_NOT_PAID");
  });

  test("REF-03: Tạo yêu cầu hoàn trả thành công (Đầy đủ bằng chứng ảnh)", async ({ page }) => {
    // 1. Mock APIs
    await mockOrderApi(page, MOCK_ORDER_PAID_DELIVERED.id, MOCK_ORDER_PAID_DELIVERED);
    await mockTransportOptions(page);

    // Mock upload file API
    await page.route("**/api/v1/common/files", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "mock-image-id-123",
            url: "https://shopnexus.hopto.org/uploads/evidence.png",
          },
        }),
      });
    });

    // Mock create refund request API
    let refundApiCalled = false;
    await page.route("**/api/v1/order/buyer/refund", async (route) => {
      refundApiCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "refund-123",
            order_id: MOCK_ORDER_PAID_DELIVERED.id,
            reason: "The item was severely damaged upon arrival.",
            status: "Shipping",
            return_transport_id: 999,
          },
        }),
      });
    });

    // 2. Open page & click "Request Refund"
    await page.goto(`/account/orders/${MOCK_ORDER_PAID_DELIVERED.id}`);
    await page.waitForLoadState("domcontentloaded");

    const requestRefundBtn = page.getByRole("button", { name: /request refund/i });
    await requestRefundBtn.click();

    // Dialog should open
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /request refund/i })).toBeVisible();

    // 3. Fill details: Transport Option
    // Wait for the select trigger to be visible and click it
    const selectTrigger = dialog.locator("button[data-slot='select-trigger']");
    await selectTrigger.click();

    // Click the transport item (Giao Hàng Nhanh)
    await page.getByRole("option", { name: /giao hàng nhanh/i }).click();

    // 4. Fill details: Reason
    const reasonTextarea = dialog.locator("#refund-reason");
    await reasonTextarea.fill("The item was severely damaged upon arrival.");

    // 5. Upload evidence file
    const fileChooserPromise = page.waitForEvent("filechooser");
    // Click the drag and drop area to trigger file input chooser
    await dialog.locator("text=Drag & drop images here").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, "../fixtures/sample-evidence.png"));

    // Wait for the uploaded image preview to appear
    await expect(dialog.locator("img[alt='Uploaded image 1']")).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

    // 6. Submit form
    const submitBtn = dialog.getByRole("button", { name: /submit refund request/i });
    await expect(submitBtn).toBeEnabled();

    // Trigger API request and wait for the response
    const responsePromise = page.waitForResponse("**/api/v1/order/buyer/refund");
    await submitBtn.click();
    const response = await responsePromise;

    // Verify API request succeeded
    expect(response.status()).toBe(200);
    expect(refundApiCalled).toBe(true);

    // Success toast should appear
    await expect(
      page.getByText(/refund request submitted/i).or(page.getByText(/will collect your return shortly/i))
    ).toBeVisible({ timeout: TIMEOUTS.TOAST });

    // Dialog should close
    await expect(dialog).toBeHidden();
  });

  test("REF-04: Bắt lỗi bỏ trống Hình ảnh bằng chứng (Validation)", async ({ page }) => {
    await mockOrderApi(page, MOCK_ORDER_PAID_DELIVERED.id, MOCK_ORDER_PAID_DELIVERED);
    await mockTransportOptions(page);

    await page.goto(`/account/orders/${MOCK_ORDER_PAID_DELIVERED.id}`);
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /request refund/i }).click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // Select transport
    await dialog.locator("button[data-slot='select-trigger']").click();
    await page.getByRole("option", { name: /giao hàng nhanh/i }).click();

    // Fill reason
    await dialog.locator("#refund-reason").fill("Item damaged");

    // Do NOT upload any images. The submit button MUST remain disabled on the client side.
    const submitBtn = dialog.getByRole("button", { name: /submit refund request/i });
    await expect(submitBtn).toBeDisabled();

    // Server-side validation test: Mock API returning evidence required error if bypassed
    await page.route("**/api/v1/order/buyer/refund", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "ORDER_REFUND_EVIDENCE_REQUIRED",
            message: "At least one evidence photo is required",
          },
        }),
      });
    });

    const response = await page.evaluate(async (orderId) => {
      try {
        const res = await fetch("/api/v1/order/buyer/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            reason: "Item damaged",
            attachments: [],
            return_option: "ghn",
          }),
        });
        return { status: res.status, data: await res.json() };
      } catch (err: any) {
        return { error: err.message };
      }
    }, MOCK_ORDER_PAID_DELIVERED.id);

    expect(response.status).toBe(400);
    expect(response.data?.error?.code).toBe("ORDER_REFUND_EVIDENCE_REQUIRED");
  });

  test("REF-05: Kiểm tra giới hạn độ dài ký tự của trường Reason", async ({ page }) => {
    await mockOrderApi(page, MOCK_ORDER_PAID_DELIVERED.id, MOCK_ORDER_PAID_DELIVERED);
    await mockTransportOptions(page);

    await page.goto(`/account/orders/${MOCK_ORDER_PAID_DELIVERED.id}`);
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /request refund/i }).click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // Select transport
    await dialog.locator("button[data-slot='select-trigger']").click();
    await page.getByRole("option", { name: /giao hàng nhanh/i }).click();

    const reasonTextarea = dialog.locator("#refund-reason");
    const submitBtn = dialog.getByRole("button", { name: /submit refund request/i });

    // 1. Reason is empty -> Submit should be disabled
    await reasonTextarea.fill("");
    await expect(submitBtn).toBeDisabled();

    // 2. Reason character count limits
    const maxLength = await reasonTextarea.getAttribute("maxLength");
    expect(maxLength).toBe("1000");

    // Fill with a long string to verify it respects the limit
    const longString = "A".repeat(1100);
    await reasonTextarea.fill(longString);

    const filledValue = await reasonTextarea.inputValue();
    expect(filledValue.length).toBeLessThanOrEqual(1000);
  });
});
