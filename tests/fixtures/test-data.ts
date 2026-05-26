/**
 * Test data constants for ShopNexus black-box tests.
 *
 * ⚠️  Update these values to match your actual test environment.
 *     The credentials below are placeholders — replace them with
 *     real accounts that exist in your database.
 */

// ===== Accounts =====

export const BUYER = {
  /** Login identifier (email, phone, or username) */
  id: "truongtuantu@gmail.com",
  password: "123123123",
} as const;

export const SELLER = {
  id: "bob@shopnexus.test",
  password: "123123123",
} as const;

// ===== Products =====

/** A product slug that is known to exist in the DB and has stock > 0. */
export const TEST_PRODUCT_SLUG = "kho-ga-do-micky.262b307b-3ecc-4344-8f26-d94230167e16";

/** A product slug that has multiple SKU variants (e.g. size + color). */
export const TEST_PRODUCT_WITH_VARIANTS_SLUG = "kho-ga-do-micky.262b307b-3ecc-4344-8f26-d94230167e16";

// ===== Payment =====

/**
 * The payment method name to always select during checkout / seller confirm.
 * Must match the `name` field of a service option returned by the backend.
 */
export const PREFERRED_PAYMENT_NAME = "SEPay";

// ===== Storage state paths =====

export const BUYER_STORAGE = "tests/.auth/buyer.json";
export const SELLER_STORAGE = "tests/.auth/seller.json";

// ===== Routes =====

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PRODUCT: (slug: string) => `/product/${slug}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  PAYMENT_RESULT: "/payment/result",
  ACCOUNT_ORDERS: "/account/orders",
  ACCOUNT_ADDRESSES: "/account/addresses",
  SELLER_DASHBOARD: "/seller",
  SELLER_ORDERS: "/seller/orders",
  SELLER_PRODUCTS: "/seller/products",
  SELLER_REFUNDS: "/seller/refunds",
  SELLER_DISPUTES: "/seller/disputes",
  SELLER_PROMOTIONS: "/seller/promotions",
  SELLER_SETTINGS: "/seller/settings",
} as const;

// ===== Timeouts =====

export const TIMEOUTS = {
  /** Wait for network-dependent data to appear */
  DATA_LOAD: 10_000,
  /** Wait for toast to appear */
  TOAST: 5_000,
  /** Wait for navigation after action */
  NAVIGATION: 15_000,
  /** Short delay for UI animations */
  ANIMATION: 500,
} as const;
