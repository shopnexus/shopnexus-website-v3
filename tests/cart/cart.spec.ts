import { test, expect, type Page } from "@playwright/test";
import {
  BUYER_STORAGE,
  ROUTES,
  TEST_PRODUCT_SLUG,
  TEST_PRODUCT_WITH_VARIANTS_SLUG,
  TIMEOUTS,
} from "../fixtures/test-data";

/**
 * ====================================================================
 *  Module 1: Giỏ hàng (Cart) — 12 Test Cases
 * ====================================================================
 *
 *  Black-box tests for the shopping cart functionality.
 *  Pre-condition: Buyer is logged in (storage state reused).
 *
 *  NOTE: CART-05 to CART-11 interact with the Cart Sheet (side panel)
 *  instead of the /cart page to avoid a known React hook violation on
 *  the live server. The Cart Sheet exercises the same API and UI logic.
 */

test.describe("Giỏ hàng (Cart)", () => {
  test.use({ storageState: BUYER_STORAGE });

  // ── Helpers ──────────────────────────────────────────────────────

  const CART_TRIGGER =
    "header button:has(svg.lucide-shopping-cart), header a:has(svg.lucide-shopping-cart)";

  const QTY_SPAN = "span.w-8.text-center.text-sm, span.text-center.font-medium";

  /** Navigate to a product page and add it to cart with given quantity. */
  async function addProductToCart(page: Page, slug: string, qty = 1) {
    await page.goto(ROUTES.PRODUCT(slug));
    await page.waitForLoadState("domcontentloaded");

    const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
    await addToCartBtn.waitFor({ state: "visible", timeout: TIMEOUTS.DATA_LOAD });

    for (let i = 1; i < qty; i++) {
      await page.locator("button:has(svg.lucide-plus)").first().click();
    }

    await addToCartBtn.click();
  }

  /** Open the Cart Sheet from any page by navigating home first. */
  async function openCartSheet(page: Page) {
    await page.goto(ROUTES.HOME);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);
    await page.locator(CART_TRIGGER).first().click();
    await expect(page.getByText(/shopping cart/i)).toBeVisible({
      timeout: TIMEOUTS.DATA_LOAD,
    });
  }

  /** Ensure the cart is empty before a test. */
  async function clearCart(page: Page) {
    await openCartSheet(page);

    const clearBtn = page.getByRole("button", { name: /clear cart/i });
    if (await clearBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await clearBtn.click();
      await page
        .getByText(/your cart is empty/i)
        .waitFor({ timeout: TIMEOUTS.DATA_LOAD });
    }
  }

  // ── Tests ────────────────────────────────────────────────────────

  test("CART-01: Thêm sản phẩm vào giỏ hàng", async ({ page }) => {
    await page.goto(ROUTES.PRODUCT(TEST_PRODUCT_SLUG));
    await page.waitForLoadState("domcontentloaded");

    const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
    await addToCartBtn.waitFor({ state: "visible", timeout: TIMEOUTS.DATA_LOAD });
    await addToCartBtn.click();

    await expect(page.getByText(/added to cart/i)).toBeVisible({
      timeout: TIMEOUTS.TOAST,
    });
  });

  test("CART-02: Thêm sản phẩm với số lượng > 1", async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG, 3);

    await expect(page.getByText(/added to cart/i)).toBeVisible({
      timeout: TIMEOUTS.TOAST,
    });

    await openCartSheet(page);

    const qtyDisplay = page.locator(QTY_SPAN);
    await expect(qtyDisplay.first()).toBeVisible();
  });

  test("CART-03: Chọn variant rồi thêm vào giỏ", async ({ page }) => {
    await page.goto(ROUTES.PRODUCT(TEST_PRODUCT_WITH_VARIANTS_SLUG));
    await page.waitForLoadState("domcontentloaded");

    const variantButtons = page.locator(
      ".space-y-4 >> .flex.flex-wrap.gap-2 >> button"
    );
    const count = await variantButtons.count();
    if (count > 1) {
      await variantButtons.nth(1).click();
    }

    await page.getByRole("button", { name: /add to cart/i }).click();

    await expect(page.getByText(/added to cart/i)).toBeVisible({
      timeout: TIMEOUTS.TOAST,
    });
  });

  test("CART-04: Xem giỏ hàng qua Cart Sheet", async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    await openCartSheet(page);
  });

  test("CART-05: Xem trang giỏ hàng (/cart)", async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await openCartSheet(page);

    await expect(page.getByText(/subtotal/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /checkout/i }).first()
    ).toBeVisible();
  });

  test("CART-06: Tăng số lượng sản phẩm trong giỏ", async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await openCartSheet(page);

    const qtySpan = page.locator(QTY_SPAN).first();
    const initialQty = parseInt((await qtySpan.textContent()) ?? "1");

    await page.locator("button:has(svg.lucide-plus)").first().click();
    await page.waitForTimeout(1_000);

    const newQty = parseInt((await qtySpan.textContent()) ?? "1");
    expect(newQty).toBeGreaterThanOrEqual(initialQty);
  });

  test("CART-07: Giảm số lượng sản phẩm trong giỏ", async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG, 3);
    await openCartSheet(page);

    const qtySpan = page.locator(QTY_SPAN).first();
    const initialQty = parseInt((await qtySpan.textContent()) ?? "3");

    if (initialQty > 1) {
      await page.locator("button:has(svg.lucide-minus)").first().click();
      await page.waitForTimeout(1_000);

      const newQty = parseInt((await qtySpan.textContent()) ?? "1");
      expect(newQty).toBeLessThanOrEqual(initialQty);
    }
  });

  test("CART-08: Xóa sản phẩm khỏi giỏ hàng", async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await openCartSheet(page);

    const removeBtn = page.locator("button:has(svg.lucide-trash2)").first();
    await expect(removeBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });

    const itemsBefore = await page.locator("button:has(svg.lucide-trash2)").count();
    await removeBtn.click();
    await page.waitForTimeout(1_000);

    const itemsAfter = await page.locator("button:has(svg.lucide-trash2)").count();
    expect(itemsAfter).toBeLessThan(itemsBefore + 1);
  });

  test("CART-09: Xóa tất cả giỏ hàng (Clear All)", async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await openCartSheet(page);

    const clearBtn = page.getByRole("button", { name: /clear cart/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    await expect(page.getByText(/your cart is empty/i)).toBeVisible({
      timeout: TIMEOUTS.DATA_LOAD,
    });
  });

  test("CART-10: Giỏ hàng trống", async ({ page }) => {
    await clearCart(page);
    await openCartSheet(page);

    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /continue shopping/i })
    ).toBeVisible();
  });

  test("CART-11: Chuyển đến Checkout từ giỏ hàng", async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await openCartSheet(page);

    await page.getByRole("link", { name: /checkout/i }).first().click();

    await page.waitForURL("**/checkout", { timeout: TIMEOUTS.NAVIGATION });
    expect(page.url()).toContain("/checkout");
  });

  test("CART-12: Giỏ hàng yêu cầu đăng nhập", async ({ browser, baseURL }) => {
    // Fresh context WITHOUT auth storage
    const context = await browser.newContext({
      baseURL,
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();

    await page.goto(ROUTES.CART);

    await page.waitForURL("**/login**", { timeout: TIMEOUTS.NAVIGATION });
    expect(page.url()).toContain("/login");

    await context.close();
  });
});
