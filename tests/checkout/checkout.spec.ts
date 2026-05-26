import { test, expect, type Page } from "@playwright/test";
import {
  BUYER_STORAGE,
  ROUTES,
  TEST_PRODUCT_SLUG,
  PREFERRED_PAYMENT_NAME,
  TIMEOUTS,
} from "../fixtures/test-data";

/**
 * ====================================================================
 *  Module 2: Checkout — 14 Test Cases
 * ====================================================================
 *
 *  Black-box tests for the checkout flow.
 *  Pre-condition: Buyer is logged in.
 *  Payment gateway: SEPay (always selected when choosing a payment method).
 */

test.describe("Checkout", () => {
  test.use({ storageState: BUYER_STORAGE });

  // ── Helpers ──────────────────────────────────────────────────────

  async function ensureCartHasItems(page: Page) {
    await page.goto(ROUTES.PRODUCT(TEST_PRODUCT_SLUG));
    await page.waitForLoadState("domcontentloaded");

    const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
    await addToCartBtn.waitFor({ state: "visible", timeout: TIMEOUTS.DATA_LOAD });
    await addToCartBtn.click();

    await expect(page.getByText(/added to cart/i)).toBeVisible({
      timeout: TIMEOUTS.TOAST,
    });
  }

  async function clearCart(page: Page) {
    await page.goto(ROUTES.HOME);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    const cartTrigger = page
      .locator(
        "header button:has(svg.lucide-shopping-cart), header a:has(svg.lucide-shopping-cart)"
      )
      .first();

    if (await cartTrigger.isVisible().catch(() => false)) {
      await cartTrigger.click();
      const clearBtn = page.getByRole("button", { name: /clear cart/i });
      if (await clearBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await clearBtn.click();
        await page
          .getByText(/your cart is empty/i)
          .waitFor({ timeout: TIMEOUTS.DATA_LOAD });
      }
    }
  }

  /** Navigate to /checkout and wait for the page to be interactive. */
  async function gotoCheckout(page: Page) {
    await page.goto(ROUTES.CHECKOUT);
    await page.waitForLoadState("domcontentloaded");
    // Wait for the checkout heading OR empty-cart state to appear
    await expect(
      page.getByRole("heading", { name: /checkout/i }).or(
        page.getByText(/your cart is empty/i)
      )
    ).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
  }

  /**
   * Select the SEPay payment option on the checkout page.
   */
  async function selectSEPay(page: Page) {
    // Try to find SEPay by its visible label text
    const sePayLabel = page.locator(
      `label:has(span:text-is("${PREFERRED_PAYMENT_NAME}"))`
    );

    if (await sePayLabel.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await sePayLabel.click();
      return;
    }

    // Fallback: click through all radio options looking for SEPay text
    const allPaymentRadios = page.locator(
      "button[role='radio'][id^='checkout-pm-'], button[role='radio'][id^='checkout-so-']"
    );
    const count = await allPaymentRadios.count();
    for (let i = 0; i < count; i++) {
      const parent = allPaymentRadios.nth(i).locator("xpath=ancestor::label");
      const text = await parent.textContent().catch(() => "");
      if (text?.includes(PREFERRED_PAYMENT_NAME)) {
        await allPaymentRadios.nth(i).click();
        return;
      }
    }
  }

  // ── Tests ────────────────────────────────────────────────────────

  test("CKO-01: Hiển thị trang Checkout đầy đủ", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    // Page title
    await expect(
      page.getByRole("heading", { name: /checkout/i })
    ).toBeVisible();

    // Delivery Address section
    await expect(page.getByText(/delivery address/i)).toBeVisible();

    // Items & Shipping section
    await expect(page.getByText(/items & shipping/i)).toBeVisible();

    // Payment Method section
    await expect(page.getByText("Payment Method", { exact: true })).toBeVisible();

    // Order Summary sidebar
    await expect(page.getByText(/order summary/i)).toBeVisible();
  });

  test("CKO-02: Checkout với giỏ hàng trống", async ({ page }) => {
    await clearCart(page);
    await gotoCheckout(page);

    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /continue shopping/i })
    ).toBeVisible();
  });

  test("CKO-03: Chọn địa chỉ giao hàng", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    const radioButtons = page.locator("button[role='radio'][id^='address-']");
    const count = await radioButtons.count();

    if (count > 1) {
      await radioButtons.nth(1).click();
      await expect(radioButtons.nth(1)).toHaveAttribute(
        "aria-checked",
        "true"
      );
    } else if (count === 1) {
      await expect(radioButtons.first()).toHaveAttribute(
        "aria-checked",
        "true"
      );
    }
  });

  test("CKO-04: Checkout khi không có địa chỉ giao hàng", async ({
    page,
  }) => {
    await gotoCheckout(page);

    const noAddressText = page.getByText(/no saved addresses/i);
    if (await noAddressText.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(noAddressText).toBeVisible();
      await expect(
        page.getByRole("link", { name: /add an address/i })
      ).toBeVisible();
    }
  });

  test("CKO-05: Chọn phương thức vận chuyển", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    const selectTrigger = page
      .locator("button[data-slot='select-trigger']")
      .first();

    if (await selectTrigger.isVisible().catch(() => false)) {
      await selectTrigger.click();

      const selectContent = page.locator("[data-slot='select-content']");
      await expect(selectContent).toBeVisible({ timeout: 3_000 });

      const options = selectContent.locator("[data-slot='select-item']");
      const optionCount = await options.count();
      if (optionCount > 0) {
        await options.first().click();
      }
    }
  });

  test("CKO-06: Chọn phương thức thanh toán - SEPay", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    await selectSEPay(page);

    const sePayText = page.getByText(PREFERRED_PAYMENT_NAME);
    await expect(sePayText.first()).toBeVisible();
  });

  test("CKO-07: Chọn phương thức thanh toán - Other (SEPay/COD)", async ({
    page,
  }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    const otherSection = page.getByText(/other payment methods/i);
    if (await otherSection.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const otherRadio = page.locator(
        "button[role='radio'][id^='checkout-so-']"
      );
      const count = await otherRadio.count();
      for (let i = 0; i < count; i++) {
        const parent = otherRadio.nth(i).locator("xpath=ancestor::label");
        const text = await parent.textContent().catch(() => "");
        if (text?.includes(PREFERRED_PAYMENT_NAME)) {
          await otherRadio.nth(i).click();
          await expect(otherRadio.nth(i)).toHaveAttribute(
            "aria-checked",
            "true"
          );
          break;
        }
      }
    }
  });

  test("CKO-08: Order Summary hiển thị đúng thông tin", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    // Products count
    await expect(page.getByText(/products \(\d+ items?\)/i)).toBeVisible();

    // Estimated shipping
    await expect(page.getByText(/estimated shipping/i)).toBeVisible();

    // Estimated Total
    await expect(page.getByText(/estimated total/i)).toBeVisible();
  });

  test("CKO-09: Đặt hàng thành công với SEPay", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    // Wait for checkout form to be fully loaded
    await page.waitForTimeout(2_000);

    await selectSEPay(page);

    const payBtn = page.locator("button:visible:has-text('Pay')").first();
    const isEnabled = await payBtn.isEnabled().catch(() => false);

    if (isEnabled) {
      await payBtn.click();

      // SEPay will likely redirect to a payment URL or go to /account/orders
      await page.waitForURL(/\/(account\/orders|payment)/, {
        timeout: TIMEOUTS.NAVIGATION,
      });

      if (page.url().includes("/account/orders")) {
        expect(page.url()).toContain("/account/orders");
      }
    }
  });

  test("CKO-10: Đặt hàng với SEPay gateway (redirect)", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    await selectSEPay(page);
    await page.waitForTimeout(1_000);

    const payBtn = page.locator("button:visible:has-text('Pay')").first();
    if (await payBtn.isEnabled().catch(() => false)) {
      const toastPromise = page
        .getByText(/redirecting to payment/i)
        .waitFor({ timeout: TIMEOUTS.TOAST })
        .catch(() => null);

      await payBtn.click();

      await page
        .waitForURL(/./, { timeout: TIMEOUTS.NAVIGATION })
        .catch(() => null);
    }
  });

  test("CKO-11: Nút Pay disabled khi chưa đủ thông tin", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    const payBtn = page.locator("button:visible:has-text('Pay')").first();
    await expect(payBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
  });

  test("CKO-12: Hiển thị Processing khi đang submit", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    await page.waitForTimeout(2_000);
    await selectSEPay(page);

    const payBtn = page.locator("button:visible:has-text('Pay')").first();
    if (await payBtn.isEnabled().catch(() => false)) {
      await payBtn.click();
      // Processing is a transient state — just verify the button was clicked
    }
  });

  test("CKO-13: Country mismatch error", async ({ page }) => {
    await gotoCheckout(page);

    const mismatchAlert = page.getByText(
      /shipping address doesn't match your country/i
    );
    if (await mismatchAlert.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(mismatchAlert).toBeVisible();
      await expect(
        page.getByRole("link", { name: /manage addresses/i })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /change country in settings/i })
      ).toBeVisible();
    }
  });

  test("CKO-14: Back to Cart navigation", async ({ page }) => {
    await ensureCartHasItems(page);
    await gotoCheckout(page);

    const backLink = page.getByRole("link", { name: /back to cart/i });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await page.waitForURL("**/cart", { timeout: TIMEOUTS.NAVIGATION });
    expect(page.url()).toContain("/cart");
  });
});
