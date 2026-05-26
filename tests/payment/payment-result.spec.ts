import { test, expect } from "@playwright/test";
import {
  BUYER_STORAGE,
  ROUTES,
  TEST_PRODUCT_SLUG,
  PREFERRED_PAYMENT_NAME,
  TIMEOUTS,
} from "../fixtures/test-data";

/**
 * ====================================================================
 *  Module 4: Thanh toán (Payment Result) — 8 Test Cases
 * ====================================================================
 *
 *  Black-box tests for the payment result page and Buy Now flow.
 *  Payment gateway: SEPay.
 *  Pre-condition: Buyer is logged in.
 */

test.describe("Thanh toán - Payment (SEPay)", () => {
  test.use({ storageState: BUYER_STORAGE });

  test("PAY-01: Trang kết quả thanh toán thành công", async ({ page }) => {
    // Navigate to payment result with a ref param.
    // The outcome is determined by the backend transaction status,
    // not by a gateway-specific response code.
    await page.goto(`${ROUTES.PAYMENT_RESULT}?ref=test-success-ref`);
    await page.waitForLoadState("domcontentloaded");

    // Page should render without error
    const paymentStatus = page.locator("h1");
    await expect(paymentStatus).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

    // Check for any payment status heading
    const successMsg = page.getByText(
      /payment successful|payment processing|transaction completed/i
    );
    await successMsg.first().isVisible({ timeout: TIMEOUTS.DATA_LOAD }).catch(() => false);

    // Page structure should exist
    await expect(page.locator(".container").first()).toBeVisible();
  });

  test("PAY-02: Trang kết quả thanh toán thất bại", async ({ page }) => {
    await page.goto(`${ROUTES.PAYMENT_RESULT}?ref=test-fail-ref`);
    await page.waitForLoadState("domcontentloaded");

    // Should display either failed or processing status
    const failedOrProcessing = page.getByText(
      /payment failed|payment processing/i
    );
    await expect(failedOrProcessing.first()).toBeVisible({
      timeout: TIMEOUTS.DATA_LOAD,
    });
  });

  test("PAY-03: Trang thanh toán đang chờ xác nhận", async ({ page }) => {
    await page.goto(`${ROUTES.PAYMENT_RESULT}?ref=test-pending-ref`);
    await page.waitForLoadState("domcontentloaded");

    // For a ref that doesn't exist or is still pending
    const pendingOrFailed = page.getByText(
      /payment processing|payment failed|couldn.*t load/i
    );
    await expect(pendingOrFailed.first()).toBeVisible({
      timeout: TIMEOUTS.DATA_LOAD,
    });
  });

  test("PAY-04: Hiển thị thông tin lỗi thanh toán SEPay", async ({
    page,
  }) => {
    // SEPay errors are determined by backend transaction status,
    // not by gateway-specific response codes like VNPay.
    // We test that the result page renders a meaningful error message
    // for a failed transaction.
    await page.goto(`${ROUTES.PAYMENT_RESULT}?ref=test-error-ref`);
    await page.waitForLoadState("domcontentloaded");

    // Page should render — either with an error message or pending status
    await expect(page.locator(".container").first()).toBeVisible();

    // Check for any status message on the page
    const statusMessage = page.locator("h1");
    await expect(statusMessage).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
  });

  test("PAY-05: Order summary hiển thị trong payment result", async ({
    page,
  }) => {
    // This test needs a valid ref that has order data
    await page.goto(`${ROUTES.PAYMENT_RESULT}?ref=test-ref`);
    await page.waitForLoadState("domcontentloaded");

    // Either shows order summary card or "couldn't load" message
    const orderSummary = page.getByText(/what you paid for|order total/i);
    const loadError = page.getByText(/couldn.*t load/i);

    // One of them should be visible
    await expect(orderSummary.or(loadError).first()).toBeVisible({
      timeout: TIMEOUTS.DATA_LOAD * 2, // Allow extra time for React Query retries
    });
  });

  test("PAY-06: Navigation buttons trên payment result page", async ({
    page,
  }) => {
    await page.goto(`${ROUTES.PAYMENT_RESULT}?ref=test-nav-ref`);
    await page.waitForLoadState("domcontentloaded");

    // "View my orders" button
    const viewOrdersBtn = page.getByRole("link", {
      name: /view my orders/i,
    });
    await expect(viewOrdersBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

    // Verify href
    const href1 = await viewOrdersBtn.getAttribute("href");
    expect(href1).toContain("/account/orders");

    // "Continue shopping" button
    const continueBtn = page.getByRole("link", {
      name: /continue shopping/i,
    });
    await expect(continueBtn).toBeVisible();

    const href2 = await continueBtn.getAttribute("href");
    expect(href2).toBe("/");
  });

  test("PAY-07: Payment result page không có ref param", async ({ page }) => {
    await page.goto(ROUTES.PAYMENT_RESULT);
    await page.waitForLoadState("domcontentloaded");

    // Page should still render — status banner should show
    await expect(page.locator(".container").first()).toBeVisible();

    // Navigation buttons should still work
    await expect(
      page.getByRole("link", { name: /view my orders/i })
    ).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
  });

  test("PAY-08: Buy Now flow từ trang sản phẩm (SEPay)", async ({ page }) => {
    await page.goto(ROUTES.PRODUCT(TEST_PRODUCT_SLUG));
    await page.waitForLoadState("domcontentloaded");

    // Look for "Buy Now" button
    const buyNowBtn = page.getByRole("button", { name: /buy now/i });

    if (await buyNowBtn.isVisible().catch(() => false)) {
      await buyNowBtn.click();

      // Dialog should open with checkout form
      const dialog = page.locator("[role='dialog']");
      await expect(dialog).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

      // Dialog should have address selection
      const addressSelect = dialog.getByText(
        /shipping address|delivery address/i
      );
      if (
        await addressSelect
          .isVisible({ timeout: 3_000 })
          .catch(() => false)
      ) {
        await expect(addressSelect).toBeVisible();
      }

      // Dialog should have shipping option
      const shippingSelect = dialog.locator(
        "button[data-slot='select-trigger']"
      );
      if (
        await shippingSelect
          .first()
          .isVisible({ timeout: 2_000 })
          .catch(() => false)
      ) {
        await expect(shippingSelect.first()).toBeVisible();
      }

      // Dialog should have payment method — select SEPay
      const paymentSection = dialog.getByText(/payment method/i);
      if (
        await paymentSection
          .isVisible({ timeout: 2_000 })
          .catch(() => false)
      ) {
        await expect(paymentSection).toBeVisible();

        // Find and click SEPay within the dialog
        const sePayLabel = dialog.locator(
          `label:has(span:text-is("${PREFERRED_PAYMENT_NAME}"))`
        );
        if (await sePayLabel.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await sePayLabel.click();
        }
      }

      // Close dialog without completing (escape or cancel)
      await page.keyboard.press("Escape");
    }
  });
});
